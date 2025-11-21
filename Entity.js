// const boards = [
//   {
//     id: "b1",
//     title: "Bảng 1",
//     starred: false,
//     userId: "user-1",
//     theme: "linear-gradient(90deg,rgba(131, 58, 180, 1) 0%, rgba(253, 29, 29, 1) 50%, rgba(252, 176, 69, 1) 100%)"
//   },
//   {
//     id: "b2",
//     title: "Bảng toi day",
//     starred: false,
//     userId: "user-1",
//     theme: "radial-gradient(circle,rgba(238, 174, 202, 1) 0%, rgba(148, 187, 233, 1) 100%)"

//   },
// ];
let boards = JSON.parse(localStorage.getItem('boards')) || [];

let users = JSON.parse(localStorage.getItem('users')) || [];

// const lists = [
//   {
//     id: "list-ideas",
//     title: "Ý tưởng",
//     boardId: "b1",
//     theme: "green",
//     storage: false,
//   },
//   {
//     id: "list-doing",
//     title: "Đang làm",
//     boardId: "b1",
//     theme: "yellow",
//     storage: false,
//   },
//   {
//     id: "list-review",
//     title: "Chờ duyệt",
//     boardId: "b1",
//     theme: "orange",
//     storage: false,
//   },
//   {
//     id: "list-tkweb",
//     title: "Thiết kế web",
//     boardId: "b2",
//     theme: "green",
//     storage: false,
//   },
//   {
//     id: "list-oracle",
//     title: "Hệ quản trị cơ sở dữ liệu",
//     boardId: "b2",
//     theme: "orange",
//     storage: false,
//   },
//   {
//     id: "list-flutter",
//     title: "Lập trình di động",
//     boardId: "b2",
//     theme: "red",
//     storage: false,
//   },
//   {
//     id: "list-khaipha",
//     title: "Khai phá dữ liệu",
//     boardId: "b2",
//     theme: "indigo",
//     storage: false,
//   },
// ];
let lists = JSON.parse(localStorage.getItem('lists')) || [];

// const cards = [
//   {
//     id: "card-1",
//     title: "Nghiên cứu người dùng",
//     label: "Discovery",
//     badge: "3 ghi chú",
//     footer: "Hạn: 20/11",
//     status: "done",
//     listId: "list-ideas",
//     storage: false,
//   },
//   {
//     id: "card-2",
//     title: "Thu thập moodboard",
//     label: "Design",
//     badge: "5 ảnh",
//     footer: "Giao cho Mai",
//     status: "pending",
//     listId: "list-ideas",
//     storage: false,
//   },
//   {
//     id: "card-3",
//     title: "Phác thảo wireframe",
//     label: "Design",
//     badge: "Figma",
//     footer: "Tiến độ 60%",
//     status: "pending",
//     listId: "list-doing",
//     storage: false,
//   },
//   {
//     id: "card-4",
//     title: "Chuẩn bị guideline màu sắc",
//     label: "Brand",
//     badge: "Tài liệu",
//     footer: "Kiểm tra 2 lần",
//     status: "done",
//     listId: "list-doing",
//     storage: false,
//   },
//   {
//     id: "card-5",
//     title: "Prototype tương tác",
//     label: "UX",
//     badge: "Bản V2",
//     footer: "Chờ phản hồi",
//     status: "pending",
//     listId: "list-review",
//     storage: false,
//   },
//   {
//     id: "card-6",
//     title: "Slide trình bày",
//     label: "Share",
//     badge: "10 trang",
//     footer: "Họp ngày 25/11",
//     status: "pending",
//     listId: "list-review",
//     storage: false,
//   },
//   {
//     id: "card-7",
//     title: "Card 7",
//     label: "CR7",
//     badge: "77777",
//     footer: "7/7",
//     status: "pending",
//     listId: "list-review",
//     storage: false,
//   },
//   {
//     id: "card-8",
//     title: "Làm trang chủ",
//     label: "",
//     badge: "88888",
//     footer: "8/8",
//     status: "pending",
//     listId: "list-tkweb",
//     storage: false,
//   },
//   {
//     id: "card-9",
//     title: "Làm word",
//     label: "",
//     badge: "",
//     footer: "19/11",
//     status: "pending",
//     listId: "list-tkweb",
//     storage: false,
//   },
//   {
//     id: "card-9",
//     title: "Làm word",
//     label: "",
//     badge: "",
//     footer: "19/11",
//     status: "pending",
//     listId: "list-oracle",
//     storage: false,
//   },
//   {
//     id: "card-9",
//     title: "Làm database",
//     label: "",
//     badge: "",
//     footer: "19/11",
//     status: "pending",
//     listId: "list-flutter",
//     storage: false,
//   },
// ];
let cards = JSON.parse(localStorage.getItem('cards')) || [];


const inboxData = {
  title: "Hộp thư chung",
  description: "",
  theme: "green",
  cards: [
    {
      id: "inbox-1",
      title: "Client A muốn cập nhật timeline",
      label: "Alert",
      badge: "Email",
      footer: "Nhắc lại 10:00",
      status: "pending",
      storage: false,
    },
    {
      id: "inbox-2",
      title: "Đội nghiên cứu đã upload báo cáo",
      label: "Research",
      badge: "Tệp mới",
      footer: "Google Drive",
      status: "pending",
      storage: false,
    },
    {
      id: "inbox-3",
      title: "Mời tham dự buổi review sprint",
      label: "Meeting",
      badge: "25/11",
      footer: "Zoom 15:00",
      status: "pending",
      storage: false,
    },
    {
      id: "inbox-4",
      title: "4444444444",
      label: "Meeting",
      badge: "4444444444",
      footer: "Zoom 15:00",
      status: "pending",
      storage: false,
    },
  ],
};

const themeColors = {
  blue: {
    primary: "#3b82f6",
    light: "#dbeafe",
    gradient: "linear-gradient(135deg, #3b82f6, #60a5fa)",
    border: "#93c5fd",
  },
  green: {
    primary: "#10b981",
    light: "#d1fae5",
    gradient: "linear-gradient(135deg, #10b981, #34d399)",
    border: "#6ee7b7",
  },
  yellow: {
    primary: "#f59e0b",
    light: "#fef3c7",
    gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)",
    border: "#fcd34d",
  },
  orange: {
    primary: "#f97316",
    light: "#fed7aa",
    gradient: "linear-gradient(135deg, #f97316, #fb923c)",
    border: "#fdba74",
  },
  purple: {
    primary: "#8b5cf6",
    light: "#e9d5ff",
    gradient: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
    border: "#c4b5fd",
  },
  red: {
    primary: "#ef4444",
    light: "#fee2e2",
    gradient: "linear-gradient(135deg, #ef4444, #f87171)",
    border: "#fca5a5",
  },
  pink: {
    primary: "#ec4899",
    light: "#fce7f3",
    gradient: "linear-gradient(135deg, #ec4899, #f472b6)",
    border: "#f9a8d4",
  },
  indigo: {
    primary: "#6366f1",
    light: "#e0e7ff",
    gradient: "linear-gradient(135deg, #6366f1, #818cf8)",
    border: "#a5b4fc",
  },
};

const boardThemeColors = {
  "b1": "linear-gradient(to top, #a8edea 0%, #fed6e3 100%)",
  "b2": "linear-gradient(to right, #e1eec3, #f05053)",
  "b3": "linear-gradient(to right, #334d50, #cbcaa5)",
  "b4": "linear-gradient(to right, #34e89e, #0f3443)",
  'b5': "linear-gradient(to right, #5d4157, #a8caba)",
  "b6": "linear-gradient(to right, #8360c3, #2ebf91)",
}
var baseUrl = window.location.origin;
export { boards, lists, cards, inboxData, themeColors, baseUrl, users, boardThemeColors };