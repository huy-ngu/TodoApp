import loadComponent from "../js/loadComponents.js";

document.addEventListener("DOMContentLoaded", async () => {
  loadComponent("sidebar", "../components/sidebar.html");
});
setTimeout(()=>{
  const logout = document.getElementById("logout2");
  logout.addEventListener("click", ()=>{
    sessionStorage.removeItem("currentUser");
      window.location.href = `../Login-Register/loginRegister.html`;
  })
}, 500);

setTimeout(()=>{
  const logout = document.getElementById("logout");
  logout.addEventListener("click", ()=>{
    sessionStorage.removeItem("currentUser");
      window.location.href = `../Login-Register/loginRegister.html`;
  })
}, 500);
