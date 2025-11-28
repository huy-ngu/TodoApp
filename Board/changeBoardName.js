import { boards } from "../Entity.js";
// 1. Lấy chuỗi query string (toàn bộ phần sau dấu ?)
// Kết quả sẽ là: "?board=ABC-01&user=admin"
const queryString = window.location.search;

// 2. Tạo bộ công cụ phân tích URL
const urlParams = new URLSearchParams(queryString);

// 3. Lấy giá trị mong muốn
const boardId = urlParams.get('board');


const labelDisplay = document.getElementById("board-title");
        const inputEdit = document.getElementById("input-boardTitle");

        // --- GIAI ĐOẠN 1: BẮT ĐẦU SỬA ---
        // Sự kiện nhấp đúp (dblclick) vào chữ để sửa
        labelDisplay.addEventListener("dblclick", function() {
            // 1. Lấy nội dung hiện tại gán vào ô input
            inputEdit.value = labelDisplay.innerText;

            // 2. Ẩn text, hiện input
            labelDisplay.style.display = "none";
            inputEdit.style.display = "inline-block";

            // 3. Focus ngay vào ô input và bôi đen toàn bộ chữ (giống Windows)
            inputEdit.focus();
            inputEdit.select(); 
        });

        // --- GIAI ĐOẠN 2: LƯU LẠI ---
        
        // Hàm xử lý việc lưu
        function ketThucSua() {
            // 1. Cập nhật nội dung mới cho thẻ text
            // Nếu rỗng thì giữ nguyên hoặc báo lỗi (ở đây tôi để mặc định giữ cũ nếu rỗng)
            if (inputEdit.value.trim() !== "") {
                labelDisplay.innerText = inputEdit.value;
            }
            // Cập nhật lại trong LocalStorage
            const board = boards.find((b) => b.id === boardId);
            if (!board) {
                console.warn("[BOARD] Không tìm thấy board với id:", DEFAULT_BOARD_ID);
                return;
            }
            
            board.title = inputEdit.value;
            localStorage.setItem('boards', JSON.stringify(boards));
            // 2. Hiện text, ẩn input
            labelDisplay.style.display = "inline-block";
            inputEdit.style.display = "none";
        }

        // Cách 1: Lưu khi người dùng click chuột ra ngoài (sự kiện blur)
        inputEdit.addEventListener("blur", function() {
            ketThucSua();
        });

        // Cách 2: Lưu khi người dùng nhấn Enter
        inputEdit.addEventListener("keydown", function(event) {
            if (event.key === "Enter") {
                ketThucSua();
            }
        });