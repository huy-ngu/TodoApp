import loadComponent from "../js/loadComponents.js";
import { logs } from "../Entity.js";

const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
if (!currentUser) {
  alert("Bạn chưa đăng nhập! Vui lòng quay lại.");
  window.location.href = `../Login-Register/loginRegister.html`;
}

document.addEventListener("DOMContentLoaded", async () => {
  loadComponent("sidebar", "../components/sidebar.html");
});
setTimeout(() => {
  const logout = document.getElementById("logout2");
  logout.addEventListener("click", () => {
    sessionStorage.removeItem("currentUser");
    window.location.href = `../Login-Register/loginRegister.html`;
  });
}, 500);

setTimeout(() => {
  const logout = document.getElementById("logout");
  logout.addEventListener("click", () => {
    sessionStorage.removeItem("currentUser");
    window.location.href = `../Login-Register/loginRegister.html`;
  });
}, 500);

const userLogs = logs
  .filter((log) => log.userId === currentUser.id) // 1. Lọc lấy log của user hiện tại
  .reverse(); // 2. Đảo ngược danh sách (Cái cuối lên đầu)

document.getElementById("logs").innerHTML = userLogs
  .map((userlog) => {
    // SỬA 1: Dùng thời gian của log (userlog.createAt) thay vì Date.now()
    const date = new Date(userlog.createAt);

    const formattedStr = date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour12: false,
    });

    // SỬA 2: Thêm từ khóa 'return'
    return `
        <div class="log" style="margin-top: 8px">
            <p>
                <strong>${currentUser.fullname}</strong> 
                ${userlog.content}  

                <span " 
                style="color: blue; text-decoration: underline;"> ${userlog.objectId}
                </span>

                <br>
                <small style="color: gray;">${formattedStr}</small>
            </p>
        </div>
    `;
  })
  .join("");
