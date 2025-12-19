const continueBtn = document.getElementById('continue-btn');
const previewImg = document.getElementById('preview-img');

if (continueBtn) {
    continueBtn.addEventListener('click', function () {
        window.location.href = '../slide2/slide2.html';
    });
}

function selectOption(optionId) {
    // Logic highlight nút
    const allOptions = document.querySelectorAll(".option");
    allOptions.forEach(o => o.classList.remove("selected"));

    const selectedOption = allOptions[optionId - 1];
    if (selectedOption) selectedOption.classList.add("selected");

    // Logic đổi ảnh (dùng src thay vì innerHTML)
    const imagePaths = [
        "../../images/s11.png",
        "../../images/s12.png",
        "../../images/s13.png",
        "../../images/s14.png"
    ];

    if (previewImg) {
        previewImg.style.opacity = 0;
        setTimeout(() => {
            previewImg.src = imagePaths[optionId - 1];
            previewImg.style.opacity = 1;
        }, 150);
    }

    // Logic hiện nút tiếp tục
    if (continueBtn) {
        continueBtn.classList.remove('hidden');
    }
}