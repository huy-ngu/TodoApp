import { boards, baseUrl } from "../Entity.js";
import { initializeUI } from './ui.js';

// --- INITIAL SETUP & SECURITY CHECK ---

const DEFAULT_BOARD_ID = new URLSearchParams(window.location.search).get('board');
const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

if (!currentUser) {
    alert("Bạn chưa đăng nhập! Vui lòng quay lại.");
    window.location.href = `${baseUrl}/Login-Register/loginRegister.html`;
} else {
    const userIdFromBoard = boards.find((b) => b.id === DEFAULT_BOARD_ID)?.userId;
    if(userIdFromBoard !== currentUser.id){
        alert("Bạn không có quyền truy cập vào bảng này!");
        window.location.href = `${baseUrl}/ListBoard/boards.html`;
    } else {
        // --- DOM READY ---
        document.addEventListener("DOMContentLoaded", () => {
            initializeUI(DEFAULT_BOARD_ID, currentUser);
        });
    }
}