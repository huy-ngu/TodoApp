document.addEventListener("DOMContentLoaded", function() {
        // 1. Lấy phần đường dẫn của trang hiện tại (vd: /UserProfile/userProfile.html)
        setTimeout(()=>{
            const currentPath = window.location.pathname;
        const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
        menuItems.forEach(item => {
            // 2. Lấy đường dẫn của thẻ a trong sidebar
            // item.pathname sẽ tự động đổi link tương đối thành tuyệt đối để so sánh chuẩn
            const itemPath = item.pathname; 
            // 3. So sánh: Nếu đường dẫn giống nhau VÀ không phải là link ảo '#'
            if (item.getAttribute('href') !== '#' && itemPath === currentPath) {
                item.classList.add('active');
            }
        });
        }, 100);
    });





