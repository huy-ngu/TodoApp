import { users, baseUrl } from "../Entity.js";
console.log(users);

// 1. Chọn form từ DOM
const registerForm = document.getElementById('registerForm');

// 2. Lắng nghe sự kiện 'submit'
registerForm.addEventListener('submit', function(event) {
    
    // QUAN TRỌNG NHẤT: Ngăn trình duyệt reload trang
    event.preventDefault(); 

    // 3. Lấy giá trị từ các ô input
    const emailValue = document.getElementById('emailInput').value;
    const passwordValue = document.getElementById('passwordInput').value;

    // Kiểm tra kết quả
    console.log("Email:", emailValue);
    console.log("Pass:", passwordValue);

    // --- Đoạn này áp dụng kiến thức bài trước ---
    // Tạo object user
    const newUser = {
        id : `user-${Date.now()}`,
        email: emailValue,
        password: passwordValue
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    window.location.href = "../Login/login.html";
});

