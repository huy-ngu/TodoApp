document.addEventListener("DOMContentLoaded", function() {
    // --- Logic xử lý trạng thái active cho menu item ---
    setTimeout(() => {
        const currentPath = window.location.pathname;
        const menuItems = document.querySelectorAll('.sidebar .menu-item');
        menuItems.forEach(item => {
            const itemPath = new URL(item.href).pathname;
            if (item.getAttribute('href') !== '#' && itemPath === currentPath) {
                item.classList.add('active');
            }
        });
    }, 100);

    // --- Logic xử lý đóng/mở sidebar trên mobile ---

    const sidebar = document.querySelector('.sidebar');
    const menuToggleButton = document.querySelector('#menu-toggle'); // Giả định nút này có trong header của bạn

    // 1. Tự động tạo và thêm backdrop vào body
    const backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    document.body.appendChild(backdrop);

    // Hàm để đóng sidebar
    const closeSidebar = () => {
        sidebar.classList.remove('is-open');
        backdrop.classList.remove('is-active');
    };

    // Hàm để mở sidebar
    const openSidebar = () => {
        sidebar.classList.add('is-open');
        backdrop.classList.add('is-active');
    };

    // 2. Thêm sự kiện click cho nút hamburger
    if (menuToggleButton) {
        menuToggleButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
            if (sidebar.classList.contains('is-open')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });
    }

    // 3. Thêm sự kiện click cho backdrop để đóng sidebar
    backdrop.addEventListener('click', closeSidebar);
});
