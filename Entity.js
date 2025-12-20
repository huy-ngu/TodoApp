let boards = JSON.parse(localStorage.getItem("boards")) || [];

let users = JSON.parse(localStorage.getItem("users")) || [];

let lists = JSON.parse(localStorage.getItem("lists")) || [];

let cards = JSON.parse(localStorage.getItem("cards")) || [];

let logs = JSON.parse(localStorage.getItem("logs")) || [];

let inboxData = JSON.parse(localStorage.getItem("inboxData")) || null;
// let inboxData = {
//   title : "Hộp thư chung",
//   description: "",
//   theme: "green"
// }

if (!inboxData || Array.isArray(inboxData) || typeof inboxData !== "object") {
  inboxData = {
    title: "Hộp thư chung",
    description: "",
    theme: "green",
  };
  localStorage.setItem("inboxData", JSON.stringify(inboxData));
}

let cardsInbox = JSON.parse(localStorage.getItem("cardsInbox")) || [];

const themeColors = {
  blue: "#E3F2FD",
  mint: "#E0F2F1",
  sand: "#FDF4E3",
  grey: "#F5F5F5",
  yellow: "#FEF08A",
  green: "#34D399",
  orange: "#FF6B6B",
};

const boardThemeColors = {
  b1: "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)",
  b2: "linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%)",
  b4: "linear-gradient(to top, #209cff 0%, #68e0cf 100%)",
  b5: "#38BDF8",
  b6: "linear-gradient(to right, #1CD8D2 0%, #93EDC7 100%)",
  b7: "linear-gradient(to right, #243949 0%, #517fa4 100%)",
  b3: "linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)",
  b8: "#E5E7EB",
};

var baseUrl = window.location.origin;

const boardTemplate = [
  {
    id: `boardTemp-1-${Date.now()}`,
    title: "Roadmap ReactJS",
    description: "Lộ trình học ReactJS từ cơ bản đến nâng cao",
    theme: boardThemeColors.b1,
    starred: false,
    lists: [{}],
    cards: [],
    userId: null,
  },
];

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
  boardTemplate,
};

// cấu trúc mẫu
/*
boards = [
id: "board-1765641884401";
starred: false;
theme: "linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)";
title: "RoadmapReact";
userId: "user-1765537904527";
]

lists 
boardId: "board-1765641884401",
id: "list-1765641949253-3",
orde:0,
storage: false,
theme: "blue",
title: "CLI Tools",

cards

boardId: "board-1765641884401"
dueDate: "2025-12-14T16:05:57.377Z"
id: "card-1765641957377-5"
listId: "list-1765641949253-3"
note: ""
order: 0
status: "pending"
storage: false
title: "Vite"
*/
