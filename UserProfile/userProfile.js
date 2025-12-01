import loadComponent from "../js/loadComponents.js";

document.addEventListener("DOMContentLoaded", async () => {
  loadComponent("sidebar", "../components/sidebar.html");
});
setTimeout(()=>{
  const logout = document.getElementById("logout2");
  logout.addEventListener("click", ()=>{
    sessionStorage.removeItem("currentUser");
      window.location.href = `../Login-Register/loginRegister.html`;

  })
}, 500);

// 1. Hàm giả lập dữ liệu (Chạy 1 lần để test nếu chưa có data)
function seedDummyData() {
    if (!sessionStorage.getItem('currentUser')) {
        const dummyUser = {
            fullname: "Nguyễn Văn A",
            email: "nguyen.a@trihoanpro.com",
            avatar: "https://i.pravatar.cc/300", // Link ảnh mẫu
            pro: true // Thử đổi thành false để test
        };
        sessionStorage.setItem('currentUser', JSON.stringify(dummyUser));
        console.log("Đã tạo dữ liệu mẫu trong sessionStorage");
    }
}

// 2. Hàm Load dữ liệu lên giao diện
function loadUserProfile() {
    // Lấy chuỗi JSON từ storage
    const storedData = sessionStorage.getItem('currentUser');
    
    // Default values nếu null
    let userData = {
        fullname: "",
        email: "",
        avatar: null,
        pro: false
    };

    if (storedData) {
        try {
            userData = JSON.parse(storedData);
        } catch (e) {
            console.error("Lỗi parse JSON:", e);
        }
    }

    // --- DOM Elements ---
    const elmFullname = document.getElementById('fullname');
    const elmEmail = document.getElementById('email');
    const elmAvatar = document.getElementById('avatarImg');
    const elmProBadge = document.getElementById('proBadge');
    const elmAccountType = document.getElementById('accountType');

    // --- Binding Data ---
    
    // 1. Fullname (Check null/undefined)
    elmFullname.value = userData.fullname || "";

    // 2. Email (Check null)
    elmEmail.value = userData.email || "Chưa có email";

    // 3. Avatar (Check null & Fallback image)
    // Nếu có avatar thì dùng, không thì dùng ảnh mặc định
    const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; 
    elmAvatar.src = userData.avatar ? userData.avatar : defaultAvatar;

    // Xử lý lỗi nếu link avatar hỏng (broken link)
    elmAvatar.onerror = function() {
        this.src = defaultAvatar;
    };

    // 4. Pro Status (True/False check)
    if (userData.pro === true) {
        elmProBadge.classList.remove('hidden'); // Hiện badge trên ảnh
        elmAccountType.textContent = "Thành viên PRO";
        elmAccountType.classList.add('is-pro');
    } else {
        elmProBadge.classList.add('hidden'); // Ẩn badge
        elmAccountType.textContent = "Tài khoản thường";
        elmAccountType.classList.remove('is-pro');
    }
}

// 3. Xử lý Preview ảnh khi chọn file (Tính năng phụ)
document.getElementById('avatarInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Preview ảnh ngay lập tức
            document.getElementById('avatarImg').src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
});

// 4. Khởi chạy
document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
});

// Hàm lưu (Mockup)
function saveProfile() {
    // Lấy dữ liệu hiện tại
    let currentData = JSON.parse(sessionStorage.getItem('currentUser')) || {};
    
    // Cập nhật tên mới
    currentData.fullname = document.getElementById('fullname').value;
    
    // Lưu lại vào session
    sessionStorage.setItem('currentUser', JSON.stringify(currentData));
    
    alert("Đã cập nhật thông tin thành công!");
}