const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
if (!currentUser) {
  alert("Bạn chưa đăng nhập! Vui lòng quay lại.");
  window.location.href = `../Login-Register/loginRegister.html`;
}
