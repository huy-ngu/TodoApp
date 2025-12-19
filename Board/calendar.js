import { boards, cards, baseUrl } from "../Entity.js";

document.addEventListener("DOMContentLoaded", function () {
  const monthYearElement = document.getElementById("month-year");
  const calendarDaysElement = document.getElementById("calendar-days");
  const prevMonthButton = document.getElementById("prev-month");
  const nextMonthButton = document.getElementById("next-month");
  const boardLink = document.getElementById("board-link");

  const urlParams = new URLSearchParams(window.location.search);
  const boardId = urlParams.get("board");

  if (boardId) {
    boardLink.href = `${baseUrl}/Board/board.html?board=${boardId}`;
  }

  let currentDate = new Date();

  function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const boardId = new URLSearchParams(window.location.search).get("board");

    monthYearElement.textContent = `${new Intl.DateTimeFormat("vi-VN", {
      month: "long",
    }).format(date)} ${year}`;

    calendarDaysElement.innerHTML = "";

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();

    for (let i = 0; i < firstDayOfWeek; i++) {
      const emptyCell = document.createElement("div");
      emptyCell.classList.add("calendar-day", "empty");
      calendarDaysElement.appendChild(emptyCell);
    }

    for (let day = 1; day <= totalDays; day++) {
      const dayCell = document.createElement("div");
      dayCell.classList.add("calendar-day");
      dayCell.textContent = day;

      const today = new Date();
      if (
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()
      ) {
        dayCell.classList.add("today");
      }
      const dayCards = cards.filter(
        (card) =>
          card.boardId === boardId &&
          new Date(card.dueDate).toLocaleDateString("vi-VN") ===
            new Date(year, month, day).toLocaleDateString("vi-VN")
      );

      if (dayCards.length > 0) {
        const cardsList = document.createElement("ul");
        cardsList.classList.add("cards-list");
        dayCards.forEach((card) => {
          const cardItem = document.createElement("li");
          cardItem.textContent = card.title;
          cardsList.appendChild(cardItem);
        });
        dayCell.appendChild(cardsList);
      }

      calendarDaysElement.appendChild(dayCell);
    }
  }

  prevMonthButton.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
  });

  nextMonthButton.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
  });

  renderCalendar(currentDate);
});
