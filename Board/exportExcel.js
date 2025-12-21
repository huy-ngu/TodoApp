const cards = localStorage.getItem("cards")
  ? JSON.parse(localStorage.getItem("cards"))
  : [];

// lọc cards thuộc board hiện tại
const boardId = new URLSearchParams(window.location.search).get("board");
const cardsInBoard = cards.filter((card) => card.boardId === boardId);

function exportCardsToExcel() {
  console.log("Xuất excel");
  const outputData = cardsInBoard.map((item) => {
    return {
      "Công việc": item.title,
      "Trạng thái": item.status,
      "Hạn chót": formatDate(item.dueDate),
      "Ghi chú": item.note,
      "Lưu trữ": item.storage ? "Rồi" : "Chưa",
    };
  });

  // 2. TẠO WORKSHEET
  const worksheet = XLSX.utils.json_to_sheet(outputData);

  // (Tùy chọn) Chỉnh độ rộng cột cho đẹp
  worksheet["!cols"] = [
    { wch: 30 },
    { wch: 15 },
    { wch: 20 },
    { wch: 30 },
    { wch: 10 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách Task");

  XLSX.writeFile(workbook, "Danh_sach_cong_viec.xlsx");
}

function formatDate(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return (
    date.toLocaleDateString("vi-VN") +
    " " +
    date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
  );
}

const exportBtn = document.getElementById("exportExcelBtn");
if (exportBtn) {
  exportBtn.addEventListener("click", () => {
    console.log("Xuất excel");
    exportCardsToExcel();
  });
}
