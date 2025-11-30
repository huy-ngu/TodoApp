import { lists } from "../Entity.js";
setTimeout(() => {
    const list = document.querySelectorAll(".list__title");
    list.forEach((l) => {
        const labelDisplay = document.getElementById(`${l.id}`);
        const inputEdit = document.getElementById("input-" + l.id);
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
            const findlist = lists.find((i) => i.id === l.id);
            if (!findlist) {
                console.warn("[List] Không tìm thấy board với id:", l.id);
                return;
            }
            
            findlist.title = inputEdit.value;
            localStorage.setItem('lists', JSON.stringify(lists));
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
    });
}, 3000);