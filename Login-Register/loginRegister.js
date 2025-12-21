import { users, baseUrl } from "../Entity.js";
//testbrach
// sử lí hiêu ứng chuyển đổi giữa đăng nhập và đăng ký
const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

// Mở chế độ đăng ký khi URL có ?mode=signup hoặc hash #signup
(function initModeFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "signup" || window.location.hash === "#signup") {
      container.classList.add("sign-up-mode");
    }
  } catch (e) {
    console.warn("Unable to parse URL for mode:", e);
  }
})();

console.log(users);

// ----- Validation helpers & UI -----
function isValidEmail(email) {
  const re = /^[\w-.]+@[\w-]+\.[\w-.]+$/;
  return re.test(String(email).toLowerCase());
}

function isStrongPassword(pw) {
  if (!pw) return false;
  return pw.length >= 6;
}

function showFieldError(inputEl, message) {
  if (!inputEl) return;
  // clear previous
  clearFieldError(inputEl);
  const err = document.createElement("div");
  err.className = "error-text";
  // build icon + text for compact horizontal pill
  const icon = document.createElement("i");
  icon.className = "fas fa-exclamation-circle error-icon";
  const txt = document.createElement("span");
  txt.className = "error-message";
  txt.textContent = message;
  err.appendChild(icon);
  err.appendChild(txt);
  // append as positioned element inside parent .input-field
  inputEl.parentNode.appendChild(err);
  inputEl.classList.add("input-error");
  if (inputEl.parentNode && inputEl.parentNode.classList)
    inputEl.parentNode.classList.add("field-error");
  // Remove error pill when user types in the input
  function handleInput() {
    clearFieldError(inputEl);
    inputEl.removeEventListener("input", handleInput);
  }
  inputEl.addEventListener("input", handleInput);
}

function clearFieldError(inputEl) {
  if (!inputEl) return;
  inputEl.classList.remove("input-error");
  const parent = inputEl.parentNode;
  const existing = parent.querySelector(".error-text");
  if (existing) parent.removeChild(existing);
  if (parent && parent.classList) parent.classList.remove("field-error");
}

function clearAllErrors(form) {
  const inputs = form.querySelectorAll("input");
  inputs.forEach((i) => clearFieldError(i));
}

// Mark field invalid by clearing its value and placing message in placeholder.
function markFieldInvalid(inputEl, message) {
  if (!inputEl) return;
  // remove existing inline error
  clearFieldError(inputEl);
  // save original placeholder
  if (!inputEl.dataset.origPlaceholder)
    inputEl.dataset.origPlaceholder = inputEl.placeholder || "";
  // clear value and set placeholder to message
  inputEl.value = "";
  inputEl.placeholder = message;
  inputEl.classList.add("input-error");

  // on next input, restore original placeholder and remove error state
  const restore = function () {
    inputEl.placeholder = inputEl.dataset.origPlaceholder || "";
    inputEl.classList.remove("input-error");
    clearFieldError(inputEl);
    inputEl.removeEventListener("input", restore);
    // also remove stored original after restore
    try {
      delete inputEl.dataset.origPlaceholder;
    } catch (e) {
      inputEl.dataset.origPlaceholder = "";
    }
  };
  inputEl.addEventListener("input", restore);
}

// hàm cho đăng ký
const registerForm = document.getElementById("sign-up");
registerForm.addEventListener("submit", function (event) {
  // Ngăn reload
  event.preventDefault();

  clearAllErrors(registerForm);

  // Lấy giá trị từ các ô input
  const fullnameInput = document.getElementById("register-fullname");
  const emailInput = document.getElementById("register-email");
  const passwordInput = document.getElementById("register-password");

  const fullname = fullnameInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  let hasError = false;

  // fullname validation
  if (!fullname || fullname.length < 2) {
    showFieldError(
      fullnameInput,
      "Vui lòng nhập tên hợp lệ (tối thiểu 2 ký tự)."
    );
    hasError = true;
  }

  // email validation
  if (!email) {
    showFieldError(emailInput, "Email không được để trống.");
    hasError = true;
  } else if (!isValidEmail(email)) {
    showFieldError(emailInput, "Email không hợp lệ.");
    hasError = true;
  } else if (users.find((u) => u.email === email)) {
    showFieldError(emailInput, "Email đã được đăng ký.");
    hasError = true;
  }

  // password validation
  if (!password) {
    showFieldError(passwordInput, "Mật khẩu không được để trống.");
    hasError = true;
  } else if (!isStrongPassword(password)) {
    showFieldError(passwordInput, "Mật khẩu quá ngắn (tối thiểu 6 ký tự).");
    hasError = true;
  }

  if (hasError) return;

  // Tạo object user
  const newUser = {
    id: `user-${Date.now()}`,
    email: email,
    fullname: fullname,
    password: password,
    pro: false,
    intro: false,
    avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  };

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));
  showToast("Đăng ký thành công!", "success");
  container.classList.remove("sign-up-mode");
  registerForm.reset();
});

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

// hàm cho đăng nhập
const loginForm = document.getElementById("sign-in");
loginForm.addEventListener("submit", function (event) {
  event.preventDefault();
  clearAllErrors(loginForm);

  const loginEmailInput = document.getElementById("login-email");
  const loginPasswordInput = document.getElementById("login-password");
  const loginEmail = loginEmailInput.value.trim().toLowerCase();
  const loginPassword = loginPasswordInput.value;

  let hasError = false;
  let firstInvalid = null;
  if (!loginEmail) {
    showFieldError(loginEmailInput, "Email không được để trống.");
    hasError = true;
    firstInvalid = firstInvalid || loginEmailInput;
  } else if (!isValidEmail(loginEmail)) {
    showFieldError(loginEmailInput, "Email không hợp lệ.");
    hasError = true;
    firstInvalid = firstInvalid || loginEmailInput;
  }
  if (!loginPassword) {
    showFieldError(loginPasswordInput, "Mật khẩu không được để trống.");
    hasError = true;
    firstInvalid = firstInvalid || loginPasswordInput;
  }
  if (hasError) {
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  const foundUser = users.find(
    (user) => user.email === loginEmail && user.password === loginPassword
  );
  if (foundUser) {
    sessionStorage.setItem("currentUser", JSON.stringify(foundUser));
    if (!foundUser.intro) {
      window.location.replace(`../Intro/slide1/slide1.html`);
      return;
    }
    window.location.replace(`../ListBoard/boards.html`);
  } else {
    // hiển thị lỗi chung inline cho cả 2 ô
    showFieldError(loginEmailInput, "Email hoặc mật khẩu không đúng.");
    showFieldError(loginPasswordInput, "Email hoặc mật khẩu không đúng.");
    if (loginPasswordInput) loginPasswordInput.focus();
  }
});

// đăng nhập bằng google

const YOUR_CLIENT_ID =
  "236217206978-l0c5ipbl5tklrtok3q32li38amq8se0r.apps.googleusercontent.com";
let tokenClient;
// Hàm lấy thông tin User từ Google API sau khi có Token
async function fetchUserProfile(accessToken) {
  try {
    // Gọi API Google UserInfo
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const data = await response.json();
    const user = users.find((u) => u.email === data.email);
    console.log("user:", user);
    if (!user) {
      const newUser = {
        id: `user-${Date.now()}`,
        email: data.email,
        fullname: data.name,
        password: null,
        pro: false,
        intro: false,
        avatar: data.picture,
      };
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      sessionStorage.setItem("currentUser", JSON.stringify(newUser));
      window.location.replace(`../Intro/slide1/slide1.html`);
      return;
    }
    if (user) sessionStorage.setItem("currentUser", JSON.stringify(user));

    window.location.replace(`../ListBoard/boards.html`);
  } catch (error) {
    console.error("Lỗi lấy thông tin user:", error);
  }
}

// Khởi tạo Token Client khi trang web tải xong
window.onload = function () {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: YOUR_CLIENT_ID,
    // Scope: xin quyền truy cập profile và email
    scope:
      "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
    // Callback: Chạy hàm này khi Google popup đóng lại và trả về kết quả
    callback: (tokenResponse) => {
      if (tokenResponse && tokenResponse.access_token) {
        console.log("Access Token:", tokenResponse.access_token);
        fetchUserProfile(tokenResponse.access_token);
      }
    },
  });
};

// Gán sự kiện click cho nút
document.getElementById("btn-google-login").addEventListener("click", () => {
  // Lệnh này kích hoạt Popup
  tokenClient.requestAccessToken();
});
document.getElementById("btn-google-register").addEventListener("click", () => {
  // Lệnh này kích hoạt Popup
  tokenClient.requestAccessToken();
});

// Password show/hide toggles for both forms
function attachToggle(toggleId, inputId) {
  const toggle = document.getElementById(toggleId);
  const input = document.getElementById(inputId);
  if (!toggle || !input) return;
  toggle.addEventListener("click", () => {
    const isHidden = input.type === "password";
    input.type = isHidden ? "text" : "password";
    // swap icon classes
    if (isHidden) {
      toggle.classList.remove("fa-eye");
      toggle.classList.add("fa-eye-slash");
      toggle.title = "Ẩn mật khẩu";
    } else {
      toggle.classList.remove("fa-eye-slash");
      toggle.classList.add("fa-eye");
      toggle.title = "Hiện mật khẩu";
    }
    input.focus();
  });
}

attachToggle("toggle-login-password", "login-password");
attachToggle("toggle-register-password", "register-password");
