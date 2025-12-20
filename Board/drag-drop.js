import { lists, cards, cardsInbox } from "../Entity.js";

function saveLists() {
  localStorage.setItem("lists", JSON.stringify(lists));
}

function saveCards() {
  localStorage.setItem("cards", JSON.stringify(cards));
}
function saveCardsInbox() {
  localStorage.setItem("cardsInbox", JSON.stringify(cardsInbox));
}

/**
 * Cập nhật lại thuộc tính `order` của các card trong một mảng dựa trên
 * thứ tự của chúng trong DOM container.
 * @param {HTMLElement} containerElement - DOM element chứa các card.
 * @param {Array} cardArray - Mảng dữ liệu card (cards hoặc cardsInbox).
 */
function reorderArray(containerElement, cardArray) {
  const cardElements = Array.from(containerElement.children);
  cardElements.forEach((el, index) => {
    const cardId = el.dataset.cardId;
    // Tìm card trong cả hai mảng vì nó có thể đã được chuyển đi
    const card = cards.find(c => c.id === cardId) || cardsInbox.find(c => c.id === cardId);
    if (card) {
      card.order = index;
    }
  });
}

export function initSortable(boardId) {
  const boardRoot = document.getElementById("board-root");
  if (boardRoot) {
    // Kéo thả để sắp xếp các danh sách (list)
    new Sortable(boardRoot, {
      group: "lists",
      animation: 150,
      handle: ".list__header",
      ghostClass: "list-ghost",
      onEnd: (evt) => {
        const { oldIndex, newIndex } = evt;
        const movedList = lists.find(
          (list) => list.boardId === boardId && list.order === oldIndex
        );
        if (!movedList) return;

        if (oldIndex < newIndex) {
          lists.forEach((list) => {
            if (list.boardId === boardId && list.order > oldIndex && list.order <= newIndex) {
              list.order--;
            }
          });
        } else {
          lists.forEach((list) => {
            if (list.boardId === boardId && list.order >= newIndex && list.order < oldIndex) {
              list.order++;
            }
          });
        }
        movedList.order = newIndex;
        saveLists();
      },
    });
  }

  // Kéo thả cho các card trong từng danh sách trên bảng
  document.querySelectorAll(".list__cards").forEach((cardContainer) => {
    new Sortable(cardContainer, {
      group: "cards",
      animation: 150,
      ghostClass: "card-ghost",
      onEnd: (evt) => {
        const { from, to, item } = evt;
        const cardId = item.dataset.cardId;
        const isMoveToInbox = to.id === 'inbox-root';

        // TRƯỜNG HỢP 1: Kéo thẻ từ danh sách trên bảng VÀO INBOX
        if (isMoveToInbox) {
          const cardIndex = cards.findIndex(c => c.id === cardId);
          if (cardIndex > -1) {
            const [movedCard] = cards.splice(cardIndex, 1);
            delete movedCard.listId;
            const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
            if (currentUser) {
              movedCard.userId = currentUser.id;
            }
            cardsInbox.push(movedCard);
          }
        } 
        // TRƯỜNG HỢP 2: Kéo thẻ giữa các danh sách trên bảng (hoặc trong cùng 1 danh sách)
        else {
          const card = cards.find(c => c.id === cardId);
          if (card) {
            const toListId = to.closest('.list').dataset.listId;
            card.listId = toListId;
          }
        }

        // Sắp xếp lại dữ liệu order cho cả danh sách nguồn và đích
        reorderArray(from, cards);
        reorderArray(to, isMoveToInbox ? cardsInbox : cards);
        
        saveCards();
        saveCardsInbox();
      },
    });
  });

  // Kéo thả cho các card trong Inbox
  const inboxRoot = document.getElementById("inbox-root");
  if (inboxRoot) {
    new Sortable(inboxRoot, {
      group: "cards",
      animation: 150,
      ghostClass: "card-ghost",
      onEnd: (evt) => {
        const { from, to, item } = evt;
        const cardId = item.dataset.cardId;
        const toListId = to.closest(".list")?.dataset.listId;

        // TRƯỜNG HỢP 1: Kéo thẻ từ INBOX ra một danh sách trên bảng
        if (toListId) {
          const cardIndex = cardsInbox.findIndex(c => c.id === cardId);
          if (cardIndex > -1) {
            const [movedCard] = cardsInbox.splice(cardIndex, 1);
            movedCard.listId = toListId;
            cards.push(movedCard);
          }
        }
        // TRƯỜNG HỢP 2: Kéo thẻ trong cùng INBOX (sắp xếp)
        // Không cần xử lý data transfer, chỉ cần sắp xếp lại

        // Sắp xếp lại dữ liệu order cho cả danh sách nguồn và đích
        reorderArray(from, cardsInbox);
        reorderArray(to, toListId ? cards : cardsInbox);

        saveCards();
        saveCardsInbox();
      },
    });
  }
}
