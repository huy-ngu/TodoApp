// Gọi hàm này khi trang web tải xong
document.addEventListener("DOMContentLoaded", async () => {
    // Tải header.html vào trong div có id="header-placeholder"
    const isHeaderLoaded = await loadComponent("header-placeholder", "../components/header.html");
    if (isHeaderLoaded) {
        setTimeout(() => {
            const userJson = sessionStorage.getItem('currentUser');
        const avatarImg = document.querySelector('.avatar'); 
        if (userJson && avatarImg) {
        // Parse từ chuỗi JSON về Object
        const user = JSON.parse(userJson);
        // 2. Thay đổi đường dẫn ảnh
        avatarImg.src = user.avatar;        
        console.log(avatarImg.src);
        } else {
        // Chưa đăng nhập -> Để ảnh mặc định hoặc ẩn đi
        if(avatarImg) avatarImg.src = "https://ui-avatars.com/api/?name=Guest";
        }
        }, 200);
        
    }
});


async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        
        if (response.ok) {
            const htmlContent = await response.text();
            document.getElementById(elementId).innerHTML = htmlContent;
            return true;
            // (Tùy chọn) Sau khi load xong header thì mới gán sự kiện click
            // ví dụ: initHeaderEvents(); 
        } else {
            console.error(`Không tìm thấy file: ${filePath}`);
        }
    } catch (error) {
        console.error("Lỗi tải component:", error);
    }
    return false;
}



// Hàm này sẽ chạy SAU KHI header đã được load vào HTML
function updateHeaderUser() {
    // 1. Lấy dữ liệu từ LocalStorage
    const userJson = sessionStorage.getItem('currentUser');

    const avatarImg = document.querySelector('.avatar'); 
    if (userJson && avatarImg) {
        // Parse từ chuỗi JSON về Object
        const user = JSON.parse(userJson);
        // 2. Thay đổi đường dẫn ảnh
        avatarImg.src = user.avatar;        
        console.log(avatarImg.src);
    } else {
        // Chưa đăng nhập -> Để ảnh mặc định hoặc ẩn đi
        if(avatarImg) avatarImg.src = "https://ui-avatars.com/api/?name=Guest";
    }
}