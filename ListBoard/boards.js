import { boards, baseUrl, boardThemeColors } from "../Entity.js";
import  loadComponent from "../js/loadComponents.js";
console.log(boards);
const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
if (!currentUser) {
    alert("Bạn chưa đăng nhập! Vui lòng quay lại.");
    window.location.href = `${baseUrl}/Login-Register/loginRegister.html`;
}

// Render lại danh sách boards
function renderBoards() {
  const containerBoard = document.getElementById("board-list");
  const containerStarBoard = document.getElementById("board-star-list");
  
  // Xóa nội dung cũ
  containerBoard.innerHTML = '';
  containerStarBoard.innerHTML = '';
  
  // Render tất cả boards của user
  boards.forEach(board => {
    if(board.userId === currentUser.id) {
      // Icon ngôi sao: ★ nếu starred, ☆ nếu không
      const starIcon = board.starred ? '★' : '☆';
      const starClass = board.starred ? 'starred' : '';
      
      const boardHTML = `
        <a href="/board/board.html?board=${board.id}">
          <div class="board">
            <div class="board-theme" style="background: ${board.theme};">
              <span class="star-icon-board ${starClass}" data-board-id="${board.id}">${starIcon}</span>
            </div>
            <div class="board-title">${board.title}</div>
          </div>
        </a>`;
      
      containerBoard.innerHTML += boardHTML;
      
      // Nếu starred, thêm vào danh sách starred
      if(board.starred === true) {
        containerStarBoard.innerHTML += boardHTML;
      }
    }
  });
  
  // Setup event listeners cho các ngôi sao
  setupStarButtons();
}

// Render lần đầu
renderBoards();

const generateId = (() => {
  let counter = 0;
  return (prefix) => `${prefix}-${Date.now()}`;
})();
document.addEventListener("DOMContentLoaded", async () => {
  // const isHeaderLoaded = await loadComponent("header-placeholder", "../components/header.html");
  //   if (isHeaderLoaded) {
  //       const userJson = sessionStorage.getItem('currentUser');
  //       const avatarImg = document.querySelector('.avatar'); 
  //       if (userJson && avatarImg) {
  //       // Parse từ chuỗi JSON về Object
  //       const user = JSON.parse(userJson);
  //       // 2. Thay đổi đường dẫn ảnh
  //       avatarImg.src = user.avatar;        
  //       console.log(avatarImg.src);
  //       } else {
  //       // Chưa đăng nhập -> Để ảnh mặc định hoặc ẩn đi
  //       if(avatarImg) avatarImg.src = "https://ui-avatars.com/api/?name=Guest";
  //       }
  //   }
  loadComponent("sidebar", "../components/sidebar.html");
});



// xu li them bang - đã được xử lý trong layout.js
// Logic xử lý nút "Thêm mới bảng" đã được chuyển vào components/layout.js
// để có thể dùng chung cho tất cả các trang (boards, admin, templates)

function updateBoardUrl(boardId) {
  const url = new URL(window.location.href);
  url.searchParams.set("board", boardId);
  window.history.pushState({ boardId }, "", url);
}

/**
 * Setup event listeners cho các nút ngôi sao
 */
function setupStarButtons() {
  const starButtons = document.querySelectorAll('.star-icon-board');
  
  starButtons.forEach(starBtn => {
    // Xóa event listener cũ nếu có
    const newStarBtn = starBtn.cloneNode(true);
    starBtn.parentNode.replaceChild(newStarBtn, starBtn);
    
    // Thêm event listener mới
    newStarBtn.addEventListener('click', (e) => {
      e.preventDefault(); // Ngăn chặn chuyển trang khi click vào ngôi sao
      e.stopPropagation(); // Ngăn chặn event bubbling
      
      const boardId = newStarBtn.getAttribute('data-board-id');
      if (boardId) {
        toggleBoardStar(boardId);
      }
    });
  });
}

/**
 * Toggle trạng thái starred của board
 */
function toggleBoardStar(boardId) {
  const board = boards.find((b) => b.id === boardId);
  if (!board) {
    console.warn("[BOARD] Không tìm thấy board với id:", boardId);
    return;
  }
  
  // Đổi trạng thái starred
  board.starred = !board.starred;
  
  // Lưu vào localStorage
  localStorage.setItem('boards', JSON.stringify(boards));
  
  console.log("[BOARD] Đã toggle starred:", {
    boardId: board.id,
    boardTitle: board.title,
    starred: board.starred,
  });
  
  // Render lại danh sách
  renderBoards();
}

// Xử lý nút đăng xuất
const logoutBtn = document.querySelector('.logout-btn');
if (logoutBtn) {
    console.log(logoutBtn);

    logoutBtn.addEventListener('click', function(event) {
        // Ngăn thẻ a chuyển trang theo href="#"
        event.preventDefault(); 
        sessionStorage.removeItem('currentUser');
        window.location.href = '/Index.html'; 
        
    });
}