import { boards, baseUrl, boardThemeColors } from "../Entity.js";
console.log(boards);
console.log(boardThemeColors);
const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
if (!currentUser) {
    alert("Bạn chưa đăng nhập! Vui lòng quay lại.");
    window.location.href = `${baseUrl}/Login/login.html`;
}


const containerBoard = document.getElementById("board-list");

boards.forEach(board => {
  containerBoard.innerHTML += `
  <a href="/index.html?board=${board.id}"></div>
        <div class="board">
            <div class="board-theme" style="background: ${board.theme};">
            <span class="star-icon-board" >☆</span>
            </div>
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
            <div class="board-theme" style="background: ${board.theme};">           
              <span class="star-icon-board" >☆</span>
            </div>
            <div class="board-title">${board.title}</div>
        </div>
    </a>`;
  }
});

const generateId = (() => {
  let counter = 0;
  return (prefix) => `${prefix}-${Date.now()}`;
})();



// xu li them bang
document.addEventListener("DOMContentLoaded", () => {
    setupAddBoardButton();
});


function setupAddBoardButton() {
  const addBoardBtn = document.getElementById("add-board-btn");
  if (!addBoardBtn) return;
  addBoardBtn.addEventListener("click", handleAddBoard);
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
    theme: `${boardThemeColors.b1}`, // Theme mặc định
  };

  boards.push(newBoard);
  localStorage.setItem('boards', JSON.stringify(boards));

  console.log("[BOARD] Đã thêm bảng:", newBoard);
  console.log("[BOARD] Danh sách bảng:", boards);

  // Cập nhật URL với query parameter board=boardId
  updateBoardUrl(newBoard.id);

  // Render board mới
  window.location.href = `${baseUrl}/index.html?board=${newBoard.id}`;

}

function updateBoardUrl(boardId) {
  const url = new URL(window.location.href);
  url.searchParams.set("board", boardId);
  window.history.pushState({ boardId }, "", url);
}