document.addEventListener('DOMContentLoaded', () => {
    // 1. CÁC ELEMENT CHO MODAL THÊM THẺ
    const openDialogBtn = document.getElementById('openDialogBtn');
    const modalOverlay = document.getElementById('addCardModal');
    const confirmBtn = document.getElementById('confirmBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const taskInput = document.getElementById('taskInput');
    const taskList = document.getElementById('taskList');

    // 2. CÁC ELEMENT CHO MENU THEME & POPUP
    const moreBtn = document.getElementById('moreOptionsBtn');
    const controlPanel = document.getElementById('controlPanel');
    const inboxCard = document.querySelector('.inbox-card');
    const colorSwatches = document.querySelectorAll('.color-swatch');

    // --- LOGIC 1: ẨN/HIỆN MENU CONTROL PANEL ---
    
    // Bấm vào ... để bật tắt menu
    moreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        controlPanel.classList.toggle('active');
    });

    // Bấm ra ngoài vùng menu thì đóng menu lại
    document.addEventListener('click', (e) => {
        if (!controlPanel.contains(e.target) && e.target !== moreBtn) {
            controlPanel.classList.remove('active');
        }
    });

    // --- LOGIC 2: ĐỔI THEME VÀ LƯU VÀO STORAGE ---
    
    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            // Lấy mã màu từ thuộc tính data-color
            const color = swatch.getAttribute('data-color');
            
            // 1. Đổi màu nền giao diện hiện tại
            if (inboxCard) {
                inboxCard.style.backgroundColor = color;
            }
            
            // Không lưu theme vào localStorage — chỉ đổi màu hiển thị tạm thời
            
            // Hiệu ứng chọn ô màu (Active state)
            colorSwatches.forEach(s => s.style.border = 'none');
            swatch.style.border = '2px solid #172b4d';
        });
    });

    // --- LOGIC 3: THÊM THẺ VÀ LƯU VÀO STORAGE ---

    openDialogBtn.addEventListener('click', () => {
        modalOverlay.classList.add('active');
        controlPanel.classList.remove('active');
        taskInput.value = ''; 
        taskInput.focus(); 
    });

    function closeModal() {
        modalOverlay.classList.remove('active');
    }

    cancelBtn.addEventListener('click', closeModal);

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    function addTask() {
        const content = taskInput.value.trim();
        if (content) {
            // 1. Tạo giao diện thẻ mới
            const taskItem = document.createElement('div');
            taskItem.classList.add('task-item');
            taskItem.textContent = content;
            taskList.appendChild(taskItem);
            
            // 2. LƯU DANH SÁCH THẺ VÀO LOCALSTORAGE
            saveTasks();

            taskList.scrollTop = taskList.scrollHeight;
            closeModal();
            updateNextButtonVisibility();
        } else {
            taskInput.style.borderColor = 'red';
            setTimeout(() => taskInput.style.borderColor = '#dfe1e6', 500);
        }
    }

    // Hàm phụ trợ: Lưu mảng các task vào bộ nhớ trình duyệt
    function saveTasks() {
        const tasks = [];
        // Lấy nội dung text của từng thẻ đang có trong list
        taskList.querySelectorAll('.task-item').forEach(item => {
            tasks.push(item.textContent);
        });
        localStorage.setItem('intro_tasks', JSON.stringify(tasks));
    }

    confirmBtn.addEventListener('click', addTask);

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // --- LOGIC 4: HIỆN/ẨN NÚT TIẾP TỤC ---
    const nextBtn = document.getElementById('nextBtn');

    function updateNextButtonVisibility() {
        if (!nextBtn) return;
        const hasTasks = taskList.children.length > 0;
        if (hasTasks) {
            nextBtn.classList.remove('hidden');
        } else {
            nextBtn.classList.add('hidden');
        }
    }

    // Khởi tạo trạng thái nút khi lần đầu load
    updateNextButtonVisibility();

    // CHUYỂN HƯỚNG SANG SLIDE 3
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            // Đảm bảo đường dẫn này trỏ đúng tới file slide3.html bạn vừa tạo
            window.location.href = '../slide3/slide3.html'; 
        });
    }
});