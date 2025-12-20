const generateBtn = document.getElementById("generateBtn");
const qrResult = document.getElementById("qr-result");
const qrImage = document.getElementById("qr-image");
const timerDisplay = document.getElementById("timer");
const confirmPaymentBtn = document.getElementById("confirm-payment-btn");
const toastPayment = document.getElementById("toast-payment");
let countdown;

// --- KIỂM TRA TRẠNG THÁI VIP ---
const currentUserCheck = JSON.parse(sessionStorage.getItem("currentUser"));
if (currentUserCheck && currentUserCheck.pro) {
  alert("Bạn đã là VIP!");
  window.location.href = "../ListBoard/boards.html";
}

generateBtn.addEventListener("click", function () {
  // Lấy dữ liệu
  const bankId = document.getElementById("bankId").value;
  const accountNo = document.getElementById("accountNo").value;
  const content = document.getElementById("content").value;
  const amount = document.getElementById("amount").value;

  // Validation đơn giản
  if (!amount || amount <= 0) {
    alert("Vui lòng nhập số tiền hợp lệ!");
    return;
  }

  // --- XỬ LÝ QUAN TRỌNG: MÃ HÓA URL ---
  // Nội dung "thanh toán trìhoanPro Vip" chứa dấu cách và tiếng Việt
  // encodeURIComponent sẽ biến nó thành: thanh%20to%C3%A1n%20tr%C3%AChoanPro%20Vip
  const encodedContent = encodeURIComponent(content);

  // Tạo Link QR
  // Template: 'print' để nhìn rõ ràng, chuyên nghiệp hơn
  const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-print.png?amount=${amount}&addInfo=${encodedContent}`;

  // Hiển thị
  qrImage.src = qrUrl;
  qrResult.style.display = "block";
  if (confirmPaymentBtn) confirmPaymentBtn.style.display = "block";

  // Reset và chạy lại Timer
  clearInterval(countdown);
  startTimer(300); // 5 phút
});

function startTimer(duration) {
  let timer = duration,
    minutes,
    seconds;
  countdown = setInterval(function () {
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    timerDisplay.textContent = `Hết hạn trong: ${minutes}:${seconds}`;

    if (--timer < 0) {
      clearInterval(countdown);
      timerDisplay.textContent = "Mã QR đã hết hạn!";
      qrImage.style.opacity = "0.2";
      generateBtn.disabled = true;
      generateBtn.innerText = "Vui lòng tải lại trang";
    }
  }, 1000);
}

// --- CẤU HÌNH SẢN PHẨM ---
// Muốn thêm gói mới thì thêm vào danh sách này
const productConfig = {
  pro: {
    amount: 69000,
    content: "Thanh toan trihoanPro",
  },
  ultraPro: {
    amount: 199000,
    content: "Thanh toan trihoanPro Vip",
  },
  // Mặc định nếu không khớp hoặc không có tham số
  default: {
    amount: 999000,
    content: "Thanh toan mac dinh",
  },
};

// --- PHẦN 1: XỬ LÝ URL VÀ ĐIỀN DỮ LIỆU TỰ ĐỘNG ---

// Lấy tham số ?pro=... từ URL
const urlParams = new URLSearchParams(window.location.search);
const proType = urlParams.get("pro");

// Kiểm tra xem proType có nằm trong config không, nếu không thì lấy default
const selectedProduct = productConfig[proType] || productConfig["default"];

// Gán dữ liệu vào ô input (DOM Elements)
const amountInput = document.getElementById("amount");
const contentInput = document.getElementById("content");
const priceDisplay = document.getElementById("price-display"); // Nếu bạn có thẻ hiển thị giá đẹp

amountInput.value = selectedProduct.amount;
contentInput.value = selectedProduct.content;

// Nếu có thẻ hiển thị giá (class .price-tag ở bài trước), thì format cho đẹp
if (priceDisplay) {
  priceDisplay.innerText = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(selectedProduct.amount);
}

// --- PHẦN 2: XỬ LÝ XÁC NHẬN THANH TOÁN ---
if (confirmPaymentBtn) {
  confirmPaymentBtn.addEventListener("click", function () {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    if (currentUser) {
      // 1. Cập nhật trong sessionStorage
      currentUser.pro = true;
      sessionStorage.setItem("currentUser", JSON.stringify(currentUser));

      // 2. Cập nhật trong localStorage (danh sách users)
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const userIndex = users.findIndex((u) => u.id === currentUser.id);
      if (userIndex !== -1) {
        users[userIndex].pro = true;
        localStorage.setItem("users", JSON.stringify(users));
      }

      // Hiển thị Toast
      if (toastPayment) {
        toastPayment.className = "show";
      }

      // Chuyển trang sau 2 giây
      setTimeout(() => {
        window.location.href = "../ListBoard/boards.html";
      }, 2000);
    } else {
      alert("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
    }
  });
}
