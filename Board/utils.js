export const generateId = (() => {
    let counter = 0; // This is a simple in-memory counter, it will reset on page load.
    return (prefix) => `${prefix}-${Date.now()}-${++counter}`;
})();

export function closeAllDropdowns() {
    document.querySelectorAll(".list__dropdown, .inbox-dropdown, .header-dropdown, .view-board-dropdown").forEach((dropdown) => {
        dropdown.style.display = "none";
    });
}

export function showToast(message = "Thao tác thành công!") {
    const x = document.getElementById("toast");
    if(!x) return;
    x.textContent = message;
    x.className = "show";
    setTimeout(function () {
        x.className = x.className.replace("show", "");
    }, 3000);
}
