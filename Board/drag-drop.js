import { lists, cards } from "../Entity.js";

function saveLists() {
  localStorage.setItem("lists", JSON.stringify(lists));
}

function saveCards() {
  localStorage.setItem("cards", JSON.stringify(cards));
}

export function initSortable(boardId) {
  const boardRoot = document.getElementById("board-root");
  if (!boardRoot) return;

  // Sortable for lists
  new Sortable(boardRoot, {
    group: "lists",
    animation: 150,
    handle: ".list__header",
    ghostClass: "list-ghost",
    onEnd: (evt) => {
      const { oldIndex, newIndex } = evt;
      const movedList = lists.find(
        (list) =>
          list.boardId === boardId && list.order === oldIndex
      );

      if (!movedList) return;

      // Update order of affected lists
      if (oldIndex < newIndex) {
        lists.forEach((list) => {
          if (
            list.boardId === boardId &&
            list.order > oldIndex &&
            list.order <= newIndex
          ) {
            list.order--;
          }
        });
      } else {
        lists.forEach((list) => {
          if (
            list.boardId === boardId &&
            list.order >= newIndex &&
            list.order < oldIndex
          ) {
            list.order++;
          }
        });
      }

      movedList.order = newIndex;
      saveLists();
    },
  });

  // Sortable for cards in each list
  const listElements = document.querySelectorAll(".list");
  listElements.forEach((listEl) => {
    const listId = listEl.dataset.listId;
    const cardContainer = listEl.querySelector(".list__cards");

    new Sortable(cardContainer, {
      group: "cards",
      animation: 150,
      ghostClass: "card-ghost",
      onEnd: (evt) => {
        const { from, to, oldIndex, newIndex, item } = evt;
        const cardId = item.dataset.cardId;
        const fromListId = from.closest(".list").dataset.listId;
        const toListId = to.closest(".list").dataset.listId;

        const card = cards.find((c) => c.id === cardId);
        if (!card) return;

        // Reorder cards in the source list
        const fromListCards = Array.from(from.children);
        fromListCards.forEach((cardEl, index) => {
          const cId = cardEl.dataset.cardId;
          const c = cards.find((c) => c.id === cId);
          if (c) c.order = index;
        });

        if (fromListId !== toListId) {
            card.listId = toListId;
        }

        const toListCards = Array.from(to.children);
        toListCards.forEach((cardEl, index) => {
          const cId = cardEl.dataset.cardId;
          const c = cards.find((c) => c.id === cId);
          if (c) c.order = index;
        });
        
        saveCards();
      },
    });
  });
}
