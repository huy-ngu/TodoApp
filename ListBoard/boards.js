const boards = [
  {
    id: "b1",
    title: "Bảng 1",
    starred: false,
    userId: "user-1",
    theme: "linear-gradient(90deg,rgba(131, 58, 180, 1) 0%, rgba(253, 29, 29, 1) 50%, rgba(252, 176, 69, 1) 100%)"

  },
  {
    id: "b2",
    title: "Bảng toi day",
    starred: true,
    userId: "user-1",
    theme: "radial-gradient(circle,rgba(238, 174, 202, 1) 0%, rgba(148, 187, 233, 1) 100%);"
  },
];

const containerBoard = document.getElementById("board-list");

boards.forEach(board => {
  containerBoard.innerHTML += `
  <a href="/index.html?board=${board.id}"></div>
        <div class="board">
            <div class="board-theme" style="background: ${board.theme};"></div>
            <div class="board-title">${board.title}</div>
        </div>
    </a>`;
});

const containerStarBoard = document.getElementById("board-star-list");

boards.forEach(board => {
  if(board.starred == true) {
    console.log("true");
    containerStarBoard.innerHTML += ` 
    <a href="/index.html?board=${board.id}"></div>
        <div class="board">
            <div class="board-theme" style="background: ${board.theme};"></div>
            <div class="board-title">${board.title}</div>
        </div>
    </a>`;
  }
});