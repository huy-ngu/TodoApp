const users = JSON.parse(sessionStorage.getItem("users"));
const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

document.addEventListener("DOMContentLoaded", async () => {
  await setupAddBoardButton();
  loadAvatar();
  loadpro();
  setupSearch();
});

async function setupSearch() {
  const { boards, baseUrl } = await import("../Entity.js");
  const searchInput = document.querySelector(".search-box input");
  const searchResults = document.getElementById("search-results");

  if (!searchInput || !searchResults) return;

  const userBoards = boards.filter(
    (board) => board.userId === (currentUser && currentUser.id)
  );

  const renderResults = (filteredBoards) => {
    searchResults.innerHTML = "";
    if (filteredBoards.length === 0) {
      searchResults.classList.remove("show");
      return;
    }

    filteredBoards.forEach((board) => {
      const boardLink = document.createElement("a");
      boardLink.href = `../Board/board.html?board=${board.id}`;
      boardLink.textContent = board.title;
      searchResults.appendChild(boardLink);
    });

    searchResults.classList.add("show");
  };

  searchInput.addEventListener("focus", () => {
    if (!currentUser) return;
    renderResults(userBoards);
  });

  searchInput.addEventListener("keyup", () => {
    if (!currentUser) return;
    const searchTerm = searchInput.value.toLowerCase();
    const filteredBoards = userBoards.filter((board) =>
      board.title.toLowerCase().includes(searchTerm)
    );
    renderResults(filteredBoards);
  });

  searchInput.addEventListener("blur", () => {
    // Dùng timeout để người dùng có thể click vào kết quả
    setTimeout(() => {
      searchResults.classList.remove("show");
    }, 200);
  });
}

async function setupAddBoardButton() {
  const response = await fetch("../components/header.html");
  const html = await response.text();

  document.getElementById("header-placeholder").innerHTML = html;

  // --- TẠO MODAL HTML (Inject vào body) ---
  if (!document.getElementById("create-board-modal")) {
    const modalHtml = `
      <div id="create-board-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2000; justify-content: center; align-items: center;">
        <div style="background: white; padding: 24px; border-radius: 8px; width: 320px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-size: 18px; color: #172b4d;">Tạo bảng mới</h3>
          <input type="text" id="new-board-title" placeholder="Nhập tên bảng..." style="width: 100%; padding: 8px 12px; margin-bottom: 20px; border: 2px solid #dfe1e6; border-radius: 4px; outline: none; font-size: 14px; box-sizing: border-box;">
          <div style="display: flex; justify-content: flex-end; gap: 8px;">
            <button id="cancel-create-board" style="padding: 8px 12px; border: none; background: #091e420f; color: #172b4d; border-radius: 4px; cursor: pointer; font-weight: 500; transition: background 0.1s;">Hủy</button>
            <button id="submit-create-board" style="padding: 8px 12px; border: none; background: #0052cc; color: white; border-radius: 4px; cursor: pointer; font-weight: 500; transition: background 0.1s;">Tạo bảng</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHtml);
  }

  const addBoardBtn = document.querySelector(".btn-create");
  if (!addBoardBtn) {
    console.warn("Không tìm thấy nút add-board-btn");
    return;
  }

  // Xóa event listener cũ nếu có (tránh duplicate)
  const newBtn = addBoardBtn.cloneNode(true);
  addBoardBtn.parentNode.replaceChild(newBtn, addBoardBtn);

  // --- XỬ LÝ LOGIC MODAL ---
  const modal = document.getElementById("create-board-modal");
  const input = document.getElementById("new-board-title");
  const cancelBtn = document.getElementById("cancel-create-board");
  const submitBtn = document.getElementById("submit-create-board");

  const closeModal = () => {
    modal.style.display = "none";
    input.value = "";
    input.style.borderColor = "#dfe1e6";
  };

  const handleCreate = async () => {
    const title = input.value.trim();
    if (!title) {
      input.style.borderColor = "#ff5630"; // Báo lỗi đỏ nếu rỗng
      input.focus();
      return;
    }

    try {
      const { boards, baseUrl, boardThemeColors, logs } = await import(
        "../Entity.js"
      );
      const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

      const generateId = (prefix) => `${prefix}-${Date.now()}`;
      const boardId = generateId("board");

      const newBoard = {
        id: boardId,
        title: title,
        starred: false,
        userId: currentUser.id,
        theme: boardThemeColors.b1,
      };

      let currentBoards = JSON.parse(localStorage.getItem("boards")) || [];
      currentBoards.push(newBoard);
      localStorage.setItem("boards", JSON.stringify(currentBoards));

      const newLog = {
        id: generateId("log"),
        userId: currentUser.id,
        userName: currentUser.name,
        content: `Đã thêm bảng `,
        objectId: boardId,
        createAt: Date.now(),
      };
      logs.push(newLog);
      localStorage.setItem("logs", JSON.stringify(logs));

      window.location.href = `../Board/board.html?board=${newBoard.id}`;
      closeModal();
    } catch (error) {
      console.error("Lỗi khi thêm bảng mới:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  // Gán sự kiện cho các nút trong modal
  cancelBtn.onclick = closeModal;
  submitBtn.onclick = handleCreate;
  input.onkeydown = (e) => {
    if (e.key === "Enter") handleCreate();
    if (e.key === "Escape") closeModal();
  };
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  // Thêm event listener mới
  newBtn.addEventListener("click", async () => {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    if (!currentUser) {
      alert("Bạn chưa đăng nhập! Vui lòng quay lại.");
      window.location.href = `../Login/login.html`;
      return;
    }
    modal.style.display = "flex";
    input.value = "";
    input.focus();
  });
}

function loadAvatar() {
  setTimeout(() => {
    const userJson = sessionStorage.getItem("currentUser");
    const avatarImg = document.querySelector(".avatar");
    if (userJson && avatarImg) {
      // Parse từ chuỗi JSON về Object
      const user = JSON.parse(userJson);
      // 2. Thay đổi đường dẫn ảnh
      avatarImg.src = user.avatar;
      console.log(avatarImg.src);
    } else {
      // Chưa đăng nhập -> Để ảnh mặc định hoặc ẩn đi
      if (avatarImg) avatarImg.src = "https://ui-avatars.com/api/?name=Guest";
    }
  }, 200);
}

document.addEventListener("click", function (event) {
  // 1. Kiểm tra xem người dùng có click vào .avatar không
  if (event.target.matches(".avatar")) {
    const dropdown = document.getElementById("myDropdown");
    if (dropdown) dropdown.classList.toggle("show");
  }
  // 2. Nếu không click vào avatar cũng không click vào menu -> Đóng menu
  else if (!event.target.closest(".user-menu-container")) {
    const dropdowns = document.getElementsByClassName("dropdown-menu");
    for (let i = 0; i < dropdowns.length; i++) {
      if (dropdowns[i].classList.contains("show")) {
        dropdowns[i].classList.remove("show");
      }
    }
  }
});

function logout() {
  sessionStorage.removeItem("currentUser");
}

function loadpro() {
  const proele = document.getElementById("pro");
  if (currentUser.pro) proele.style.display = "block";
}
