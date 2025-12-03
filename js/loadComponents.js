async function loadComponent(elementId, filePath) {
  try {
    const response = await fetch(filePath);

    if (response.ok) {
      const htmlContent = await response.text();
      document.getElementById(elementId).innerHTML = htmlContent;
      return true;
    } else {
      console.error(`Không tìm thấy file: ${filePath}`);
    }
  } catch (error) {
    console.error("Lỗi tải component:", error);
  }
  return false;
}

export default loadComponent;
