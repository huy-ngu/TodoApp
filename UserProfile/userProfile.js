import loadComponent from "../js/loadComponents.js";
import { users } from "../Entity.js";

const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
if (!currentUser) {
  alert("Bạn chưa đăng nhập! Vui lòng quay lại.");
  window.location.href = `../Login-Register/loginRegister.html`;
}

document.addEventListener("DOMContentLoaded", async () => {
  loadComponent("sidebar", "../components/sidebar.html");
  loadUserProfile();
});

setTimeout(() => {
  const logout = document.getElementById("logout2");
  logout.addEventListener("click", () => {
    sessionStorage.removeItem("currentUser");
    window.location.href = `../Login-Register/loginRegister.html`;
  });
}, 500);

const avatarStore = [
  {
    avatarURL: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    description: "Mặc định",
  },
  {
    avatarURL: "https://4kwallpapers.com/images/walls/thumbs_3t/23966.jpg",
    description: "Messi",
  },
  {
    avatarURL: "https://4kwallpapers.com/images/walls/thumbs_3t/6979.jpg",
    description: "Ronaldo",
  },
  {
    avatarURL: "https://4kwallpapers.com/images/walls/thumbs_3t/23494.jpg",
    description: "avatar1",
  },
  {
    avatarURL: "https://4kwallpapers.com/images/walls/thumbs_3t/8719.jpg",
    description: "avatar2",
  },
  {
    avatarURL: "https://images2.alphacoders.com/134/thumb-1920-1347655.jpeg",
    description: "yasuo",
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
  const defaultAvatar = currentUser.avatar;
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
  let user = users.find((user) => user.id === currentUser.id);

  // [CHANGE]: Đổi user_data -> currentUser
  let currentData = JSON.parse(sessionStorage.getItem("currentUser")) || {};

  // Cập nhật Tên
  currentData.fullname = document.getElementById("fullname").value;
  user.fullname = currentData.fullname;

  // Cập nhật Email
  currentData.email = document.getElementById("email").value;
  user.email = currentData.email;

  // Cập nhật Avatar (Chỉ cập nhật nếu user có chọn ảnh mới)
  if (tempSelectedAvatar) {
    currentData.avatar = tempSelectedAvatar;
    user.avatar = currentData.avatar;
  }

  // [CHANGE]: Lưu lại với key currentUser
  sessionStorage.setItem("currentUser", JSON.stringify(currentData));
  localStorage.setItem("users", JSON.stringify(users));

  let logs = localStorage.getItem("logs")
    ? JSON.parse(localStorage.getItem("logs"))
    : [];

  const newLog = {
    id: `log-${Date.now()}`,
    userId: currentUser.id,
    userName: currentUser.name,
    content: `Đã chỉnh sửa hồ sơ`,
    objectId: "",
    createAt: Date.now(),
  };
  logs.push(newLog);
  localStorage.setItem("logs", JSON.stringify(logs));

  // alert("Đã cập nhật hồ sơ thành công!");
  showToast("Sửa thành công!", "success");
  tempSelectedAvatar = null; // Reset
}

function showToast(message = "Hoàn tất", type = "success") {
  const x = document.getElementById("toast");
  if (!x) return;
  const textEl = x.querySelector(".toast-text");
  const iconEl = x.querySelector(".toast-icon");

  // Set text
  if (textEl) textEl.textContent = message;

  // Set variant (error / success)
  x.classList.remove("error");
  if (type === "error") {
    x.classList.add("error");
    if (iconEl) iconEl.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
  } else {
    // success
    if (iconEl) iconEl.innerHTML = '<i class="fas fa-check-circle"></i>';
  }

  // Show
  x.classList.add("show");

  // Hide after 3s
  setTimeout(() => {
    x.classList.remove("show");
    x.classList.remove("error");
  }, 3000);
}
