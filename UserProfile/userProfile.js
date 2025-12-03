import loadComponent from "../js/loadComponents.js";
import { users } from "../Entity.js";
document.addEventListener("DOMContentLoaded", async () => {
  loadComponent("sidebar", "../components/sidebar.html");
});
setTimeout(() => {
  const logout = document.getElementById("logout2");
  logout.addEventListener("click", () => {
    sessionStorage.removeItem("currentUser");
    window.location.href = `../Login-Register/loginRegister.html`;
  });
}, 500);

let currentUser = JSON.parse(sessionStorage.getItem("currentUser")) || [];
console.log(currentUser.avatar);
const avatarStore = [
  {
    avatarURL: currentUser.avatar,
    description: "My Avatar",
  },
  {
    avatarURL: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    description: "Mặc định",
  },
  {
    avatarURL: "https://cdn-icons-png.flaticon.com/512/147/147144.png",
    description: "Nam văn phòng",
  },
  {
    avatarURL: "https://cdn-icons-png.flaticon.com/512/147/147142.png",
    description: "Nữ văn phòng",
  },
  {
    avatarURL: "https://cdn-icons-png.flaticon.com/512/1999/1999625.png",
    description: "Ninja",
  },
  {
    avatarURL: "https://cdn-icons-png.flaticon.com/512/4140/4140048.png",
    description: "Doanh nhân",
  },
  {
    avatarURL: "https://cdn-icons-png.flaticon.com/512/4140/4140037.png",
    description: "Nhà thiết kế",
  },
  {
    avatarURL: "https://cdn-icons-png.flaticon.com/512/4140/4140047.png",
    description: "Cụ già",
  },
  {
    avatarURL: "https://cdn-icons-png.flaticon.com/512/219/219983.png",
    description: "Trầm tư",
  },
  {
    avatarURL: "https://cdn-icons-png.flaticon.com/512/4140/4140061.png",
    description: "Robot",
  },
];

// Biến tạm lưu URL ảnh đang chọn (chưa save)
let tempSelectedAvatar = null;

// --- CÁC HÀM MODAL (Giữ nguyên logic) ---
document
  .querySelector(".btn-change-avatar")
  .addEventListener("click", openAvatarModal);
function openAvatarModal() {
  const modal = document.getElementById("avatarModal");
  const grid = document.getElementById("avatarGrid");

  // Xóa nội dung cũ để render lại
  grid.innerHTML = "";

  // Render danh sách avatar
  avatarStore.forEach((item) => {
    const img = document.createElement("img");
    img.src = item.avatarURL;
    img.alt = item.description;
    img.className = "grid-avatar-item";
    img.title = item.description;

    // Sự kiện click chọn ảnh
    img.onclick = function () {
      selectAvatarFromModal(item.avatarURL);
    };

    grid.appendChild(img);
  });

  modal.classList.remove("hidden");
}

document
  .querySelector(".close-btn")
  .addEventListener("click", closeAvatarModal);

function closeAvatarModal() {
  document.getElementById("avatarModal").classList.add("hidden");
}

function selectAvatarFromModal(url) {
  // 1. Cập nhật giao diện ngay
  document.getElementById("avatarImg").src = url;
  // 2. Lưu biến tạm
  tempSelectedAvatar = url;
  // 3. Đóng modal
  closeAvatarModal();
}

// Đóng modal khi click ra ngoài
window.onclick = function (event) {
  const modal = document.getElementById("avatarModal");
  if (event.target == modal) {
    closeAvatarModal();
  }
};

// --- CÁC HÀM CHÍNH (Đã đổi sang currentUser) ---

function loadUserProfile() {
  // [CHANGE]: Đổi user_data -> currentUser
  const storedData = sessionStorage.getItem("currentUser");

  let userData = { fullname: "", email: "", avatar: null, pro: false };

  if (storedData) {
    try {
      userData = JSON.parse(storedData);
    } catch (e) {}
  }

  // Binding dữ liệu
  document.getElementById("fullname").value = userData.fullname || "";
  document.getElementById("email").value = userData.email || "";

  // Load Avatar
  const defaultAvatar = avatarStore[0].avatarURL;
  document.getElementById("avatarImg").src = userData.avatar || defaultAvatar;

  // Load Pro badge
  const elmProBadge = document.getElementById("proBadge");
  const elmAccountType = document.getElementById("accountType");

  if (userData.pro) {
    elmProBadge.classList.remove("hidden");
    elmAccountType.textContent = "Thành viên PRO";
    elmAccountType.classList.add("is-pro");
  } else {
    elmProBadge.classList.add("hidden");
    elmAccountType.textContent = "Tài khoản thường";
    elmAccountType.classList.remove("is-pro");
  }
}

document.querySelector(".btn-save").addEventListener("click", saveProfile);

function saveProfile() {
  // [CHANGE]: Đổi user_data -> currentUser
  let currentData = JSON.parse(sessionStorage.getItem("currentUser")) || {};

  // Cập nhật Tên
  currentData.fullname = document.getElementById("fullname").value;

  // Cập nhật Avatar (Chỉ cập nhật nếu user có chọn ảnh mới)
  if (tempSelectedAvatar) {
    currentData.avatar = tempSelectedAvatar;
  }

  // [CHANGE]: Lưu lại với key currentUser
  sessionStorage.setItem("currentUser", JSON.stringify(currentData));

  alert("Đã cập nhật hồ sơ thành công!");
  tempSelectedAvatar = null; // Reset
}

// Khởi chạy
document.addEventListener("DOMContentLoaded", () => {
  loadUserProfile();
});
