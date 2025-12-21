import {
  boards,
  lists,
  cards,
  inboxData,
  cardsInbox,
  themeColors,
  boardThemeColors,
} from "../Entity.js";
import * as Actions from "./actions.js";
import { closeAllDropdowns, showToast } from "./utils.js";
import { initSortable } from "./drag-drop.js";

console.log("cardsInbox:", cardsInbox);
let cardModal = {};
let calendar = null;
let currentCardContext = null;
let viewState = { board: true, inbox: true };
let DEFAULT_BOARD_ID = "";
let currentUser = null;
let addListModal = {};
let createCardModal = {};
let createInboxCardModal = {};

// --- INITIALIZER ---
export function initializeUI(boardId, user) {
  DEFAULT_BOARD_ID = boardId;
  currentUser = user;

  setupViewSwitch();
  setupAddListModal();
  setupCreateCardModal();
  setupCreateInboxCardModal();
  setupMainButtons();
  setupCardModal();
  setupHeaderDropdown();
  setupViewBoardDropdown();
  setupInboxDropdown();
  setupArchivedModal();
  setupExpiredCardsModal();
  setupFullCalendar();

  document.addEventListener("click", (e) => {
    if (
      !e.target.closest(
        ".list__action-wrapper, .inbox-action-wrapper, .header-action-wrapper, .view-board"
      )
    ) {
      closeAllDropdowns();
    }
  });

  renderAll();
}

// --- RENDER FUNCTIONS ---
function renderAll() {
  renderBoard();
  renderInbox();
  if (calendar) {
    calendar.refetchEvents();
  }
}

function renderBoard() {
  const board = boards.find((b) => b.id === DEFAULT_BOARD_ID);
  if (!board) return;

  document.getElementById("board-title").textContent = board.title;
  document.body.style.background = board.theme;
  updateStarButton(board.starred);

  const boardRoot = document.getElementById("board-root");
  const scrollPositions = {}; // Preserve scroll positions
  boardRoot.querySelectorAll(".list").forEach((listEl) => {
    const listId = listEl.dataset.listId;
    scrollPositions[listId] = listEl.querySelector(".list__cards")?.scrollTop;
  });

  boardRoot.innerHTML = "";
  lists
    .filter((l) => l.boardId === DEFAULT_BOARD_ID && !l.storage)
    .sort((a, b) => a.order - b.order)
    .forEach((list) => {
      boardRoot.appendChild(createList(list));
    });

  // Restore scroll positions
  boardRoot.querySelectorAll(".list").forEach((listEl) => {
    const listId = listEl.dataset.listId;
    if (scrollPositions[listId]) {
      listEl.querySelector(".list__cards").scrollTop = scrollPositions[listId];
    }
  });

  initSortable(DEFAULT_BOARD_ID);
}

function renderInbox() {
  document.getElementById("inbox-title").textContent = inboxData.title;
  document.getElementById("inbox-description").textContent =
    inboxData.description;

  const inboxPanel = document.getElementById("inbox-panel");
  inboxPanel.style.backgroundColor =
    themeColors[inboxData.theme] || themeColors.green;
  inboxPanel.dataset.theme = inboxData.theme;

  const inboxRoot = document.getElementById("inbox-root");
  const scrollPosition = inboxRoot.scrollTop;
  inboxRoot.innerHTML = "";
  cardsInbox
    .filter((c) => c.userId === currentUser.id && !c.storage)
    .sort((a, b) => a.order - b.order) // Sắp xếp theo thuộc tính order
    .forEach((card) => {
      inboxRoot.appendChild(createCard(card, { source: "inbox" }));
    });
  inboxRoot.scrollTop = scrollPosition;
}

// --- COMPONENT CREATION ---
function createList(list) {
  const template = document
    .getElementById("list-template")
    .content.cloneNode(true);
  const listEl = template.querySelector(".list");
  listEl.dataset.listId = list.id;
  listEl.style.backgroundColor = themeColors[list.theme] || themeColors.blue;
  listEl.dataset.theme = list.theme;

  const titleEl = template.querySelector(".list__title");
  const inputEl = template.querySelector(".list-title-input");
  titleEl.textContent = list.title;
  inputEl.id = `input-${list.id}`;

  // --- Inline Edit Logic ---
  titleEl.addEventListener("click", () => {
    titleEl.style.display = "none";
    inputEl.style.display = "inline-block";
    inputEl.value = titleEl.textContent;
    inputEl.focus();
    inputEl.select();
  });

  const saveTitle = () => {
    const newTitle = inputEl.value;
    Actions.updateListTitle(list.id, newTitle);
    titleEl.textContent = newTitle.trim() ? newTitle : titleEl.textContent; // Update UI immediately
    inputEl.style.display = "none";
    titleEl.style.display = "inline-block";
  };

  inputEl.addEventListener("blur", saveTitle);
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      saveTitle();
    }
  });
  // --- End Inline Edit ---

  const cardsContainer = template.querySelector(".list__cards");
  cards
    .filter((c) => c.listId === list.id && !c.storage)
    .sort((a, b) => a.order - b.order)
    .forEach((card) => {
      cardsContainer.appendChild(
        createCard(card, { source: "board", listId: list.id })
      );
    });

  template.querySelector(".list__add-card").addEventListener("click", () => {
    openCreateCardModal(list.id);
  });

  setupListDropdown(template, list);
  return template;
}

function createCard(card, context) {
  const template = document
    .getElementById("card-template")
    .content.cloneNode(true);
  const cardEl = template.querySelector(".card");
  cardEl.dataset.cardId = card.id;
  cardEl.querySelector(".card__title").textContent = card.title;

  const footerEl = cardEl.querySelector(".card__footer");
  if (card.dueDate) {
    const dueDate = new Date(card.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today for comparison

    if (dueDate < today) {
      footerEl.classList.add("card__footer--expired");
    }

    const dateString = dueDate.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    const dateSpan = document.createElement("span");
    dateSpan.textContent = `Hạn: ${dateString}`;
    footerEl.appendChild(dateSpan);
  }

  const noteIcon = template.querySelector(".card__note-icon");
  if (card.note && card.note.trim()) {
    noteIcon.innerHTML = `<i class="fa-solid fa-align-left"></i>`;
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
  cardEl
    .querySelector(".card__footer")
    .insertAdjacentElement("afterend", statusRow);

  updateStatusStyles(card, statusBadge, toggleBtn);

  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const newContext = { ...context, cardId: card.id };
    Actions.toggleCardStatus(newContext);
    renderAll();
  });

  statusBadge.addEventListener("click", (e) => {
    e.stopPropagation();
    if (card.status === "done") {
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

  document.querySelectorAll(".view-switch__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.view;
      viewState[view] = !viewState[view];
      if (!viewState.board && !viewState.inbox) viewState[view] = true; // Ensure at least one view is active

      wrapper.dataset.mode =
        viewState.board && viewState.inbox
          ? "split"
          : viewState.board
          ? "board"
          : "inbox";
      boardPanel.classList.toggle("is-hidden", !viewState.board);
      inboxPanel.classList.toggle("is-hidden", !viewState.inbox);

      document
        .querySelectorAll(".view-switch__btn")
        .forEach((b) =>
          b.classList.toggle("is-active", viewState[b.dataset.view])
        );
      if (calendar) calendar.updateSize();
    });
  });
}

function setupMainButtons() {
  document.getElementById("add-list-btn")?.addEventListener("click", () => {
    // if (Actions.addList(DEFAULT_BOARD_ID, currentUser)) {
    //   renderBoard();
    // }
    openAddListModal();
  });
  document.getElementById("star-board-btn")?.addEventListener("click", () => {
    console.log("Đánh dấu sao");
    if (Actions.toggleBoardStar(DEFAULT_BOARD_ID)) renderBoard();
  });
  document.getElementById("add-inbox-card")?.addEventListener("click", () => {
    openCreateInboxCardModal();
  });
  // document.getElementById("calendar")?.addEventListener("click", () => {
  //   window.location.href = `./calendar.html?board=${DEFAULT_BOARD_ID}`;
  // });
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

  Object.keys(themeColors).forEach((themeKey) => {
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

  actionBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeAllDropdowns();
    dropdown.style.display = "block";
  });

  template
    .querySelector('[data-action="store-list"]')
    ?.addEventListener("click", (e) => {
      e.stopPropagation();
      Actions.moveListToStorage(list.id);
      renderBoard();
      closeAllDropdowns();
    });
  template
    .querySelector('[data-action="store-cards"]')
    ?.addEventListener("click", (e) => {
      e.stopPropagation();
      Actions.moveAllCardsToStorage(list.id);
      renderBoard();
      closeAllDropdowns();
    });

  template
    .querySelector('[data-action="add-card"]')
    ?.addEventListener("click", (e) => {
      e.stopPropagation();
      openCreateCardModal(list.id);
      closeAllDropdowns();
    });

  template
    .querySelector('[data-action="add-list"]')
    ?.addEventListener("click", (e) => {
      e.stopPropagation();
      openAddListModal();
      closeAllDropdowns();
    });
}

function setupInboxDropdown() {
  const actionBtn = document.querySelector(".inbox-action");
  const dropdown = document.querySelector(".inbox-dropdown");
  if (!actionBtn || !dropdown) return;

  const themeContainer = dropdown.querySelector(".theme-colors");
  themeContainer.innerHTML = ""; // Clear old
  Object.keys(themeColors).forEach((themeKey) => {
    const colorItem = document.createElement("div");
    colorItem.className = "theme-color-item";
    colorItem.style.backgroundColor = themeColors[themeKey];
    if (inboxData.theme === themeKey) colorItem.classList.add("active");
    colorItem.addEventListener("click", (e) => {
      e.stopPropagation();
      Actions.updateInboxTheme(themeKey);
      renderInbox();
      closeAllDropdowns();
    });
    themeContainer.appendChild(colorItem);
  });

  actionBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeAllDropdowns();
    dropdown.style.display = "block";
  });
  dropdown
    .querySelector('[data-action="add-inbox-card"]')
    ?.addEventListener("click", (e) => {
      e.stopPropagation();
      openCreateInboxCardModal();
      closeAllDropdowns();
    });
}

function setupHeaderDropdown() {
  const actionBtn = document.querySelector(".header-action");
  const dropdown = document.querySelector(".header-dropdown");
  if (!actionBtn || !dropdown) return;

  actionBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeAllDropdowns();
    dropdown.style.display = "block";
  });

  const themeContainer = dropdown.querySelector(".board-theme-colors");
  themeContainer.innerHTML = "";
  Object.keys(boardThemeColors).forEach((key) => {
    const color = boardThemeColors[key];
    const colorItem = document.createElement("div");
    colorItem.className = "theme-color-item";
    colorItem.style.background = color;
    colorItem.addEventListener("click", (e) => {
      e.stopPropagation();
      Actions.updateBoardTheme(DEFAULT_BOARD_ID, color);
      renderBoard();
      closeAllDropdowns();
    });
    themeContainer.appendChild(colorItem);
  });

  dropdown
    .querySelector("#show-expired-cards-btn")
    ?.addEventListener("click", (e) => {
      e.stopPropagation();
      openExpiredCardsModal();
      closeAllDropdowns();
    });

  dropdown
    .querySelector('[data-action="archived"]')
    ?.addEventListener("click", (e) => {
      e.stopPropagation();
      openArchivedModal();
      closeAllDropdowns();
    });
  dropdown
    .querySelector('[data-action="delete-board"]')
    ?.addEventListener("click", (e) => {
      e.stopPropagation();
      Actions.deleteBoard(DEFAULT_BOARD_ID);
      closeAllDropdowns();
    });
  dropdown
    .querySelector('[data-action="logout"]')
    ?.addEventListener("click", (e) => {
      e.stopPropagation();
      Actions.logout();
      closeAllDropdowns();
    });
}
function setupViewBoardDropdown() {
  const viewBoardBtn = document.getElementById("view-board-btn");
  const viewBoardDropdown = document.querySelector(".view-board-dropdown");
  const viewIcon = document.getElementById("view-icon");
  const boardPanel = document.getElementById("board-panel");
  const boardCalendar = document.getElementById("board-calendar");

  // Default state is set in HTML, this just ensures it on script load.
  boardPanel.style.display = "block";
  boardCalendar.style.display = "none";

  viewBoardBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    const isVisible = viewBoardDropdown.style.display === "block";
    // Use the global closer function which now knows about this dropdown
    closeAllDropdowns();
    if (!isVisible) {
      viewBoardDropdown.style.display = "block";
    }
  });

  document
    .querySelectorAll(".view-board-dropdown .dropdown-item")
    .forEach((button) => {
      button.addEventListener("click", (event) => {
        const view = event.currentTarget.dataset.view;

        if (view === "panel") {
          boardPanel.style.display = "block";
          boardCalendar.style.display = "none";
          viewIcon.className = "fa-solid fa-chart-simple";
          calendar.refetchEvents();
          console.log("Kích hoạt bảng");
        } else if (view === "calendar") {
          boardPanel.style.display = "none";
          boardCalendar.style.display = "block";
          viewIcon.className = "fa-solid fa-calendar-days";
          calendar.refetchEvents();
          console.log("Kích hoạt lịch");
          if (calendar) {
            calendar.updateSize(); // Adjust calendar size when its container is shown
          }
        }
        closeAllDropdowns();
      });
    });
}

// --- FULL CALENDAR ---

function getCalendarEvents() {
  const boardCards = cards.filter(
    (c) => c.boardId === DEFAULT_BOARD_ID && c.dueDate && !c.storage
  );
  const inboxCards = cardsInbox.filter(
    (c) => c.userId === currentUser.id && c.dueDate && !c.storage
  );

  const allCards = [...boardCards, ...inboxCards];
  console.log("Calendar Events:", allCards);
  const now = new Date();

  return allCards.map((card) => {
    let color;
    const dueDate = new Date(card.dueDate);

    if (card.status === "done") {
      color = "#28a745"; // Màu xanh lá (đã hoàn thành)
    } else if (dueDate < now) {
      color = "#dc3545"; // Màu đỏ (hết hạn và chưa hoàn thành)
    }

    return {
      id: card.id,
      title: card.title,
      start: card.dueDate,
      backgroundColor: color,
      borderColor: color,
      // Use extendedProps to store metadata
      extendedProps: {
        source: "userId" in card ? "inbox" : "board",
        listId: card.listId,
      },
    };
  });
}

function setupFullCalendar() {
  const calendarEl = document.getElementById("board-calendar");
  if (!calendarEl) return;

  calendar = new FullCalendar.Calendar(calendarEl, {
    height: "100%",
    contentHeight: "auto",
    locale: "vi", // Set language to Vietnamese
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth",
    },

    initialView: "dayGridMonth",

    nowIndicator: true, // Hiển thị đường kẻ đỏ chỉ thời gian hiện tại
    slotMinTime: "06:00:00", // Giờ bắt đầu hiển thị trong ngày (6h sáng)
    slotMaxTime: "24:00:00", // Giờ kết thúc hiển thị (12h đêm)
    allDayText: "Cả ngày",
    slotLabelFormat: {
      // Định dạng giờ cột bên trái (VD: 13:00)
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    },

    editable: true, // Allow events to be dragged and resized
    events: function (info, successCallback, failureCallback) {
      // Mỗi khi refetchEvents được gọi, dòng này sẽ chạy lại để lấy dữ liệu mới nhất
      const events = getCalendarEvents();
      successCallback(events);
    },
    eventClick: function (info) {
      // When a calendar event is clicked, open the corresponding card modal
      const cardId = info.event.id;
      const { source, listId } = info.event.extendedProps;
      const context = { source, cardId, listId };
      openCardModal(context);
    },
    eventDrop: function (info) {
      // When an event is dropped, update the card's due date
      const cardId = info.event.id;
      const { source, listId } = info.event.extendedProps;
      const newDueDate = info.event.start.toISOString();

      const context = { source, cardId, listId };
      const updatedValues = { dueDate: newDueDate };

      if (Actions.updateCard(context, updatedValues)) {
        renderAll(); // Re-render board to reflect date changes
      } else {
        info.revert(); // Revert the change if the update fails
        alert("Không thể cập nhật ngày. Vui lòng thử lại.");
      }
    },
    dayCellDidMount: function (arg) {
      const addButton = document.createElement("button");
      addButton.className = "add-card-calendar-btn";
      addButton.innerHTML = `<i class="fa-solid fa-plus"></i>`;
      addButton.setAttribute("title", "Thêm thẻ mới");
      addButton.onclick = (e) => {
        e.stopPropagation();
        openCreateInboxCardModal(arg.date);
      };
      // Using querySelector to be safer, though fc-daygrid-day-frame should exist
      const frame = arg.el.querySelector(".fc-daygrid-day-frame");
      if (frame) {
        frame.appendChild(addButton);
      }
    },
  });

  calendar.render();
}

// --- MODALS ---
function setupCardModal() {
  cardModal.element = document.getElementById("card-modal");
  if (!cardModal.element) return;
  cardModal.form = document.getElementById("card-form");
  cardModal.inputs = {
    title: document.getElementById("card-title-input"),
    note: document.getElementById("card-note-input"),
    dueDate: document.getElementById("card-dueDate-input"),
    status: document.getElementById("card-status-input"),
  };

  // Auto-resize textarea
  const noteInput = cardModal.inputs.note;
  noteInput.addEventListener("input", () => {
    noteInput.style.height = "auto";
    noteInput.style.height = noteInput.scrollHeight + "px";
  });

  cardModal.element
    .querySelectorAll("[data-modal-close]")
    .forEach((trigger) => trigger.addEventListener("click", closeCardModal));
  cardModal.form?.addEventListener("submit", handleCardFormSubmit);
  document.getElementById("store-card-btn")?.addEventListener("click", () => {
    if (!currentCardContext) return;
    const cardRef = Actions.findCardReference(currentCardContext);
    if (cardRef) {
      cardRef.status = "done"; // Force status to done to allow storing
      if (Actions.moveCardToStorage(currentCardContext)) {
        calendar?.refetchEvents();
        renderAll();
        closeCardModal();
        console.log("store card");
      }
    }
  });
}

function openCardModal(context) {
  currentCardContext = context;
  const cardRef = Actions.findCardReference(context);
  if (!cardRef || !cardModal.element) return;
  cardModal.inputs.title.value = cardRef.title || "";
  cardModal.inputs.note.value = cardRef.note || "";

  // Manually trigger input event to set initial height
  setTimeout(() => {
    cardModal.inputs.note.dispatchEvent(new Event("input"));
  }, 10);

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
    note: cardModal.inputs.note.value.trim(),
    dueDate: cardModal.inputs.dueDate.value
      ? new Date(cardModal.inputs.dueDate.value).toISOString()
      : null,
    status: cardModal.inputs.status.value,
  };
  if (!updatedValues.title) return alert("Tiêu đề không được để trống.");

  if (Actions.updateCard(currentCardContext, updatedValues)) {
    renderAll();
    calendar?.refetchEvents();
    closeCardModal();
  }
}

// --- ARCHIVED MODAL ---
function setupArchivedModal() {
  const modal = document.getElementById("archivedModal");
  if (!modal) return;

  modal
    .querySelector(".archived-modal__close")
    ?.addEventListener("click", () => modal.classList.remove("active"));
  modal
    .querySelector(".archived-modal__backdrop")
    ?.addEventListener("click", () => modal.classList.remove("active"));

  modal.querySelectorAll(".archived-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      modal
        .querySelectorAll(".archived-tab, .archived-panel")
        .forEach((el) => el.classList.remove("active"));
      tab.classList.add("active");
      modal.querySelector(`#archived-${target}-panel`).classList.add("active");
    });
  });
}

function openArchivedModal() {
  const modal = document.getElementById("archivedModal");
  if (!modal) return;
  renderArchivedCards();
  renderArchivedLists();
  modal.classList.add("active");
}

function renderArchivedLists() {
  const container = document.getElementById("archived-lists-list");
  container.innerHTML = "";
  const archivedLists = lists.filter(
    (l) => l.storage === true && l.boardId === DEFAULT_BOARD_ID
  );

  if (archivedLists.length === 0) {
    container.innerHTML =
      '<p class="archived-empty">Không có danh sách nào đã lưu trữ</p>';
    return;
  }
  archivedLists.forEach((list) => {
    const itemCount = cards.filter((c) => c.listId === list.id).length;
    const itemEl = createArchivedItem(
      list.title,
      `${itemCount} thẻ`,
      () => {
        // Restore
        Actions.restoreList(list.id);
        renderAll();
        renderArchivedLists();
        showToast();
      },
      () => {
        // Delete
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
  const container = document.getElementById("archived-cards-list");
  container.innerHTML = "";
  const archivedBoardCards = cards.filter(
    (c) => c.storage === true && c.boardId === DEFAULT_BOARD_ID
  );
  const archivedInboxCards = cardsInbox.filter(
    (c) => c.userId === currentUser.id && c.storage === true
  );
  const allArchived = [...archivedBoardCards, ...archivedInboxCards];

  if (allArchived.length === 0) {
    container.innerHTML =
      '<p class="archived-empty">Không có thẻ nào đã lưu trữ</p>';
    return;
  }

  allArchived.forEach((card) => {
    const isInbox = "userId" in card;
    const context = {
      source: isInbox ? "inbox" : "board",
      cardId: card.id,
      listId: card.listId,
    };
    const itemEl = createArchivedItem(
      card.title,
      card.footer,
      () => {
        // Restore
        Actions.restoreCard(context);
        renderAll();
        renderArchivedCards();
        showToast();
      },
      () => {
        // Delete
        if (Actions.deletePermanentlyCard(context)) {
          renderAll();
          renderArchivedCards();
        }
      },
      isInbox ? "Hộp thư" : "Bảng"
    );
    container.appendChild(itemEl);
  });
}

function createArchivedItem(title, meta, onRestore, onDelete, badgeText) {
  const itemEl = document.createElement("div");
  itemEl.className = "archived-item";
  let badge = badgeText
    ? `<span class="archived-item__badge">${badgeText}</span>`
    : "";
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
  itemEl
    .querySelector(".archived-item__restore")
    .addEventListener("click", onRestore);
  itemEl
    .querySelector(".archived-item__delete")
    .addEventListener("click", onDelete);
  return itemEl;
}

function setupAddListModal() {
  if (document.getElementById("add-list-modal")) return;

  const modalHtml = `
      <div id="add-list-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2000; justify-content: center; align-items: center;">
        <div style="background: white; padding: 24px; border-radius: 8px; width: 320px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-size: 18px; color: #172b4d;">Thêm danh sách mới</h3>
          <input type="text" id="new-list-title" placeholder="Nhập tên danh sách..." style="width: 100%; padding: 8px 12px; margin-bottom: 20px; border: 2px solid #dfe1e6; border-radius: 4px; outline: none; font-size: 14px; box-sizing: border-box;">
          <div style="display: flex; justify-content: flex-end; gap: 8px;">
            <button id="cancel-add-list" style="padding: 8px 12px; border: none; background: #091e420f; color: #172b4d; border-radius: 4px; cursor: pointer; font-weight: 500; transition: background 0.1s;">Hủy</button>
            <button id="submit-add-list" style="padding: 8px 12px; border: none; background: #0052cc; color: white; border-radius: 4px; cursor: pointer; font-weight: 500; transition: background 0.1s;">Thêm</button>
          </div>
        </div>
      </div>
    `;
  document.body.insertAdjacentHTML("beforeend", modalHtml);

  addListModal.element = document.getElementById("add-list-modal");
  addListModal.input = document.getElementById("new-list-title");
  const cancelBtn = document.getElementById("cancel-add-list");
  const submitBtn = document.getElementById("submit-add-list");

  const closeModal = () => {
    addListModal.element.style.display = "none";
    addListModal.input.value = "";
    addListModal.input.style.borderColor = "#dfe1e6";
  };

  const handleSubmit = () => {
    const title = addListModal.input.value.trim();
    if (!title) {
      addListModal.input.style.borderColor = "#ff5630";
      addListModal.input.focus();
      return;
    }
    if (Actions.addList(DEFAULT_BOARD_ID, currentUser, title)) {
      renderBoard();
      closeModal();
    }
  };

  cancelBtn.onclick = closeModal;
  submitBtn.onclick = handleSubmit;
  addListModal.input.onkeydown = (e) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") closeModal();
  };
  addListModal.element.onclick = (e) => {
    if (e.target === addListModal.element) closeModal();
  };
}

function openAddListModal() {
  if (addListModal.element) {
    addListModal.element.style.display = "flex";
    addListModal.input.focus();
  }
}

function setupCreateCardModal() {
  if (document.getElementById("create-card-modal")) return;

  const modalHtml = `
      <div id="create-card-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2000; justify-content: center; align-items: center;">
        <div style="background: white; padding: 24px; border-radius: 8px; width: 320px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-size: 18px; color: #172b4d;">Thêm thẻ mới</h3>
          <input type="text" id="new-card-title" placeholder="Nhập tên thẻ..." style="width: 100%; padding: 8px 12px; margin-bottom: 20px; border: 2px solid #dfe1e6; border-radius: 4px; outline: none; font-size: 14px; box-sizing: border-box;">
          <div style="display: flex; justify-content: flex-start; gap: 8px;">
            <button id="cancel-create-card" style="padding: 8px 12px; border: none; background: #091e420f; color: #172b4d; border-radius: 4px; cursor: pointer; font-weight: 500; transition: background 0.1s;">Hủy</button>
            <button id="submit-create-card" style="padding: 8px 12px; border: none; background: #0052cc; color: white; border-radius: 4px; cursor: pointer; font-weight: 500; transition: background 0.1s;">Thêm</button>
          </div>
        </div>
      </div>
    `;
  document.body.insertAdjacentHTML("beforeend", modalHtml);

  createCardModal.element = document.getElementById("create-card-modal");
  createCardModal.input = document.getElementById("new-card-title");
  const cancelBtn = document.getElementById("cancel-create-card");
  const submitBtn = document.getElementById("submit-create-card");

  const closeModal = () => {
    createCardModal.element.style.display = "none";
    createCardModal.input.value = "";
    createCardModal.input.style.borderColor = "#dfe1e6";
    createCardModal.listId = null;
  };

  const handleSubmit = () => {
    const title = createCardModal.input.value.trim();
    if (!title) {
      createCardModal.input.style.borderColor = "#ff5630";
      createCardModal.input.focus();
      return;
    }
    if (
      createCardModal.listId &&
      Actions.addCard(
        createCardModal.listId,
        DEFAULT_BOARD_ID,
        currentUser,
        title
      )
    ) {
      renderBoard();
      calendar?.refetchEvents();
      closeModal();
    }
  };

  cancelBtn.onclick = closeModal;
  submitBtn.onclick = handleSubmit;
  createCardModal.input.onkeydown = (e) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") closeModal();
  };
  createCardModal.element.onclick = (e) => {
    if (e.target === createCardModal.element) closeModal();
  };
}

function openCreateCardModal(listId) {
  if (createCardModal.element) {
    createCardModal.listId = listId;
    createCardModal.element.style.display = "flex";
    createCardModal.input.focus();
  }
}

function setupCreateInboxCardModal() {
  if (document.getElementById("create-inbox-card-modal")) return;

  const modalHtml = `
      <div id="create-inbox-card-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2000; justify-content: center; align-items: center;">
        <div style="background: white; padding: 24px; border-radius: 8px; width: 320px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-size: 18px; color: #172b4d;">Thêm thẻ vào Hộp thư</h3>
          <input type="text" id="new-inbox-card-title" placeholder="Nhập tên thẻ..." style="width: 100%; padding: 8px 12px; margin-bottom: 20px; border: 2px solid #dfe1e6; border-radius: 4px; outline: none; font-size: 14px; box-sizing: border-box;">
          <div style="display: flex; justify-content: flex-start; gap: 8px;">
            <button id="cancel-create-inbox-card" style="padding: 8px 12px; border: none; background: #091e420f; color: #172b4d; border-radius: 4px; cursor: pointer; font-weight: 500; transition: background 0.1s;">Hủy</button>
            <button id="submit-create-inbox-card" style="padding: 8px 12px; border: none; background: #0052cc; color: white; border-radius: 4px; cursor: pointer; font-weight: 500; transition: background 0.1s;">Thêm</button>
          </div>
        </div>
      </div>
    `;
  document.body.insertAdjacentHTML("beforeend", modalHtml);

  createInboxCardModal.element = document.getElementById(
    "create-inbox-card-modal"
  );
  createInboxCardModal.input = document.getElementById("new-inbox-card-title");
  const cancelBtn = document.getElementById("cancel-create-inbox-card");
  const submitBtn = document.getElementById("submit-create-inbox-card");

  const closeModal = () => {
    createInboxCardModal.element.style.display = "none";
    createInboxCardModal.input.value = "";
    createInboxCardModal.input.style.borderColor = "#dfe1e6";
    createInboxCardModal.dueDate = null; // Reset date
  };

  const handleSubmit = () => {
    const title = createInboxCardModal.input.value.trim();
    if (!title) {
      createInboxCardModal.input.style.borderColor = "#ff5630";
      createInboxCardModal.input.focus();
      return;
    }
    if (
      Actions.addInboxCard(currentUser, title, createInboxCardModal.dueDate)
    ) {
      renderInbox();
      calendar?.refetchEvents();
      closeModal();
    }
  };

  cancelBtn.onclick = closeModal;
  submitBtn.onclick = handleSubmit;
  createInboxCardModal.input.onkeydown = (e) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") closeModal();
  };
  createInboxCardModal.element.onclick = (e) => {
    if (e.target === createInboxCardModal.element) closeModal();
  };
}

function openCreateInboxCardModal(date = null) {
  if (createInboxCardModal.element) {
    createInboxCardModal.dueDate = date;
    const modalTitle = createInboxCardModal.element.querySelector("h3");
    if (date) {
      modalTitle.textContent = `Thêm thẻ cho ngày ${date.toLocaleDateString(
        "vi-VN"
      )}`;
    } else {
      modalTitle.textContent = "Thêm thẻ vào Hộp thư";
    }

    createInboxCardModal.element.style.display = "flex";
    createInboxCardModal.input.focus();
  }
}

function setupExpiredCardsModal() {
  const modal = document.getElementById("expired-cards-modal");
  if (!modal) return;
  modal.querySelectorAll("[data-modal-close]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      modal.classList.remove("is-open");
    });
  });
}

function openExpiredCardsModal() {
  const modal = document.getElementById("expired-cards-modal");
  if (!modal) return;
  renderExpiredCards();
  modal.classList.add("is-open");
}

function renderExpiredCards() {
  const container = document.getElementById("expired-cards-list");
  if (!container) return;
  container.innerHTML = "";

  const now = new Date();
  const expiredBoardCards = cards.filter(
    (c) =>
      c.boardId === DEFAULT_BOARD_ID &&
      !c.storage &&
      c.dueDate &&
      new Date(c.dueDate) < now &&
      c.status !== "done"
  );
  const expiredInboxCards = cardsInbox.filter(
    (c) =>
      c.userId === currentUser.id &&
      !c.storage &&
      c.dueDate &&
      new Date(c.dueDate) < now &&
      c.status !== "done"
  );

  const allExpired = [...expiredBoardCards, ...expiredInboxCards].sort(
    (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
  );

  if (allExpired.length === 0) {
    container.innerHTML =
      '<div style="text-align: center; padding: 20px; color: #666;">Không có thẻ nào hết hạn.</div>';
    return;
  }

  allExpired.forEach((card) => {
    const isInbox = "userId" in card;
    const item = document.createElement("div");
    item.className = "expired-card-item";

    const dateString = new Date(card.dueDate).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    item.innerHTML = `
      <div style="flex: 1;">
        <div class="expired-card-item__title">${card.title}</div>
        <div class="expired-card-item__due-date">
          <i class="fa-regular fa-clock"></i> ${dateString}
          <span style="color: #666; margin-left: 8px; font-weight: normal; font-size: 0.85rem;">• ${
            isInbox ? "Hộp thư" : "Bảng"
          }</span>
        </div>
      </div>
      <button class="cta cta--secondary" style="padding: 4px 12px; font-size: 12px; min-width: auto;">Xem</button>
    `;
    item.querySelector("button").addEventListener("click", () => {
      document
        .getElementById("expired-cards-modal")
        .classList.remove("is-open");
      openCardModal({
        source: isInbox ? "inbox" : "board",
        cardId: card.id,
        listId: card.listId,
      });
    });
    container.appendChild(item);
  });
}
