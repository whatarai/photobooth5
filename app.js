window.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('camera');
  const canvas = document.getElementById('photo');
  const context = canvas.getContext('2d');
  const snapBtn = document.getElementById('snap');
  const downloadLink = document.getElementById('download');
  const filterSelect = document.getElementById('filter');
  const stickerInput = document.getElementById('stickerUpload');

  // 啟動相機
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => video.srcObject = stream)
    .catch(err => {
      console.error('逼筑無法存取相機：', err);
      alert('請milf允許使用相機！');
    });

  // 貼紙設定
  let stickerImg = null;
  let stickerPos = { x: 50, y: 50 };
  let stickerSize = { width: 80, height: 80 };
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };

  // 上傳貼紙
  stickerInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      stickerImg = new Image();
      stickerImg.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  // 拖曳貼紙
  canvas.addEventListener('mousedown', e => {
    if (!stickerImg) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    if (mouseX >= stickerPos.x && mouseX <= stickerPos.x + stickerSize.width &&
        mouseY >= stickerPos.y && mouseY <= stickerPos.y + stickerSize.height) {
      isDragging = true;
      dragOffset.x = mouseX - stickerPos.x;
      dragOffset.y = mouseY - stickerPos.y;
    }
  });

  canvas.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const rect = canvas.getBoundingClientRect();
    stickerPos.x = e.clientX - rect.left - dragOffset.x;
    stickerPos.y = e.clientY - rect.top - dragOffset.y;
  });

  canvas.addEventListener('mouseup', () => isDragging = false);
  canvas.addEventListener('mouseleave', () => isDragging = false);

  // 滾輪縮放貼紙
  canvas.addEventListener('wheel', e => {
    if (!stickerImg) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1.1 : 0.9;
    stickerSize.width *= delta;
    stickerSize.height *= delta;
  });

  // 拍照
  snapBtn.addEventListener('click', () => {
    drawPreview(true);
  });

  // 即時預覽
  function drawPreview(final = false) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.filter = filterSelect.value;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (stickerImg) {
      context.drawImage(stickerImg, stickerPos.x, stickerPos.y, stickerSize.width, stickerSize.height);
    }

    context.lineWidth = 10;
    context.strokeStyle = 'white';
    context.strokeRect(0, 0, canvas.width, canvas.height);

    if (final) {
      downloadLink.href = canvas.toDataURL('image/png');
    }
  }

  // 每 30ms 更新預覽
  setInterval(drawPreview, 30);
});
