import { users, baseUrl } from "../Entity.js";
//testbrach
// sử lí hiêu ứng chuyển đổi giữa đăng nhập và đăng ký
const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

console.log(users);

// hàm cho đăng ký
const registerForm = document.getElementById('sign-up');
registerForm.addEventListener('submit', function(event) {
    
    // QUAN TRỌNG NHẤT: Ngăn trình duyệt reload trang
    event.preventDefault(); 

    // 3. Lấy giá trị từ các ô input
    const fullnameValue = document.getElementById('register-fullname').value;
    const emailValue = document.getElementById('register-email').value;
    const passwordValue = document.getElementById('register-password').value;

    const fullname = fullnameValue;
    const email = emailValue;
    const password = passwordValue;

    // Kiểm tra kết quả
    console.log("Email:", fullname);
    console.log("Fullname:", email);
    console.log("Pass:", password);

    // Tạo object user
    const newUser = {
        id : `user-${Date.now()}`,
        email: email,
        fullname: fullname,
        password: password,
        pro: false,
        avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png"
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    showToast();
    container.classList.remove("sign-up-mode");
    registerForm.reset();

});

function showToast() {
  const x = document.getElementById("toast");
  
  // Thêm class "show" để kích hoạt CSS hiển thị
  x.className = "show";

  // Sau 3 giây (3000ms), xóa class "show" để ẩn đi
  setTimeout(function(){ 
      x.className = x.className.replace("show", ""); 
  }, 3000);
}

// hàm cho đăng nhập
const loginForm = document.getElementById('sign-in');
loginForm.addEventListener('submit', function(event) {
  const loginEmail = document.getElementById('login-email').value;
  const loginPassword = document.getElementById('login-password').value;
  event.preventDefault();
  const foundUser = users.find(user => user.email === loginEmail && user.password === loginPassword);
  if (foundUser) {
    sessionStorage.setItem('currentUser', JSON.stringify(foundUser));
    window.location.replace(`${baseUrl}/ListBoard/boards.html`);

  } else {
      alert('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
  }
});

// đăng nhập bằng google

const YOUR_CLIENT_ID = '236217206978-l0c5ipbl5tklrtok3q32li38amq8se0r.apps.googleusercontent.com';
let tokenClient;
        // Hàm lấy thông tin User từ Google API sau khi có Token
async function fetchUserProfile(accessToken) {
    try {
             // Gọi API Google UserInfo
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
        'Authorization': `Bearer ${accessToken}`
        }
    });
    const data = await response.json();
    const user = users.find(u => u.email === data.email);
    console.log("user:", user);
    if(!user){
        const newUser = {
            id : `user-${Date.now()}`,
            email: data.email,
            fullname: data.name,
            password: null,
            pro: false,
            avatar: data.picture,
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        sessionStorage.setItem('currentUser', JSON.stringify(newUser));

    }
    if(user)
    sessionStorage.setItem('currentUser', JSON.stringify(user));

    window.location.href = `${baseUrl}/ListBoard/boards.html`;
    } catch (error) {
        console.error("Lỗi lấy thông tin user:", error);
        }
    }

        // Khởi tạo Token Client khi trang web tải xong
    window.onload = function () {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: YOUR_CLIENT_ID,
                // Scope: xin quyền truy cập profile và email
            scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
                // Callback: Chạy hàm này khi Google popup đóng lại và trả về kết quả
            callback: (tokenResponse) => {
                if (tokenResponse && tokenResponse.access_token) {
                    console.log("Access Token:", tokenResponse.access_token);
                    fetchUserProfile(tokenResponse.access_token);

                }
            },
        });
    };

        // Gán sự kiện click cho nút
document.getElementById('btn-google-login').addEventListener('click', () => {
            // Lệnh này kích hoạt Popup
    tokenClient.requestAccessToken();
});
document.getElementById('btn-google-register').addEventListener('click', () => {
            // Lệnh này kích hoạt Popup
    tokenClient.requestAccessToken();
});