import loadComponent from "../js/loadComponents.js";
import { users } from "../Entity.js";

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
