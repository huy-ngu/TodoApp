import {
  boards,
  lists,
  cards,
  inboxData,
  cardsInbox,
  logs,
  baseUrl,
} from "../Entity.js";
import { generateId } from "./utils.js";

// --- Board Actions ---

export function toggleBoardStar(DEFAULT_BOARD_ID) {
  const board = boards.find((b) => b.id === DEFAULT_BOARD_ID);
  if (!board) return false;
  board.starred = !board.starred;
  localStorage.setItem("boards", JSON.stringify(boards));
  return true;
}

export function updateBoardTheme(DEFAULT_BOARD_ID, newTheme) {
  const board = boards.find((b) => b.id === DEFAULT_BOARD_ID);
  if (!board) return;
  board.theme = newTheme;
  localStorage.setItem("boards", JSON.stringify(boards));
}

export function deleteBoard(DEFAULT_BOARD_ID) {
  const confirmMessage = `Bạn có chắc chắn muốn xóa bảng này không? Hành động này sẽ xóa vĩnh viễn tất cả danh sách và thẻ trong đó.`;
  if (!confirm(confirmMessage)) return false;

  const boardIndex = boards.findIndex((b) => b.id === DEFAULT_BOARD_ID);
  if (boardIndex === -1) return false;

  const listsToDelete = lists.filter(
    (list) => list.boardId === DEFAULT_BOARD_ID
  );
  const listIdsToDelete = listsToDelete.map((list) => list.id);

  // In-place filtering of lists and cards
  const remainingLists = lists.filter(
    (list) => list.boardId !== DEFAULT_BOARD_ID
  );
  const remainingCards = cards.filter(
    (card) => !listIdsToDelete.includes(card.listId)
  );

  // Overwrite the original arrays
  lists.length = 0;
  Array.prototype.push.apply(lists, remainingLists);
  cards.length = 0;
  Array.prototype.push.apply(cards, remainingCards);

  boards.splice(boardIndex, 1);

  localStorage.setItem("boards", JSON.stringify(boards));
  localStorage.setItem("lists", JSON.stringify(lists));
  localStorage.setItem("cards", JSON.stringify(cards));

  window.location.href = `${baseUrl}/ListBoard/boards.html`;
  return true;
}

export function logout() {
  sessionStorage.removeItem("currentUser");
  window.location.href = `${baseUrl}/Login-Register/loginRegister.html`;
}

// --- List Actions ---

export function addList(DEFAULT_BOARD_ID, currentUser) {
  const title = prompt("Tên danh sách mới", "Danh sách mới");
  if (!title || !title.trim()) return null;

  const newList = {
    id: generateId("list"),
    title: title.trim(),
    boardId: DEFAULT_BOARD_ID,
    theme: "blue",
    storage: false,
    order: lists.filter(list => list.boardId === DEFAULT_BOARD_ID).length,
  };
  lists.push(newList);
  localStorage.setItem("lists", JSON.stringify(lists));

  const newLog = {
    id: generateId("log"),
    userId: currentUser.id,
    userName: currentUser.name,
    content: `Đã thêm danh sách vào bảng`,
    objectId: DEFAULT_BOARD_ID,
    createAt: Date.now(),
  };
  logs.push(newLog);
  localStorage.setItem("logs", JSON.stringify(logs));
  return newList;
}

export function updateListTitle(listId, newTitle) {
  const list = lists.find((l) => l.id === listId);
  if (!list) return;
  const trimmedTitle = newTitle.trim();
  if (trimmedTitle) {
    list.title = trimmedTitle;
    localStorage.setItem("lists", JSON.stringify(lists));
  }
}

export function updateListTheme(listId, newTheme) {
  const list = lists.find((l) => l.id === listId);
  if (!list) return;
  list.theme = newTheme;
  localStorage.setItem("lists", JSON.stringify(lists));
}

export function moveListToStorage(listId) {
  const list = lists.find((l) => l.id === listId);
  if (!list) return;
  list.storage = true;
  localStorage.setItem("lists", JSON.stringify(lists));
}

export function moveAllCardsToStorage(listId) {
  cards.forEach((card) => {
    if (card.listId === listId) {
      card.storage = true;
    }
  });
  localStorage.setItem("cards", JSON.stringify(cards));
}

export function restoreList(listId) {
  const list = lists.find((l) => l.id === listId);
  if (!list) return;
  list.storage = false;
  localStorage.setItem("lists", JSON.stringify(lists));
}

export function deletePermanentlyList(listId) {
  const confirmMessage = `Bạn có chắc chắn muốn xóa vĩnh viễn danh sách này và tất cả thẻ trong đó không?`;
  if (!confirm(confirmMessage)) return false;

  const remainingLists = lists.filter((l) => l.id !== listId);
  const remainingCards = cards.filter((c) => c.listId !== listId);

  lists.length = 0;
  Array.prototype.push.apply(lists, remainingLists);
  cards.length = 0;
  Array.prototype.push.apply(cards, remainingCards);

  localStorage.setItem("lists", JSON.stringify(lists));
  localStorage.setItem("cards", JSON.stringify(cards));
  return true;
}

// --- Card Actions ---

function promptForCardInput(defaults = {}) {
  const title = prompt("Tên thẻ mới", defaults.title || "Nhiệm vụ mới");
  if (!title || !title.trim()) return null;

  // Default due date is 1 day from now
  const defaultDueDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return {
    title: title.trim(),
    dueDate: defaultDueDate.toISOString(),
    status: defaults.status || "pending",
  };
}

export function addCard(listId, DEFAULT_BOARD_ID, currentUser) {
  const cardInput = promptForCardInput();
  if (!cardInput) return null;
  const newCard = {
    id: generateId("card"),
    ...cardInput,
    listId: listId,
    storage: false,
    boardId: DEFAULT_BOARD_ID,
    order: cards.filter(card => card.listId === listId).length,
    note: "",
  };
  cards.push(newCard);
  localStorage.setItem("cards", JSON.stringify(cards));
  const newLog = {
    id: generateId("log"),
    userId: currentUser.id,
    userName: currentUser.name,
    content: "Đã thêm thẻ vào",
    objectId: listId,
    createAt: Date.now(),
  };
  logs.push(newLog);
  localStorage.setItem("logs", JSON.stringify(logs));
  return newCard;
}

export function addInboxCard(currentUser) {
  const cardInput = promptForCardInput();
  if (!cardInput) return null;
  const newCard = {
    id: generateId("inbox-card"),
    ...cardInput,
    userId: currentUser.id,
    storage: false,
  };
  cardsInbox.unshift(newCard);
  localStorage.setItem("cardsInbox", JSON.stringify(cardsInbox));
  return newCard;
}

export function updateCard(context, updatedValues) {
  const cardRef = findCardReference(context);
  if (!cardRef) return false;
  Object.assign(cardRef, updatedValues);
  if (context.source === "board") {
    localStorage.setItem("cards", JSON.stringify(cards));
  } else {
    localStorage.setItem("cardsInbox", JSON.stringify(cardsInbox));
  }
  return true;
}

export function toggleCardStatus(context) {
  const cardRef = findCardReference(context);
  if (!cardRef) return;
  cardRef.status = cardRef.status === "done" ? "pending" : "done";
  if (context.source === "board") {
    localStorage.setItem("cards", JSON.stringify(cards));
  } else {
    localStorage.setItem("cardsInbox", JSON.stringify(cardsInbox));
  }
}

export function moveCardToStorage(context) {
  const cardRef = findCardReference(context);
  if (!cardRef || cardRef.status !== "done") return false;
  cardRef.storage = true;
  if (context.source === "board") {
    localStorage.setItem("cards", JSON.stringify(cards));
  } else {
    localStorage.setItem("cardsInbox", JSON.stringify(cardsInbox));
  }
  return true;
}

export function restoreCard(context) {
  const cardRef = findCardReference(context);
  if (!cardRef) return;
  cardRef.storage = false;
  if (context.source === "board") {
    localStorage.setItem("cards", JSON.stringify(cards));
  } else {
    localStorage.setItem("cardsInbox", JSON.stringify(cardsInbox));
  }
}

export function deletePermanentlyCard(context) {
  if (!confirm("Bạn có chắc chắn muốn xóa vĩnh viễn thẻ này?")) return false;

  let cardIndex = -1;
  if (context.source === "board") {
    cardIndex = cards.findIndex((c) => c.id === context.cardId);
    if (cardIndex !== -1) cards.splice(cardIndex, 1);
    localStorage.setItem("cards", JSON.stringify(cards));
  } else {
    cardIndex = cardsInbox.findIndex((c) => c.id === context.cardId);
    if (cardIndex !== -1) cardsInbox.splice(cardIndex, 1);
    localStorage.setItem("cardsInbox", JSON.stringify(cardsInbox));
  }
  return cardIndex !== -1;
}

// --- Inbox Actions ---

export function updateInboxTheme(newTheme) {
  inboxData.theme = newTheme;
  localStorage.setItem("inboxData", JSON.stringify(inboxData));
}

// --- Utility ---
export function findCardReference(context) {
  if (context.source === "board") {
    return (
      cards.find(
        (card) => card.id === context.cardId && card.listId === context.listId
      ) || null
    );
  }
  if (context.source === "inbox") {
    return cardsInbox.find((card) => card.id === context.cardId) || null;
  }
  return null;
}
