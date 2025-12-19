const users = JSON.parse(sessionStorage.getItem("users"));
const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

document.addEventListener("DOMContentLoaded", async () => {
  await setupAddBoardButton();
  loadAvatar();
  loadpro();
  setupSearch();
});

async function setupSearch() {
  const { boards, baseUrl } = await import("/Entity.js");
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
      boardLink.href = `${baseUrl}/Board/board.html?board=${board.id}`;
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

  const addBoardBtn = document.querySelector(".btn-create");
  if (!addBoardBtn) {
    console.warn("Không tìm thấy nút add-board-btn");
    return;
  }

  // Xóa event listener cũ nếu có (tránh duplicate)
  const newBtn = addBoardBtn.cloneNode(true);
  addBoardBtn.parentNode.replaceChild(newBtn, addBoardBtn);

  // Thêm event listener mới
  newBtn.addEventListener("click", async () => {
    try {
      // Import động để tránh lỗi nếu module chưa load
      const { boards, baseUrl, boardThemeColors, logs } = await import(
        "/Entity.js"
      );

      // Lấy currentUser từ sessionStorage
      const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
      if (!currentUser) {
        alert("Bạn chưa đăng nhập! Vui lòng quay lại.");
        window.location.href = `${baseUrl}/Login/login.html`;
        return;
      }

      // Hỏi tên bảng mới
      const title = prompt("Tên bảng mới", "Bảng mới");
      if (!title) {
        return;
      }
      const normalizedTitle = title.trim();
      if (!normalizedTitle) return;

      // Generate ID
      const generateId = (prefix) => `${prefix}-${Date.now()}`;
      const boardId = generateId("board");
      // Tạo board mới
      const newBoard = {
        id: boardId,
        title: normalizedTitle,
        starred: false,
        userId: currentUser.id,
        theme: boardThemeColors.b1, // Theme mặc định
      };

      // Lấy boards hiện tại từ localStorage và cập nhật
      let currentBoards = JSON.parse(localStorage.getItem("boards")) || [];
      currentBoards.push(newBoard);
      localStorage.setItem("boards", JSON.stringify(currentBoards));

      console.log("[BOARD] Đã thêm bảng:", newBoard);
      console.log("[BOARD] Danh sách bảng:", currentBoards);

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

      // Chuyển đến trang board mới
      window.location.href = `${baseUrl}/board/board.html?board=${newBoard.id}`;
    } catch (error) {
      console.error("Lỗi khi thêm bảng mới:", error);
      alert("Có lỗi xảy ra khi tạo bảng mới. Vui lòng thử lại.");
    }
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
