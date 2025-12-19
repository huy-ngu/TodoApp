document.addEventListener("DOMContentLoaded", function () {
  // --- Logic xử lý trạng thái active cho menu item ---
  setTimeout(() => {
    const currentPath = window.location.pathname;
    const menuItems = document.querySelectorAll(".sidebar .menu-item");
    menuItems.forEach((item) => {
      const itemPath = new URL(item.href).pathname;
      if (
        item.getAttribute("href") !== "../loginRegister/loginRegister.html" &&
        itemPath === currentPath
      ) {
        item.classList.add("active");
      }
    });
  }, 100);
});
