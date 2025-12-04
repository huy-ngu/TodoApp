import { boards, lists, cards, inboxData, cardsInbox, themeColors, boardThemeColors } from "../Entity.js";
import * as Actions from './actions.js';
import { closeAllDropdowns, showToast } from './utils.js';

let cardModal = {};
let currentCardContext = null;
let viewState = { board: true, inbox: true };
let DEFAULT_BOARD_ID = '';
let currentUser = null;

// --- INITIALIZER ---
export function initializeUI(boardId, user) {
    DEFAULT_BOARD_ID = boardId;
    currentUser = user;

    setupViewSwitch();
    setupMainButtons();
    setupCardModal();
    setupHeaderDropdown();
    setupInboxDropdown();
    setupArchivedModal();
    
    // Global click listener to close dropdowns
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".list__action-wrapper, .inbox-action-wrapper, .header-action-wrapper")) {
            closeAllDropdowns();
        }
    });

    renderAll();
}

// --- RENDER FUNCTIONS ---
function renderAll() {
    renderBoard();
    renderInbox();
}

function renderBoard() {
    const board = boards.find((b) => b.id === DEFAULT_BOARD_ID);
    if (!board) return;

    document.getElementById("board-title").textContent = board.title;
    document.body.style.background = board.theme;
    updateStarButton(board.starred);

    const boardRoot = document.getElementById("board-root");
    const scrollPositions = {}; // Preserve scroll positions
    boardRoot.querySelectorAll('.list').forEach(listEl => {
        const listId = listEl.dataset.listId;
        scrollPositions[listId] = listEl.querySelector('.list__cards')?.scrollTop;
    });

    boardRoot.innerHTML = "";
    lists.filter(l => l.boardId === DEFAULT_BOARD_ID && !l.storage).forEach(list => {
        boardRoot.appendChild(createList(list));
    });

    // Restore scroll positions
    boardRoot.querySelectorAll('.list').forEach(listEl => {
        const listId = listEl.dataset.listId;
        if (scrollPositions[listId]) {
            listEl.querySelector('.list__cards').scrollTop = scrollPositions[listId];
        }
    });
}

function renderInbox() {
    document.getElementById("inbox-title").textContent = inboxData.title;
    document.getElementById("inbox-description").textContent = inboxData.description;

    const inboxPanel = document.getElementById("inbox-panel");
    inboxPanel.style.backgroundColor = themeColors[inboxData.theme] || themeColors.green;
    inboxPanel.dataset.theme = inboxData.theme;

    const inboxRoot = document.getElementById("inbox-root");
    const scrollPosition = inboxRoot.scrollTop;
    inboxRoot.innerHTML = "";
    cardsInbox.filter(c => c.userId === currentUser.id && !c.storage).forEach(card => {
        inboxRoot.appendChild(createCard(card, { source: "inbox" }));
    });
    inboxRoot.scrollTop = scrollPosition;
}


// --- COMPONENT CREATION ---
function createList(list) {
    const template = document.getElementById("list-template").content.cloneNode(true);
    const listEl = template.querySelector(".list");
    listEl.dataset.listId = list.id;
    listEl.style.backgroundColor = themeColors[list.theme] || themeColors.blue;
    listEl.dataset.theme = list.theme;

    const titleEl = template.querySelector(".list__title");
    const inputEl = template.querySelector(".list-title-input");
    titleEl.textContent = list.title;
    inputEl.id = `input-${list.id}`;
    
    // --- Inline Edit Logic ---
    titleEl.addEventListener('click', () => {
        titleEl.style.display = 'none';
        inputEl.style.display = 'inline-block';
        inputEl.value = titleEl.textContent;
        inputEl.focus();
        inputEl.select();
    });

    const saveTitle = () => {
        const newTitle = inputEl.value;
        Actions.updateListTitle(list.id, newTitle);
        titleEl.textContent = newTitle.trim() ? newTitle : titleEl.textContent; // Update UI immediately
        inputEl.style.display = 'none';
        titleEl.style.display = 'inline-block';
    };

    inputEl.addEventListener('blur', saveTitle);
    inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            saveTitle();
        }
    });
    // --- End Inline Edit ---
    
    const cardsContainer = template.querySelector(".list__cards");
    cards.filter(c => c.listId === list.id && !c.storage).forEach(card => {
        cardsContainer.appendChild(createCard(card, { source: "board", listId: list.id }));
    });

    template.querySelector(".list__add-card").addEventListener("click", () => {
        if (Actions.addCard(list.id, DEFAULT_BOARD_ID, currentUser)) renderBoard();
    });
    
    setupListDropdown(template, list);
    return template;
}

function createCard(card, context) {
    const template = document.getElementById("card-template").content.cloneNode(true);
    const cardEl = template.querySelector(".card");
    cardEl.querySelector(".card__title").textContent = card.title;
    const footerEl = cardEl.querySelector(".card__footer");
    if (card.dueDate) {
        footerEl.textContent = `Hạn: ${new Date(card.dueDate).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}`;
    } else {
        footerEl.textContent = '';
    }

    cardEl.addEventListener("click", (e) => {
        if (e.target.closest(".card__toggle, .status-pill")) return;
        const newContext = { ...context, cardId: card.id };
        openCardModal(newContext);
    });

    // Status controls
    const statusBadge = document.createElement("span");
    statusBadge.className = "status-pill";
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "card__toggle";
    const statusRow = document.createElement("div");
    statusRow.className = "card__status";
    statusRow.append(statusBadge, toggleBtn);
    cardEl.querySelector(".card__footer").insertAdjacentElement("afterend", statusRow);

    updateStatusStyles(card, statusBadge, toggleBtn);

    toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const newContext = { ...context, cardId: card.id };
        Actions.toggleCardStatus(newContext);
        renderAll();
    });

    statusBadge.addEventListener("click", (e) => {
        e.stopPropagation();
        if (card.status === 'done') {
            const newContext = { ...context, cardId: card.id };
            if (Actions.moveCardToStorage(newContext)) {
                renderAll();
            }
        }
    });

    return template;
}

function updateStatusStyles(card, badgeEl, toggleBtn) {
    const isDone = card.status === "done";
    badgeEl.classList.toggle("is-done", isDone);
    toggleBtn.classList.toggle("is-done", isDone);
    toggleBtn.textContent = isDone ? "Bỏ hoàn thành" : "Đánh dấu xong";
    badgeEl.textContent = isDone ? "Lưu trữ" : "Chưa xong";
    badgeEl.style.cursor = isDone ? "pointer" : "default";
    badgeEl.classList.toggle("storage-action", isDone);
}

// --- MAIN BUTTONS & VIEW ---
function setupViewSwitch() {
    const wrapper = document.getElementById("view-wrapper");
    const boardPanel = document.getElementById("board-panel");
    const inboxPanel = document.getElementById("inbox-panel");
    document.querySelectorAll(".view-switch__btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const view = btn.dataset.view;
            viewState[view] = !viewState[view];
            if (!viewState.board && !viewState.inbox) viewState[view] = true; // Ensure at least one view is active
            
            wrapper.dataset.mode = viewState.board && viewState.inbox ? "split" : viewState.board ? "board" : "inbox";
            boardPanel.classList.toggle("is-hidden", !viewState.board);
            inboxPanel.classList.toggle("is-hidden", !viewState.inbox);

            document.querySelectorAll(".view-switch__btn").forEach(b => b.classList.toggle('is-active', viewState[b.dataset.view]));
        });
    });
}

function setupMainButtons() {
    document.getElementById("add-list-btn")?.addEventListener("click", () => {
        if (Actions.addList(DEFAULT_BOARD_ID, currentUser)) renderBoard();
    });
    document.getElementById("star-board-btn")?.addEventListener("click", () => {
        if (Actions.toggleBoardStar(DEFAULT_BOARD_ID)) renderBoard();
    });
    document.getElementById("add-inbox-card")?.addEventListener("click", () => {
        if (Actions.addInboxCard(currentUser)) renderInbox();
    });
}

function updateStarButton(isStarred) {
    const starBtn = document.getElementById("star-board-btn");
    if (!starBtn) return;
    const starIcon = starBtn.querySelector(".star-icon");
    starIcon.textContent = isStarred ? "★" : "☆";
    starBtn.classList.toggle("is-starred", isStarred);
}

// --- DROPDOWNS ---
function setupListDropdown(template, list) {
    const actionBtn = template.querySelector(".list__action");
    const dropdown = template.querySelector(".list__dropdown");
    const themeContainer = template.querySelector(".theme-colors");

    Object.keys(themeColors).forEach(themeKey => {
        const colorItem = document.createElement("div");
        colorItem.className = "theme-color-item";
        colorItem.style.backgroundColor = themeColors[themeKey];
        if (list.theme === themeKey) colorItem.classList.add("active");
        colorItem.addEventListener("click", (e) => {
            e.stopPropagation();
            Actions.updateListTheme(list.id, themeKey);
            renderBoard();
            closeAllDropdowns();
        });
        themeContainer.appendChild(colorItem);
    });

    actionBtn.addEventListener("click", e => {
        e.stopPropagation();
        closeAllDropdowns();
        dropdown.style.display = "block";
    });
    
    template.querySelector('[data-action="store-list"]')?.addEventListener("click", e => {
        e.stopPropagation();
        Actions.moveListToStorage(list.id);
        renderBoard();
        closeAllDropdowns();
    });
    template.querySelector('[data-action="store-cards"]')?.addEventListener("click", e => {
        e.stopPropagation();
        Actions.moveAllCardsToStorage(list.id);
        renderBoard();
        closeAllDropdowns();
    });

    template.querySelector('[data-action="add-card"]')?.addEventListener("click", e => {
        e.stopPropagation();
        if (Actions.addCard(list.id, DEFAULT_BOARD_ID, currentUser)) {
            renderBoard();
        }
        closeAllDropdowns();
    });

    template.querySelector('[data-action="add-list"]')?.addEventListener("click", e => {
        e.stopPropagation();
        if (Actions.addList(DEFAULT_BOARD_ID, currentUser)) {
            renderBoard();
        }
        closeAllDropdowns();
    });
}

function setupInboxDropdown() {
    const actionBtn = document.querySelector(".inbox-action");
    const dropdown = document.querySelector(".inbox-dropdown");
    if (!actionBtn || !dropdown) return;

    const themeContainer = dropdown.querySelector(".theme-colors");
    themeContainer.innerHTML = ""; // Clear old
    Object.keys(themeColors).forEach(themeKey => {
        const colorItem = document.createElement("div");
        colorItem.className = "theme-color-item";
        colorItem.style.backgroundColor = themeColors[themeKey];
        if (inboxData.theme === themeKey) colorItem.classList.add("active");
        colorItem.addEventListener("click", e => {
            e.stopPropagation();
            Actions.updateInboxTheme(themeKey);
            renderInbox();
            closeAllDropdowns();
        });
        themeContainer.appendChild(colorItem);
    });

     actionBtn.addEventListener("click", e => {
        e.stopPropagation();
        closeAllDropdowns();
        dropdown.style.display = 'block';
    });
    dropdown.querySelector('[data-action="add-inbox-card"]')?.addEventListener("click", e => {
        e.stopPropagation();
        if (Actions.addInboxCard(currentUser)) renderInbox();
        closeAllDropdowns();
    });
}

function setupHeaderDropdown() {
    const actionBtn = document.querySelector(".header-action");
    const dropdown = document.querySelector(".header-dropdown");
    if (!actionBtn || !dropdown) return;

    actionBtn.addEventListener("click", e => {
        e.stopPropagation();
        closeAllDropdowns();
        dropdown.style.display = 'block';
    });

    const themeContainer = dropdown.querySelector('.board-theme-colors');
    themeContainer.innerHTML = '';
    Object.keys(boardThemeColors).forEach(key => {
        const color = boardThemeColors[key];
        const colorItem = document.createElement("div");
        colorItem.className = "theme-color-item";
        colorItem.style.background = color;
        colorItem.addEventListener("click", e => {
            e.stopPropagation();
            Actions.updateBoardTheme(DEFAULT_BOARD_ID, color);
            renderBoard();
            closeAllDropdowns();
        });
        themeContainer.appendChild(colorItem);
    });

    dropdown.querySelector('[data-action="archived"]')?.addEventListener("click", e => {
        e.stopPropagation();
        openArchivedModal();
        closeAllDropdowns();
    });
    dropdown.querySelector('[data-action="delete-board"]')?.addEventListener("click", e => {
        e.stopPropagation();
        Actions.deleteBoard(DEFAULT_BOARD_ID);
        closeAllDropdowns();
    });
    dropdown.querySelector('[data-action="logout"]')?.addEventListener("click", e => {
        e.stopPropagation();
        Actions.logout();
        closeAllDropdowns();
    });
}


// --- MODALS ---
function setupCardModal() {
    cardModal.element = document.getElementById("card-modal");
    if (!cardModal.element) return;
    cardModal.form = document.getElementById("card-form");
    cardModal.inputs = {
        title: document.getElementById("card-title-input"),
        dueDate: document.getElementById("card-dueDate-input"),
        status: document.getElementById("card-status-input"),
    };
    cardModal.element.querySelectorAll("[data-modal-close]").forEach(trigger => 
        trigger.addEventListener("click", closeCardModal)
    );
    cardModal.form?.addEventListener("submit", handleCardFormSubmit);
    document.getElementById("store-card-btn")?.addEventListener("click", () => {
        if (!currentCardContext) return;
        const cardRef = Actions.findCardReference(currentCardContext);
        if(cardRef) {
            cardRef.status = 'done'; // Force status to done to allow storing
            if (Actions.moveCardToStorage(currentCardContext)) {
                renderAll();
                closeCardModal();
            }
        }
    });
}

function openCardModal(context) {
    currentCardContext = context;
    const cardRef = Actions.findCardReference(context);
    if (!cardRef || !cardModal.element) return;
    cardModal.inputs.title.value = cardRef.title || "";
    if (cardRef.dueDate) {
        // Correctly format the date for datetime-local input, accounting for timezone
        const d = new Date(cardRef.dueDate);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        cardModal.inputs.dueDate.value = d.toISOString().slice(0, 16);
    } else {
        cardModal.inputs.dueDate.value = "";
    }
    cardModal.inputs.status.value = cardRef.status || "pending";
    cardModal.element.classList.add("is-open");
}

function closeCardModal() {
    if (!cardModal.element) return;
    cardModal.element.classList.remove("is-open");
    cardModal.form?.reset();
    currentCardContext = null;
}

function handleCardFormSubmit(event) {
    event.preventDefault();
    if (!currentCardContext) return;
    const updatedValues = {
        title: cardModal.inputs.title.value.trim(),
        dueDate: cardModal.inputs.dueDate.value ? new Date(cardModal.inputs.dueDate.value).toISOString() : null,
        status: cardModal.inputs.status.value,
    };
    if (!updatedValues.title) return alert("Tiêu đề không được để trống.");

    if (Actions.updateCard(currentCardContext, updatedValues)) {
        renderAll();
        closeCardModal();
    }
}

// --- ARCHIVED MODAL ---
function setupArchivedModal() {
    const modal = document.getElementById('archivedModal');
    if(!modal) return;

    modal.querySelector('.archived-modal__close')?.addEventListener('click', () => modal.classList.remove('active'));
    modal.querySelector('.archived-modal__backdrop')?.addEventListener('click', () => modal.classList.remove('active'));

    modal.querySelectorAll('.archived-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            modal.querySelectorAll('.archived-tab, .archived-panel').forEach(el => el.classList.remove('active'));
            tab.classList.add('active');
            modal.querySelector(`#archived-${target}-panel`).classList.add('active');
        });
    });
}

function openArchivedModal() {
    const modal = document.getElementById('archivedModal');
    if(!modal) return;
    renderArchivedCards();
    renderArchivedLists();
    modal.classList.add('active');
}

function renderArchivedLists() {
    const container = document.getElementById('archived-lists-list');
    container.innerHTML = '';
    const archivedLists = lists.filter(l => l.storage === true && l.boardId === DEFAULT_BOARD_ID);

    if (archivedLists.length === 0) {
        container.innerHTML = '<p class="archived-empty">Không có danh sách nào đã lưu trữ</p>';
        return;
    }
    archivedLists.forEach(list => {
        const itemCount = cards.filter(c => c.listId === list.id).length;
        const itemEl = createArchivedItem(list.title, `${itemCount} thẻ`, 
            () => { // Restore
                Actions.restoreList(list.id);
                renderAll();
                renderArchivedLists();
                showToast();
            },
            () => { // Delete
                if (Actions.deletePermanentlyList(list.id)) {
                    renderAll();
                    renderArchivedLists();
                }
            }
        );
        container.appendChild(itemEl);
    });
}

function renderArchivedCards() {
    const container = document.getElementById('archived-cards-list');
    container.innerHTML = '';
    const archivedBoardCards = cards.filter(c => c.storage === true && c.boardId === DEFAULT_BOARD_ID);
    const archivedInboxCards = cardsInbox.filter(c => c.userId === currentUser.id && c.storage === true);
    const allArchived = [...archivedBoardCards, ...archivedInboxCards];
    
    if (allArchived.length === 0) {
        container.innerHTML = '<p class="archived-empty">Không có thẻ nào đã lưu trữ</p>';
        return;
    }

    allArchived.forEach(card => {
        const isInbox = 'userId' in card;
        const context = { source: isInbox ? 'inbox' : 'board', cardId: card.id, listId: card.listId };
        const itemEl = createArchivedItem(card.title, card.footer, 
            () => { // Restore
                Actions.restoreCard(context);
                renderAll();
                renderArchivedCards();
                showToast();
            },
            () => { // Delete
                if(Actions.deletePermanentlyCard(context)) {
                    renderAll();
                    renderArchivedCards();
                }
            },
            isInbox ? 'Hộp thư' : 'Bảng'
        );
        container.appendChild(itemEl);
    });
}

function createArchivedItem(title, meta, onRestore, onDelete, badgeText) {
    const itemEl = document.createElement('div');
    itemEl.className = 'archived-item';
    let badge = badgeText ? `<span class="archived-item__badge">${badgeText}</span>` : '';
    itemEl.innerHTML = `
        <div class="archived-item__content">
            <div class="archived-item__info">
                <h6 class="archived-item__title">${title}</h6>
                <p class="archived-item__meta">${meta}</p>
                ${badge}
            </div>
            <div class="archived-item__actions">
                <button class="archived-item__restore">Khôi phục</button>
                <button class="archived-item__delete">Xóa</button>
            </div>
        </div>`;
    itemEl.querySelector('.archived-item__restore').addEventListener('click', onRestore);
    itemEl.querySelector('.archived-item__delete').addEventListener('click', onDelete);
    return itemEl;
}
