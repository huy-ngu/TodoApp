let boards = JSON.parse(localStorage.getItem("boards")) || [];

let users = JSON.parse(localStorage.getItem("users")) || [];

let lists = JSON.parse(localStorage.getItem("lists")) || [];

let cards = JSON.parse(localStorage.getItem("cards")) || [];

let logs = JSON.parse(localStorage.getItem("logs")) || [];

// InboxData chỉ chứa metadata (title, theme, description), không chứa cards
let inboxData = JSON.parse(localStorage.getItem("inboxData")) || null;
// let inboxData = {
//   title : "Hộp thư chung",
//   description: "",
//   theme: "green"
// }
// Kiểm tra nếu inboxData là array (dữ liệu cũ) hoặc không phải object, khởi tạo lại
if (!inboxData || Array.isArray(inboxData) || typeof inboxData !== "object") {
  inboxData = {
    title: "Hộp thư chung",
    description: "",
    theme: "green",
  };
  // Lưu lại cấu trúc đúng vào localStorage
  localStorage.setItem("inboxData", JSON.stringify(inboxData));
}

// CardsInbox lưu trữ các cards của inbox, tương tự như cards cho board
let cardsInbox = JSON.parse(localStorage.getItem("cardsInbox")) || [];

// themeColors đơn giản - chỉ chứa màu nền nhạt cho list
const themeColors = {
  blue: "#E3F2FD", // Light Blue
  mint: "#E0F2F1", // Soft Mint Green
  sand: "#FDF4E3", // Light Sandy/Beige
  lavender: "#F3E5F5", // Soft Lavender
  rose: "#FCE4EC", // Light Pink/Rose
  grey: "#F5F5F5", // Light Grey
};

const boardThemeColors = {
  b1: "linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)", // Sky blue gradient
  b2: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", // White to blue-gray
  b3: "linear-gradient(to right, #ffecd2 0%, #fcb69f 100%)", // Peachy/sunset gradient
  b4: "linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)", // Cool grey gradient
  b5: "linear-gradient(to right, #e0c3fc 0%, #8ec5fc 100%)", // Lavender to blue gradient
  b6: "linear-gradient(to right, #faaca8 0%, #ddd6f3 100%)", // Soft red to lavender
};
var baseUrl = window.location.origin;
export {
  boards,
  lists,
  cards,
  inboxData,
  cardsInbox,
  themeColors,
  baseUrl,
  users,
  boardThemeColors,
  logs,
};
