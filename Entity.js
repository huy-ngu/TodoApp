
let boards = JSON.parse(localStorage.getItem('boards')) || [];

let users = JSON.parse(localStorage.getItem('users')) || [];


let lists = JSON.parse(localStorage.getItem('lists')) || [];


let cards = JSON.parse(localStorage.getItem('cards')) || [];

// InboxData chỉ chứa metadata (title, theme, description), không chứa cards
let inboxData = JSON.parse(localStorage.getItem('inboxData')) || null;
// Kiểm tra nếu inboxData là array (dữ liệu cũ) hoặc không phải object, khởi tạo lại
if (!inboxData || Array.isArray(inboxData) || typeof inboxData !== 'object') {
  inboxData = {
    title: "Hộp thư chung",
    description: "",
    theme: "green"
  };
  // Lưu lại cấu trúc đúng vào localStorage
  localStorage.setItem('inboxData', JSON.stringify(inboxData));
}

// CardsInbox lưu trữ các cards của inbox, tương tự như cards cho board
let cardsInbox = JSON.parse(localStorage.getItem('cardsInbox')) || [];


// themeColors đơn giản - chỉ chứa màu nền nhạt cho list
const themeColors = {
  blue: "#e3f2fd",      // Xanh dương nhạt
  green: "#e8f5e9",     // Xanh lá nhạt
  yellow: "#fff9c4",    // Vàng nhạt
  orange: "#ffe0b2",    // Cam nhạt
  purple: "#f3e5f5",    // Tím nhạt
  red: "#ffebee",       // Đỏ nhạt
  pink: "#fce4ec",      // Hồng nhạt
  indigo: "#e8eaf6",    // Chàm nhạt
};

const boardThemeColors = {
  "b1": "linear-gradient(to top, #a8edea 0%, #fed6e3 100%)",
  "b2": "linear-gradient(to right, #e1eec3, #f05053)",
  "b3": "linear-gradient(to right, #334d50, #cbcaa5)",
  "b4": "linear-gradient(to right, #34e89e, #0f3443)",
  'b5': "linear-gradient(to right, #5d4157, #a8caba)",
  "b6": "linear-gradient(to right, #8360c3,rgb(15, 100, 73))",
  "b7": "linear-gradient(to right,rgb(212, 207, 219),rgb(132, 41, 41))",

}
var baseUrl = window.location.origin;
export { boards, lists, cards, inboxData, cardsInbox, themeColors, baseUrl, users, boardThemeColors };