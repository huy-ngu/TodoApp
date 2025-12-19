// file: slide3.js
document.addEventListener('DOMContentLoaded', () => {
    
    let currentTargetListId = '';
    const modalOverlay = document.getElementById('addCardModal');
    const taskInput = document.getElementById('taskInput');

    // 1. ĐỒNG BỘ DỮ LIỆU TỪ SLIDE 2
    function syncFromSlide2() {
        // A. Không đồng bộ theme từ Slide 2 — chỉ đồng bộ nội dung (thẻ)

        // B. Đồng bộ danh sách thẻ vào Inbox
        const storedTasks = JSON.parse(localStorage.getItem('intro_tasks') || '[]');
        const inboxListEl = document.getElementById('list-inbox');
        
        inboxListEl.innerHTML = ''; // Xóa trắng
        storedTasks.forEach(text => {
            const div = document.createElement('div');
            div.className = 'task-item';
            div.textContent = text;
            inboxListEl.appendChild(div);
        });

        // Nếu người dùng không tạo thẻ nào ở Slide 2, thêm mẫu
        if (storedTasks.length === 0) {
            const div = document.createElement('div');
            div.className = 'task-item';
            div.textContent = "Thẻ mẫu từ hệ thống";
            inboxListEl.appendChild(div);
        }
    }

    // Chạy đồng bộ ngay khi load
    syncFromSlide2();

    // 2. KÉO THẢ (SORTABLE)
    const sharedConfig = {
        group: 'shared-board', // Cho phép kéo qua lại giữa các list
        animation: 150,
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        delay: 0
    };

    // Áp dụng cho Inbox và 3 List
    new Sortable(document.getElementById('list-inbox'), sharedConfig);
    new Sortable(document.getElementById('list-today'), sharedConfig);
    new Sortable(document.getElementById('list-week'), sharedConfig);
    new Sortable(document.getElementById('list-later'), sharedConfig);

    // 3. XỬ LÝ MODAL THÊM THẺ (Cho 3 danh sách bên phải)
    
    // Hàm mở modal, gán vào window để gọi từ HTML onclick
    window.openModal = function(listId) {
        currentTargetListId = listId;
        modalOverlay.classList.add('active');
        taskInput.value = '';
        taskInput.focus();
    };

    function closeModal() {
        modalOverlay.classList.remove('active');
        currentTargetListId = '';
    }

    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    
    // Thêm thẻ mới
    document.getElementById('confirmBtn').addEventListener('click', () => {
        const text = taskInput.value.trim();
        if (text && currentTargetListId) {
            const targetList = document.getElementById(currentTargetListId);
            
            const div = document.createElement('div');
            div.className = 'task-item';
            div.textContent = text;
            targetList.appendChild(div);

            closeModal();
        }
    });

    // Enter để thêm
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') document.getElementById('confirmBtn').click();
    });

    // Click ngoài đóng modal
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    // 4. CHUYỂN TRANG
    document.querySelector('.btn-finish').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});