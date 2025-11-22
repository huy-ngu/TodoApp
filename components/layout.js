/**
 * Load sidebar component
 */
async function loadSidebar() {
    try {
        const response = await fetch('/components/sidebar.html');
        const html = await response.text();
        const sidebarContainer = document.getElementById('sidebar-container');
        if (sidebarContainer) {
            sidebarContainer.innerHTML = html;
        } else {
            // Nếu không có container, thêm vào body
            document.body.insertAdjacentHTML('afterbegin', html);
        }
        setupSidebar();
    } catch (error) {
        console.error('Error loading sidebar:', error);
    }
}

/**
 * Load header component
 */
async function loadHeader() {
    try {
        const response = await fetch('/components/header.html');
        const html = await response.text();
        const headerContainer = document.getElementById('header-container');
        if (headerContainer) {
            headerContainer.innerHTML = html;
        } else {
            // Tìm sidebar và thêm header sau sidebar
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.insertAdjacentHTML('afterend', html);
            } else {
                document.body.insertAdjacentHTML('afterbegin', html);
            }
        }
        // Dispatch event khi header đã load xong
        window.dispatchEvent(new CustomEvent('headerLoaded'));
    } catch (error) {
        console.error('Error loading header:', error);
    }
}

/**
 * Setup sidebar functionality
 */
function setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const mainContent = document.getElementById('main-content');
    
    if (!sidebar || !sidebarToggle) return;
    
    // Xác định trang hiện tại và highlight
    const currentPath = window.location.pathname;
    const currentPage = currentPath.includes('admin') ? 'admin' : 
                       currentPath.includes('templates') ? 'templates' : 'boards';
    
    // Highlight trang hiện tại
    const currentItem = document.querySelector(`.sidebar-item[data-page="${currentPage}"]`);
    if (currentItem) {
        currentItem.classList.add('active');
    }
    
    // Toggle sidebar
    function toggleSidebar() {
        sidebar.classList.toggle('sidebar--collapsed');
        if (mainContent) {
            mainContent.classList.toggle('main-content--sidebar-collapsed');
        }
        document.body.classList.toggle('sidebar-collapsed');
        if (sidebarOverlay) {
            sidebarOverlay.classList.toggle('active');
        }
        
        // Lưu trạng thái vào localStorage
        const isCollapsed = sidebar.classList.contains('sidebar--collapsed');
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    }
    
    // Khôi phục trạng thái sidebar từ localStorage
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState === 'true') {
        sidebar.classList.add('sidebar--collapsed');
        if (mainContent) {
            mainContent.classList.add('main-content--sidebar-collapsed');
        }
        document.body.classList.add('sidebar-collapsed');
    }
    
    // Event listeners
    sidebarToggle.addEventListener('click', toggleSidebar);
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', toggleSidebar);
    }
}

/**
 * Setup add board button functionality
 */
async function setupAddBoardButton() {
    const addBoardBtn = document.getElementById('add-board-btn');
    if (!addBoardBtn) {
        console.warn('Không tìm thấy nút add-board-btn');
        return;
    }
    
    // Xóa event listener cũ nếu có (tránh duplicate)
    const newBtn = addBoardBtn.cloneNode(true);
    addBoardBtn.parentNode.replaceChild(newBtn, addBoardBtn);
    
    // Thêm event listener mới
    newBtn.addEventListener('click', async () => {
        try {
            // Import động để tránh lỗi nếu module chưa load
            const { boards, baseUrl, boardThemeColors } = await import('/Entity.js');
            
            // Lấy currentUser từ sessionStorage
            const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
            if (!currentUser) {
                alert("Bạn chưa đăng nhập! Vui lòng quay lại.");
                window.location.href = `${baseUrl}/Login/login.html`;
                return;
            }
            
            // Hỏi tên bảng mới
            const title = prompt("Tên bảng mới", "Bảng mới");
            if (!title) {
                return;
            }
            const normalizedTitle = title.trim();
            if (!normalizedTitle) return;
            
            // Generate ID
            const generateId = (prefix) => `${prefix}-${Date.now()}`;
            
            // Tạo board mới
            const newBoard = {
                id: generateId("board"),
                title: normalizedTitle,
                starred: false,
                userId: currentUser.id,
                theme: boardThemeColors.b1, // Theme mặc định
            };
            
            // Lấy boards hiện tại từ localStorage và cập nhật
            let currentBoards = JSON.parse(localStorage.getItem('boards')) || [];
            currentBoards.push(newBoard);
            localStorage.setItem('boards', JSON.stringify(currentBoards));
            
            console.log("[BOARD] Đã thêm bảng:", newBoard);
            console.log("[BOARD] Danh sách bảng:", currentBoards);
            
            // Chuyển đến trang board mới
            window.location.href = `${baseUrl}/board/board.html?board=${newBoard.id}`;
        } catch (error) {
            console.error('Lỗi khi thêm bảng mới:', error);
            alert('Có lỗi xảy ra khi tạo bảng mới. Vui lòng thử lại.');
        }
    });
    
    console.log('Đã setup event listener cho nút add-board-btn');
}

/**
 * Load layout components (sidebar + header)
 */
async function loadLayout() {
    await loadSidebar();
    await loadHeader();
    
    // Đợi header load xong rồi setup button
    window.addEventListener('headerLoaded', () => {
        setTimeout(() => {
            setupAddBoardButton();
        }, 100);
    });
    
    // Fallback: thử setup button sau một chút
    setTimeout(() => {
        setupAddBoardButton();
    }, 300);
}

// Tự động load layout khi DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadLayout);
} else {
    loadLayout();
}

