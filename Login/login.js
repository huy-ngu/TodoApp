import { users, baseUrl } from "../Entity.js";
console.log(users);
const registerForm = document.getElementById('registerForm'); // Đảm bảo đã lấy được form


// Giả sử đây là sự kiện bấm nút Đăng nhập
function handleLogin( emailInput, passInput) {
    // 1. Lấy danh sách tất cả user đã đăng ký
    console.log(emailInput, passInput);
    // 2. Tìm người dùng khớp thông tin
    const userFound = users.find(u => u.email === emailInput && u.password === passInput);

    if (userFound) {
        // 3. LƯU "PHIÊN ĐĂNG NHẬP" (Quan trọng)
        // Lưu ý: Không nên lưu password vào đây, chỉ lưu id, name, email
        const currentUser = { id: userFound.id, name: userFound.name, email: userFound.email };
        // localStorage.setItem('currentUser', JSON.stringify(currentUser));
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));

        alert("Đăng nhập thành công!");
        window.location.href = `${baseUrl}/ListBoard/boards.html`;
    } else {
        alert("Sai email hoặc mật khẩu!");
    }
}

registerForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const emailInput = document.getElementById('emailInput').value;
        const passInput = document.getElementById('passwordInput').value;
        handleLogin(emailInput, passInput);
    }
);
