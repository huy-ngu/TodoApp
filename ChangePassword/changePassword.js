document.addEventListener("DOMContentLoaded", () => {
  // 1. Lấy dữ liệu người dùng hiện tại
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

  // Nếu không có user đăng nhập, đá về trang login (cậu tự thay link)
  if (!currentUser) {
    alert("Bạn chưa đăng nhập!");
    window.location.href = "index.html";
    return;
  }

  const titleEl = document.getElementById("form-title");
  const oldPassGroup = document.getElementById("group-old-pass");
  const oldPassInput = document.getElementById("old-pass");

  // 2. Kiểm tra trạng thái mật khẩu (Tạo mới hay Đổi cũ)
  const hasPassword = currentUser.password && currentUser.password !== "";

  if (!hasPassword) {
    // --- TRƯỜNG HỢP: TẠO MẬT KHẨU MỚI ---
    titleEl.innerText = "Tạo Mật Khẩu Mới";
    oldPassGroup.classList.add("hidden"); // Ẩn ô nhập pass cũ
    // Loại bỏ thuộc tính required cho pass cũ để form không bắt lỗi
    oldPassInput.removeAttribute("required");
  } else {
    // --- TRƯỜNG HỢP: ĐỔI MẬT KHẨU ---
    titleEl.innerText = "Đổi Mật Khẩu";
    oldPassGroup.classList.remove("hidden");
    oldPassInput.setAttribute("required", "true");
  }

  // 3. Xử lý sự kiện Submit
  document
    .getElementById("password-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      const newPass = document.getElementById("new-pass").value;
      const confirmPass = document.getElementById("confirm-pass").value;
      const users = JSON.parse(localStorage.getItem("users")) || [];

      // Validate cơ bản
      if (newPass.length < 6) {
        showToast("Mật mới cần ít nhất 6 kí tự", "error");
        return;
      }

      if (newPass !== confirmPass) {
        showToast("Mật khẩu xác nhận không khớp!", "error");
        return;
      }

      // Logic validate pass cũ (Chỉ chạy khi đang ở chế độ Đổi mật khẩu)
      if (hasPassword) {
        if (oldPassInput.value !== currentUser.password) {
          showToast("Mật khẩu cũ không chính xác!", "error");
          return;
        }
        if (oldPassInput.value === newPass) {
          showToast("Trùng mật khẩu cũ!", "error");
          return;
        }
      }

      // 4. Lưu dữ liệu
      // Tìm user trong danh sách tổng (LocalStorage)
      const userIndex = users.findIndex((u) => u.id === currentUser.id);

      if (userIndex !== -1) {
        // Cập nhật LocalStorage (Database giả)
        users[userIndex].password = newPass;
        localStorage.setItem("users", JSON.stringify(users));

        // Cập nhật SessionStorage (Phiên hiện tại)
        currentUser.password = newPass;
        sessionStorage.setItem("currentUser", JSON.stringify(currentUser));

        const btnSave = document.querySelector(".btn-save");
        btnSave.innerHTML =
          '<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...';
        btnSave.disabled = true;
        showToast("Đổi mật khẩu thành công!", "success");

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        alert("Lỗi: Không tìm thấy tài khoản trong hệ thống!");
      }
    });
});

function togglePassword(inputId, iconSpan) {
  const input = document.getElementById(inputId);
  const svgIcon = iconSpan.querySelector("svg");

  if (input.type === "password") {
    input.type = "text";
    // Đổi icon sang con mắt có gạch chéo (Eye Slash)
    svgIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />`;
  } else {
    input.type = "password";
    // Đổi lại icon con mắt bình thường
    svgIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />`;
  }
}

function showToast(message = "Hoàn tất", type) {
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
    if (iconEl) {
      iconEl.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
    }
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
  }, 4000);
}
