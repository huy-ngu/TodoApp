import  {boards, lists, cards, inboxData, themeColors, baseUrl}  from "./Entity.js";

console.log(lists);

const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
if (!currentUser) {
    alert("Bạn chưa đăng nhập! Vui lòng quay lại.");
    window.location.href = `${baseUrl}/Login/login.html`;
}

const viewState = {
  board: true,
  inbox: false,
};

const generateId = (() => {
  let counter = 0;
  return (prefix) => `${prefix}-${Date.now()}`;
})();


// Board ID mặc định 
let DEFAULT_BOARD_ID = "b2";
const boardId = new URLSearchParams(window.location.search).get('board');
if(boardId) {
  DEFAULT_BOARD_ID = boardId;
}

document.addEventListener("DOMContentLoaded", () => {
  renderBoard(DEFAULT_BOARD_ID);
  renderInbox(inboxData);
  setupViewSwitch();
  setupAddBoardButton();
  setupAddListButton();
  setupStarButton();
  setupAddInboxButton();
  setupCardModal();
  setupHeaderDropdown();
  
  // Đóng dropdown khi click ra ngoài
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".list__action-wrapper") && 
        !e.target.closest(".inbox-action-wrapper") && 
        !e.target.closest(".header-action-wrapper")) {
      closeAllDropdowns();
    }
  });
});

const cardModal = {
  element: null,
  form: null,
  inputs: {},
};
let currentCardContext = null;

/**
 * Component: Board
 */
function renderBoard(boardId) {
  const board = boards.find((b) => b.id === boardId);
  if (!board) {
    console.warn("[BOARD] Không tìm thấy board với id:", boardId);
    return;
  }

  document.getElementById("board-title").textContent = board.title;
  // set màu body
  document.body.style.background = board.theme ;

  // Cập nhật trạng thái starred của button
  updateStarButton(board.starred);

  // Áp dụng theme cho board
  const boardTheme = board.theme || "blue";
  const boardColors = themeColors[boardTheme] || themeColors.blue;
  const boardPanel = document.getElementById("board-panel");
  if (boardPanel) {
    boardPanel.style.setProperty("--theme-primary", boardColors.primary);
    boardPanel.style.setProperty("--theme-light", boardColors.light);
    boardPanel.style.setProperty("--theme-gradient", boardColors.gradient);
    boardPanel.style.setProperty("--theme-border", boardColors.border);
    boardPanel.setAttribute("data-theme", boardTheme);
  }

  const boardRoot = document.getElementById("board-root");
  
  // Lưu vị trí cuộn của tất cả các list trước khi render
  const scrollPositions = {};
  boardRoot.querySelectorAll('.list').forEach((listElement) => {
    const listId = listElement.getAttribute('data-list-id');
    if (listId) {
      const cardsContainer = listElement.querySelector('.list__cards');
      if (cardsContainer) {
        scrollPositions[listId] = cardsContainer.scrollTop;
      }
    }
  });

  boardRoot.innerHTML = "";

  // Lấy tất cả lists thuộc board này và lọc bỏ các list có storage: true
  const boardLists = lists.filter((list) => list.boardId === boardId && !list.storage);
  
  boardLists.forEach((list) => {
    const listNode = createList(list);
    boardRoot.appendChild(listNode);
  });

  // Khôi phục vị trí cuộn sau khi render
  boardRoot.querySelectorAll('.list').forEach((listElement) => {
    const listId = listElement.getAttribute('data-list-id');
    if (listId && scrollPositions[listId] !== undefined) {
      const cardsContainer = listElement.querySelector('.list__cards');
      if (cardsContainer) {
        cardsContainer.scrollTop = scrollPositions[listId];
      }
    }
  });
}

/**
 * Component: Inbox
 */
function renderInbox(inbox) {
  document.getElementById("inbox-title").textContent = inbox.title;
  document.getElementById("inbox-description").textContent =
    inbox.description;

  // Áp dụng theme cho inbox
  const inboxTheme = inbox.theme || "green";
  const inboxColors = themeColors[inboxTheme] || themeColors.green;
  const inboxPanel = document.getElementById("inbox-panel");
  if (inboxPanel) {
    inboxPanel.style.setProperty("--theme-primary", inboxColors.primary);
    inboxPanel.style.setProperty("--theme-light", inboxColors.light);
    inboxPanel.style.setProperty("--theme-gradient", inboxColors.gradient);
    inboxPanel.style.setProperty("--theme-border", inboxColors.border);
    inboxPanel.setAttribute("data-theme", inboxTheme);
  }

  const inboxRoot = document.getElementById("inbox-root");
  
  // Lưu vị trí cuộn trước khi render
  const scrollPosition = inboxRoot.scrollTop;
  
  inboxRoot.innerHTML = "";

  // Lọc bỏ các card có storage: true
  const visibleCards = inbox.cards.filter((card) => !card.storage);
  
  visibleCards.forEach((card) => {
    const cardNode = createCard(card, { source: "inbox" });
    inboxRoot.appendChild(cardNode);
  });

  // Setup dropdown menu cho inbox
  setupInboxDropdown(inbox);

  // Khôi phục vị trí cuộn sau khi render
  requestAnimationFrame(() => {
    inboxRoot.scrollTop = scrollPosition;
  });
}

/**
 * Component: List
 */
function createList(list) {
  const template = document
    .getElementById("list-template")
    .content.cloneNode(true);

  const listElement = template.querySelector(".list");
  listElement.setAttribute("data-list-id", list.id);

  // Áp dụng theme cho list
  const listTheme = list.theme || "blue";
  const listColors = themeColors[listTheme] || themeColors.blue;
  listElement.style.setProperty("--theme-primary", listColors.primary);
  listElement.style.setProperty("--theme-light", listColors.light);
  listElement.style.setProperty("--theme-gradient", listColors.gradient);
  listElement.style.setProperty("--theme-border", listColors.border);
  listElement.setAttribute("data-theme", listTheme);

  template.querySelector(".list__title").textContent = list.title;

  const cardsContainer = template.querySelector(".list__cards");
  cardsContainer.innerHTML = "";

  // Lấy tất cả cards thuộc list này và lọc bỏ các card có storage: true
  const listCards = cards.filter((card) => card.listId === list.id && !card.storage);
  
  listCards.forEach((card) => {
    const cardNode = createCard(card, { source: "board", listId: list.id });
    cardsContainer.appendChild(cardNode);
  });

  const addCardBtn = template.querySelector(".list__add-card");
  addCardBtn.addEventListener("click", () => handleAddCard(list.id));

  // Setup dropdown menu
  setupListDropdown(template, list);

  return template;
}

/**
 * Setup dropdown menu cho list
 */
function setupListDropdown(template, list) {
  const actionBtn = template.querySelector(".list__action");
  const dropdown = template.querySelector(".list__dropdown");
  const themeColorsContainer = template.querySelector(".theme-colors");

  // Tạo các màu theme
  Object.keys(themeColors).forEach((themeKey) => {
    const colorItem = document.createElement("div");
    colorItem.className = "theme-color-item";
    colorItem.style.backgroundColor = themeColors[themeKey].primary;
    colorItem.setAttribute("data-theme", themeKey);
    
    // Đánh dấu theme hiện tại
    if (list.theme === themeKey) {
      colorItem.classList.add("active");
    }

    colorItem.addEventListener("click", (e) => {
      e.stopPropagation();
      updateListTheme(list.id, themeKey);
      closeAllDropdowns();
    });

    themeColorsContainer.appendChild(colorItem);
  });

  // Toggle dropdown khi click vào nút action
  actionBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeAllDropdowns();
    dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
  });

  // Xử lý các action trong dropdown
  const addListBtn = template.querySelector('[data-action="add-list"]');
  const addCardBtn = template.querySelector('[data-action="add-card"]');
  const storeListBtn = template.querySelector('[data-action="store-list"]');
  const storeCardsBtn = template.querySelector('[data-action="store-cards"]');

  addListBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    closeAllDropdowns();
    handleAddList();
  });

  addCardBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    closeAllDropdowns();
    handleAddCard(list.id);
  });

  storeListBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    closeAllDropdowns();
    moveListToStorage(list.id);
  });

  storeCardsBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    closeAllDropdowns();
    moveAllCardsToStorage(list.id);
  });
}

/**
 * Đóng tất cả dropdowns
 */
function closeAllDropdowns() {
  document.querySelectorAll(".list__dropdown").forEach((dropdown) => {
    dropdown.style.display = "none";
  });
  document.querySelectorAll(".inbox-dropdown").forEach((dropdown) => {
    dropdown.style.display = "none";
  });
  document.querySelectorAll(".header-dropdown").forEach((dropdown) => {
    dropdown.style.display = "none";
  });
}

/**
 * Setup dropdown menu cho header
 */
function setupHeaderDropdown() {
  const actionBtn = document.querySelector(".header-action");
  const dropdown = document.querySelector(".header-dropdown");

  if (!actionBtn || !dropdown) return;

  // Toggle dropdown khi click vào nút action
  actionBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeAllDropdowns();
    dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
  });

  // Xử lý các action trong dropdown
  const settingsBtn = dropdown.querySelector('[data-action="settings"]');
  const archivedBtn = dropdown.querySelector('[data-action="archived"]');
  const logoutBtn = dropdown.querySelector('[data-action="logout"]');

  settingsBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    closeAllDropdowns();
    // TODO: Xử lý cài đặt
    console.log("[HEADER] Cài đặt");
  });

  archivedBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    closeAllDropdowns();
    openArchivedModal();
  });

  logoutBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    closeAllDropdowns();
    // TODO: Xử lý đăng xuất
    console.log("[HEADER] Đăng xuất");
  });
}

/**
 * Mở modal mục đã lưu trữ
 */
function openArchivedModal() {
  const modal = document.getElementById('archivedModal');
  if (!modal) {
    console.error("[MODAL] Không tìm thấy modal element");
    return;
  }
  
  // Render các thẻ đã lưu trữ
  renderArchivedCards();
  
  // Render các danh sách đã lưu trữ
  renderArchivedLists();
  
  // Hiển thị modal
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // Xử lý đóng modal
  const closeBtn = modal.querySelector('.archived-modal__close');
  const backdrop = modal.querySelector('.archived-modal__backdrop');
  
  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };
  
  if (closeBtn) {
    closeBtn.onclick = closeModal;
  }
  if (backdrop) {
    backdrop.onclick = closeModal;
  }
  
  // Xử lý tabs
  setupArchivedTabs();
}

/**
 * Setup tabs cho modal
 */
function setupArchivedTabs() {
  const tabs = document.querySelectorAll('.archived-tab');
  const panels = document.querySelectorAll('.archived-panel');
  
  // Xóa event listeners cũ nếu có
  tabs.forEach((tab) => {
    const newTab = tab.cloneNode(true);
    tab.parentNode.replaceChild(newTab, tab);
  });
  
  // Thêm event listeners mới
  document.querySelectorAll('.archived-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');
      
      // Xóa active từ tất cả tabs và panels
      document.querySelectorAll('.archived-tab').forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.archived-panel').forEach((p) => p.classList.remove('active'));
      
      // Thêm active cho tab và panel được chọn
      tab.classList.add('active');
      const targetPanel = document.getElementById(`archived-${targetTab}-panel`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
}

/**
 * Render các thẻ đã lưu trữ
 */
function renderArchivedCards() {
  const container = document.getElementById('archived-cards-list');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Lấy tất cả cards có storage: true (từ board và inbox)
  const archivedBoardCards = cards.filter((card) => card.storage === true);
  const archivedInboxCards = inboxData.cards.filter((card) => card.storage === true);
  const allArchivedCards = [...archivedBoardCards, ...archivedInboxCards];
  
  if (allArchivedCards.length === 0) {
    container.innerHTML = '<p class="archived-empty">Không có thẻ nào đã lưu trữ</p>';
    return;
  }
  
  allArchivedCards.forEach((card) => {
    const cardElement = document.createElement('div');
    cardElement.className = 'archived-item';
    
    // Xác định source của card
    const isInboxCard = archivedInboxCards.includes(card);
    const source = isInboxCard ? 'inbox' : 'board';
    const listId = card.listId || null;
    
    cardElement.innerHTML = `
      <div class="archived-item__content">
        <div class="archived-item__info">
          <h6 class="archived-item__title">${card.title}</h6>
          <p class="archived-item__meta">${card.label} • ${card.badge}</p>
          <p class="archived-item__footer">${card.footer}</p>
          <span class="archived-item__badge">${source === 'inbox' ? 'Hộp thư' : 'Bảng'}</span>
        </div>
        <button class="archived-item__restore" data-card-id="${card.id}" data-source="${source}" data-list-id="${listId || ''}">
          Khôi phục
        </button>
      </div>
    `;
    
    const restoreBtn = cardElement.querySelector('.archived-item__restore');
    restoreBtn.addEventListener('click', () => {
      restoreCard(card.id, source, listId);
    });
    
    container.appendChild(cardElement);
  });
}

/**
 * Render các danh sách đã lưu trữ
 */
function renderArchivedLists() {
  const container = document.getElementById('archived-lists-list');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Lấy tất cả lists có storage: true
  const archivedLists = lists.filter((list) => list.storage === true);
  
  if (archivedLists.length === 0) {
    container.innerHTML = '<p class="archived-empty">Không có danh sách nào đã lưu trữ</p>';
    return;
  }
  
  archivedLists.forEach((list) => {
    const listElement = document.createElement('div');
    listElement.className = 'archived-item';
    
    // Đếm số cards trong list này
    const cardsInList = cards.filter((card) => card.listId === list.id).length;
    
    listElement.innerHTML = `
      <div class="archived-item__content">
        <div class="archived-item__info">
          <h6 class="archived-item__title">${list.title}</h6>
          <p class="archived-item__meta">${cardsInList} thẻ</p>
        </div>
        <button class="archived-item__restore" data-list-id="${list.id}">
          Khôi phục
        </button>
      </div>
    `;
    
    const restoreBtn = listElement.querySelector('.archived-item__restore');
    restoreBtn.addEventListener('click', () => {
      restoreList(list.id);
    });
    
    container.appendChild(listElement);
  });
}

/**
 * Khôi phục card từ lưu trữ
 */
function restoreCard(cardId, source, listId) {
  let card = null;
  
  if (source === 'inbox') {
    card = inboxData.cards.find((c) => c.id === cardId);
  } else {
    card = cards.find((c) => c.id === cardId);
  }
  
  if (!card) {
    console.warn("[CARD] Không tìm thấy thẻ để khôi phục:", { cardId, source });
    return;
  }
  
  card.storage = false;
  console.log("[CARD] Đã khôi phục thẻ:", { card, source, listId });
  
  // Render lại modal
  renderArchivedCards();
  
  // Render lại board hoặc inbox tùy thuộc vào nguồn
  if (source === 'inbox') {
    renderInbox(inboxData);
  } else {
    renderBoard(DEFAULT_BOARD_ID);
  }
}

/**
 * Khôi phục list từ lưu trữ
 */
function restoreList(listId) {
  const list = lists.find((l) => l.id === listId);
  if (!list) return;
  
  list.storage = false;
  console.log("[LIST] Đã khôi phục danh sách:", list);
  
  // Render lại modal
  renderArchivedLists();
  
  // Render lại board
  renderBoard(DEFAULT_BOARD_ID);
}

/**
 * Cập nhật theme của list
 */
function updateListTheme(listId, newTheme) {
  const list = lists.find((l) => l.id === listId);
  if (!list) {
    console.warn("[LIST] Không tìm thấy list với id:", listId);
    return;
  }

  list.theme = newTheme;
  console.log("[LIST] Đã cập nhật theme:", {
    listId: list.id,
    listTitle: list.title,
    newTheme: newTheme,
  });

  // Render lại board để áp dụng theme mới
  renderBoard(DEFAULT_BOARD_ID);
}

/**
 * Setup dropdown menu cho inbox
 */
function setupInboxDropdown(inbox) {
  const actionBtn = document.querySelector(".inbox-action");
  const dropdown = document.querySelector(".inbox-dropdown");
  const themeColorsContainer = dropdown?.querySelector(".theme-colors");

  if (!actionBtn || !dropdown || !themeColorsContainer) return;

  // Xóa các màu theme cũ nếu có
  themeColorsContainer.innerHTML = "";

  // Tạo các màu theme
  Object.keys(themeColors).forEach((themeKey) => {
    const colorItem = document.createElement("div");
    colorItem.className = "theme-color-item";
    colorItem.style.backgroundColor = themeColors[themeKey].primary;
    colorItem.setAttribute("data-theme", themeKey);
    
    // Đánh dấu theme hiện tại
    if (inbox.theme === themeKey) {
      colorItem.classList.add("active");
    }

    colorItem.addEventListener("click", (e) => {
      e.stopPropagation();
      updateInboxTheme(themeKey);
      closeAllDropdowns();
    });

    themeColorsContainer.appendChild(colorItem);
  });

  // Toggle dropdown khi click vào nút action
  actionBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeAllDropdowns();
    dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
  });

  // Xử lý action thêm thẻ
  const addCardBtn = dropdown.querySelector('[data-action="add-inbox-card"]');
  addCardBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    closeAllDropdowns();
    handleAddInboxCard();
  });
}

/**
 * Cập nhật theme của inbox
 */
function updateInboxTheme(newTheme) {
  inboxData.theme = newTheme;
  console.log("[INBOX] Đã cập nhật theme:", {
    newTheme: newTheme,
  });

  // Render lại inbox để áp dụng theme mới
  renderInbox(inboxData);
}

/**
 * Component: Card
 */
function createCard(card, context = { source: "board" }) {
  const template = document
    .getElementById("card-template")
    .content.cloneNode(true);

  template.querySelector(".card__label").textContent = card.label;
  template.querySelector(".card__badge").textContent = card.badge;
  template.querySelector(".card__title").textContent = card.title;
  template.querySelector(".card__footer").textContent = card.footer;

  const cardElement = template.querySelector(".card");
  attachStatusControls(cardElement, card, context);

  cardElement.addEventListener("click", (event) => {
    if (event.target.closest(".card__toggle")) return;
    openCardModal({
      source: context.source || "board",
      listId: context.listId || null,
      cardId: card.id,
    });
  });

  return template;
}

function attachStatusControls(cardElement, card, context) {
  const statusBadge = document.createElement("span");
  statusBadge.className = "status-pill";
  statusBadge.textContent = card.status === "done" ? "Lưu trữ" : "Chưa xong";

  const toggleBtn = document.createElement("button");
  toggleBtn.className = "card__toggle";
  toggleBtn.type = "button";
  toggleBtn.textContent =
    card.status === "done" ? "Bỏ hoàn thành" : "Đánh dấu xong";

  const statusRow = document.createElement("div");
  statusRow.className = "card__status";
  statusRow.appendChild(statusBadge);
  statusRow.appendChild(toggleBtn);

  const footer = cardElement.querySelector(".card__footer");
  footer.insertAdjacentElement("afterend", statusRow);

  updateStatusStyles(card, statusBadge, toggleBtn, context);

  toggleBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleCardStatus(context.source || "board", context.listId, card.id);
  });

  // Thêm event listener cho nút "Lưu trữ" khi status là "done"
  if (card.status === "done") {
    statusBadge.style.cursor = "pointer";
    statusBadge.classList.add("storage-action");
    statusBadge.addEventListener("click", (event) => {
      event.stopPropagation();
      moveCardToStorage(context.source || "board", context.listId, card.id);
    });
  }
}

function updateStatusStyles(card, badgeEl, toggleBtn, context) {
  badgeEl.classList.toggle("is-done", card.status === "done");
  toggleBtn.classList.toggle("is-done", card.status === "done");
  toggleBtn.textContent =
    card.status === "done" ? "Bỏ hoàn thành" : "Đánh dấu xong";
  badgeEl.textContent = card.status === "done" ? "Lưu trữ" : "Chưa xong";

  // Cập nhật style và event listener cho nút "Lưu trữ"
  if (card.status === "done") {
    badgeEl.style.cursor = "pointer";
    badgeEl.classList.add("storage-action");
    
    // Thêm event listener nếu chưa có
    if (!badgeEl.hasAttribute("data-storage-listener")) {
      badgeEl.setAttribute("data-storage-listener", "true");
      badgeEl.addEventListener("click", function storageClickHandler(event) {
        event.stopPropagation();
        moveCardToStorage(context?.source || "board", context?.listId, card.id);
      });
    }
  } else {
    badgeEl.style.cursor = "default";
    badgeEl.classList.remove("storage-action");
    badgeEl.removeAttribute("data-storage-listener");
  }
}

function toggleCardStatus(source, listId, cardId) {
  const cardRef = findCardReference({
    source,
    listId,
    cardId,
  });

  if (!cardRef) {
    console.warn("[CARD] Không tìm thấy thẻ để toggle trạng thái", {
      source,
      listId,
      cardId,
    });
    return;
  }

  cardRef.status = cardRef.status === "done" ? "pending" : "done";

  if (source === "board") {
    renderBoard(DEFAULT_BOARD_ID);
  } else {
    renderInbox(inboxData);
  }

  console.log("[CARD] Đã cập nhật trạng thái:", {
    card: { ...cardRef },
    source,
    listId,
  });
}

/**
 * Di chuyển card vào lưu trữ (storage: true)
 */
function moveCardToStorage(source, listId, cardId) {
  const cardRef = findCardReference({
    source,
    listId,
    cardId,
  });

  if (!cardRef) {
    console.warn("[CARD] Không tìm thấy thẻ để lưu trữ", {
      source,
      listId,
      cardId,
    });
    return;
  }

  // Chỉ cho phép lưu trữ khi card đã hoàn thành
  if (cardRef.status !== "done") {
    console.warn("[CARD] Chỉ có thể lưu trữ thẻ đã hoàn thành", {
      cardId,
      status: cardRef.status,
    });
    return;
  }

  cardRef.storage = true;
  console.log("[CARD] Đã lưu trữ thẻ:", {
    card: { ...cardRef },
    source,
    listId,
  });

  // Render lại để cập nhật giao diện
  if (source === "board") {
    renderBoard(DEFAULT_BOARD_ID);
  } else {
    renderInbox(inboxData);
  }
}

/**
 * Lưu trữ danh sách (đổi storage của list thành true, giữ nguyên storage của cards)
 */
function moveListToStorage(listId) {
  const list = lists.find((l) => l.id === listId);
  if (!list) {
    console.warn("[LIST] Không tìm thấy danh sách với id:", listId);
    return;
  }

  list.storage = true;
  console.log("[LIST] Đã lưu trữ danh sách:", {
    listId: list.id,
    listTitle: list.title,
  });

  // Render lại để cập nhật giao diện (list sẽ biến mất vì đã được lọc bỏ)
  renderBoard(DEFAULT_BOARD_ID);
}

/**
 * Lưu trữ toàn bộ thẻ trong danh sách (đổi storage của tất cả cards có listId tương ứng thành true, giữ nguyên storage của list)
 */
function moveAllCardsToStorage(listId) {
  const list = lists.find((l) => l.id === listId);
  if (!list) {
    console.warn("[LIST] Không tìm thấy danh sách với id:", listId);
    return;
  }

  // Tìm tất cả cards thuộc list này và đổi storage thành true
  const listCards = cards.filter((card) => card.listId === listId);
  let storedCount = 0;

  listCards.forEach((card) => {
    if (!card.storage) {
      card.storage = true;
      storedCount++;
    }
  });

  console.log("[LIST] Đã lưu trữ toàn bộ thẻ trong danh sách:", {
    listId: list.id,
    listTitle: list.title,
    storedCount: storedCount,
    totalCards: listCards.length,
  });

  // Render lại để cập nhật giao diện (cards sẽ biến mất vì đã được lọc bỏ)
  renderBoard(DEFAULT_BOARD_ID);
}

/**
 * View switch controller
 */
function setupViewSwitch() {
  const buttons = document.querySelectorAll(".view-switch__btn");
  const wrapper = document.getElementById("view-wrapper");
  const boardPanel = document.getElementById("board-panel");
  const inboxPanel = document.getElementById("inbox-panel");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.view;
      viewState[view] = !viewState[view];

      if (!viewState.board && !viewState.inbox) {
        viewState[view] = true;
      }

      applyViewState(wrapper, boardPanel, inboxPanel, buttons);
    });
  });

  applyViewState(wrapper, boardPanel, inboxPanel, buttons);
}

function applyViewState(wrapper, boardPanel, inboxPanel, buttons) {
  const mode =
    viewState.board && viewState.inbox
      ? "split"
      : viewState.board
      ? "board"
      : "inbox";

  wrapper.dataset.mode = mode;
  boardPanel.classList.toggle("is-hidden", !viewState.board);
  inboxPanel.classList.toggle("is-hidden", !viewState.inbox);

  buttons.forEach((btn) => {
    const view = btn.dataset.view;
    const isActive = viewState[view];
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));
  });
}

/**
 * Add Board / List / Card handlers
 */
function setupAddBoardButton() {
  const addBoardBtn = document.getElementById("add-board-btn");
  if (!addBoardBtn) return;
  addBoardBtn.addEventListener("click", handleAddBoard);
}

function setupAddListButton() {
  const addListBtn = document.getElementById("add-list-btn");
  if (!addListBtn) return;
  addListBtn.addEventListener("click", handleAddList);
}

/**
 * Hàm xử lí cập nhật trạng thái starred của board
 */

function setupStarButton() {
  const starBtn = document.getElementById("star-board-btn");
  if (!starBtn) return;
  starBtn.addEventListener("click", toggleBoardStar);
}

function toggleBoardStar() {
  const board = boards.find((b) => b.id === DEFAULT_BOARD_ID);
  if (!board) return;

  board.starred = !board.starred;
  updateStarButton(board.starred);
  console.log("[BOARD] Board starred:", board.starred);
  console.log("[BOARD] Boards:", boards);
}

function updateStarButton(isStarred) {
  const starBtn = document.getElementById("star-board-btn");
  if (!starBtn) return;

  const starIcon = starBtn.querySelector(".star-icon");
  if (!starIcon) return;

  if (isStarred) {
    starIcon.textContent = "★";
    starBtn.classList.add("is-starred");
  } else {
    starIcon.textContent = "☆";
    starBtn.classList.remove("is-starred");
  }
}

/**
 * Hàm xử lí thêm thẻ vào inbox
 */
function setupAddInboxButton() {
  const addInboxBtn = document.getElementById("add-inbox-card");
  if (!addInboxBtn) return;
  addInboxBtn.addEventListener("click", handleAddInboxCard);
}

function handleAddBoard() {
  const title = prompt("Tên bảng mới", "Bảng mới");
  if (!title) {
    return;
  }
  const normalizedTitle = title.trim();
  if (!normalizedTitle) return;

  const newBoard = {
    id: generateId("board"),
    title: normalizedTitle,
    starred: false,
    userId: currentUser.id,
    theme: "white", // Theme mặc định
  };

  boards.push(newBoard);
  localStorage.setItem('boards', JSON.stringify(boards));

  console.log("[BOARD] Đã thêm bảng:", newBoard);
  console.log("[BOARD] Danh sách bảng:", boards);

  // Cập nhật URL với query parameter board=boardId
  updateBoardUrl(newBoard.id);

  // Render board mới
  DEFAULT_BOARD_ID = newBoard.id;
  renderBoard(newBoard.id);
}

function updateBoardUrl(boardId) {
  const url = new URL(window.location.href);
  url.searchParams.set("board", boardId);
  window.history.pushState({ boardId }, "", url);
}

function handleAddList() {
  const title = prompt("Tên danh sách mới", "Danh sách mới");
  if (!title) {
    return;
  }
  const normalizedTitle = title.trim();
  if (!normalizedTitle) return;

  const newList = {
    id: generateId("list"),
    title: normalizedTitle,
    boardId: DEFAULT_BOARD_ID,
    theme: "blue", // Theme mặc định
    storage: false, // Mặc định không lưu trữ
  };

  lists.push(newList);
  localStorage.setItem('lists', JSON.stringify(lists));

  console.log("[LIST] Đã thêm danh sách:", newList);
  console.log("[LIST] Danh sách:", lists);
  renderBoard(DEFAULT_BOARD_ID);
}

function handleAddCard(listId) {
  const targetList = lists.find((list) => list.id === listId);
  if (!targetList) {
    console.warn("[CARD] Không tìm thấy danh sách với id:", listId);
    return;
  }

  const cardInput = promptForCardInput();
  if (!cardInput) return;

  const newCard = {
    id: generateId("card"),
    ...cardInput,
    listId: listId,
    storage: false, // Mặc định không lưu trữ
  };

  cards.push(newCard);
  console.log("[CARD] Đã thêm thẻ:", {
    card: newCard,
    listId: targetList.id,
    listTitle: targetList.title,
  });
  renderBoard(DEFAULT_BOARD_ID);
}

function handleAddInboxCard() {
  const cardInput = promptForCardInput();
  if (!cardInput) return;

  const newCard = {
    id: generateId("inbox-card"),
    ...cardInput,
    storage: false, // Mặc định không lưu trữ
  };

  inboxData.cards.unshift(newCard);
  console.log("[INBOX] Đã thêm thẻ:", newCard);

  renderInbox(inboxData);
}

function promptForCardInput(defaults = {}) {
  const title = prompt("Tên thẻ mới", defaults.title || "Nhiệm vụ mới");
  if (!title) return null;
  const normalizedTitle = title.trim();
  if (!normalizedTitle) return null;

  const label = prompt("Nhãn hiển thị", defaults.label || "General") || "General";
  const badge =
    prompt("Badge (ví dụ số lượng, trạng thái)", defaults.badge || "Chi tiết") ||
    "Chi tiết";
  const footer =
    prompt("Chú thích dưới thẻ", defaults.footer || "Hạn: dd/mm") || "Không có hạn";

  return {
    title: normalizedTitle,
    label: label.trim(),
    badge: badge.trim(),
    footer: footer.trim(),
    status: defaults.status || "pending",
  };
}

/**
 * modal update card
 */
function setupCardModal() {
  cardModal.element = document.getElementById("card-modal");
  if (!cardModal.element) return;

  cardModal.form = document.getElementById("card-form");
  cardModal.inputs = {
    title: document.getElementById("card-title-input"),
    label: document.getElementById("card-label-input"),
    badge: document.getElementById("card-badge-input"),
    footer: document.getElementById("card-footer-input"),
    status: document.getElementById("card-status-input"),
  };

  const closeTriggers = cardModal.element.querySelectorAll("[data-modal-close]");
  closeTriggers.forEach((trigger) =>
    trigger.addEventListener("click", closeCardModal)
  );

  cardModal.form?.addEventListener("submit", handleCardFormSubmit);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && cardModal.element.classList.contains("is-open")) {
      closeCardModal();
    }
  });
}

function openCardModal(context) {
  if (!cardModal.element) return;

  const cardRef = findCardReference(context);
  if (!cardRef) return;

  currentCardContext = { ...context };

  cardModal.inputs.title.value = cardRef.title || "";
  cardModal.inputs.label.value = cardRef.label || "";
  cardModal.inputs.badge.value = cardRef.badge || "";
  cardModal.inputs.footer.value = cardRef.footer || "";
  if (cardModal.inputs.status) {
    cardModal.inputs.status.value = cardRef.status || "pending";
  }

  cardModal.element.classList.add("is-open");
  cardModal.element.setAttribute("aria-hidden", "false");
  
  // Đảm bảo modal hiển thị
  cardModal.element.style.display = "flex";
  cardModal.element.style.opacity = "1";
  cardModal.element.style.pointerEvents = "auto";
  
  
}

function closeCardModal() {
  if (!cardModal.element) return;
  cardModal.form?.reset();
  cardModal.element.classList.remove("is-open");
  cardModal.element.setAttribute("aria-hidden", "true");
  currentCardContext = null;
}

function handleCardFormSubmit(event) {
  event.preventDefault();
  if (!currentCardContext) return;

  const updatedValues = {
    title: cardModal.inputs.title.value.trim(),
    label: cardModal.inputs.label.value.trim(),
    badge: cardModal.inputs.badge.value.trim(),
    footer: cardModal.inputs.footer.value.trim(),
    status: cardModal.inputs.status?.value || undefined,
  };

  if (!updatedValues.title) {
    alert("Tiêu đề không được để trống.");
    return;
  }

  const cardRef = findCardReference(currentCardContext);
  if (!cardRef) {
    console.warn("[CARD] Không tìm thấy thẻ để cập nhật", currentCardContext);
    return;
  }

  Object.assign(cardRef, {
    ...updatedValues,
    status: updatedValues.status || cardRef.status || "pending",
  });

  if (currentCardContext.source === "board") {
    renderBoard(DEFAULT_BOARD_ID);
  } else {
    renderInbox(inboxData);
  }

  console.log("[CARD] Đã cập nhật thẻ:", {
    card: cardRef,
    source: currentCardContext.source,
    listId: currentCardContext.listId,
  });

  closeCardModal();
}

function findCardReference(context) {
  if (context.source === "board") {
    return cards.find((card) => card.id === context.cardId && card.listId === context.listId) || null;
  }

  if (context.source === "inbox") {
    return inboxData.cards.find((card) => card.id === context.cardId) || null;
  }

  return null;
}

