import { users, baseUrl } from "../Entity.js";

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

console.log(users);

// hàm cho đăng ký
const registerForm = document.getElementById('sign-up');
registerForm.addEventListener('submit', function(event) {
    
    // QUAN TRỌNG NHẤT: Ngăn trình duyệt reload trang
    event.preventDefault(); 

    // 3. Lấy giá trị từ các ô input
    const fullnameValue = document.getElementById('register-fullname').value;
    const emailValue = document.getElementById('register-email').value;
    const passwordValue = document.getElementById('register-password').value;

    // Kiểm tra kết quả
    console.log("Email:", emailValue);
    console.log("Fullname:", fullnameValue);
    console.log("Pass:", passwordValue);

    // --- Đoạn này áp dụng kiến thức bài trước ---
    // Tạo object user
    const newUser = {
        id : `user-${Date.now()}`,
        email: emailValue,
        fullname: fullnameValue,
        password: passwordValue,
        pro: false
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    showToast();
    container.classList.remove("sign-up-mode");
});

function showToast() {
  const x = document.getElementById("toast");
  
  // Thêm class "show" để kích hoạt CSS hiển thị
  x.className = "show";

  // Sau 3 giây (3000ms), xóa class "show" để ẩn đi
  setTimeout(function(){ 
      x.className = x.className.replace("show", ""); 
  }, 3000);
}

// hàm cho đăng nhập
const loginForm = document.getElementById('sign-in');
loginForm.addEventListener('submit', function(event) {
  const loginEmail = document.getElementById('login-email').value;
  const loginPassword = document.getElementById('login-password').value;
  event.preventDefault();
  const foundUser = users.find(user => user.email === loginEmail && user.password === loginPassword);
  if (foundUser) {
      console.log('Đăng nhập thành công:', foundUser);
      sessionStorage.setItem('currentUser', JSON.stringify(foundUser));
      window.location.href = `${baseUrl}/ListBoard/boards.html`;
  } else {
      alert('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
  }
});


