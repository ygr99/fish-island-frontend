/**
 * 壁纸组件
 */
class Wallpaper {
  constructor() {
    this.name = "必应壁纸";
    this.iconClass = "fa-solid fa-image";
    this.backgroundColor = "bg-blue-600";

    // 添加新属性，用于组件库显示
    this.icon = "fa-solid fa-image";
    this.bgColor = "bg-blue-600";
    this.description = "精美壁纸浏览与下载";

    // 壁纸API地址
    this.apiUrl = "https://bing.ee123.net/img/";
  }

  /**
   * 获取组件HTML
   * @returns {string} 组件的HTML元素字符串
   */
  render() {
    return `
      <div class="app-container flex flex-col items-center cursor-pointer" id="wallpaper">
        <div class="app-icon ${this.backgroundColor}">
          <i class="${this.iconClass} text-white text-2xl"></i>
        </div>
        <span class="text-white text-sm whitespace-nowrap">${this.name}</span>
      </div>
    `;
  }

  /**
   * 初始化组件事件监听
   */
  init() {
    document
      .getElementById("wallpaper")
      .addEventListener("click", this.handleClick.bind(this));
  }

  /**
   * 点击处理函数
   */
  handleClick() {
    // 创建壁纸浏览弹窗
    this.createModal();
  }

  /**
   * 创建弹窗
   */
  createModal() {
    // 检查是否已存在弹窗
    if (document.getElementById("wallpaper-modal")) {
      document.getElementById("wallpaper-modal").remove();
    }

    // 创建弹窗容器
    const modal = document.createElement("div");
    modal.id = "wallpaper-modal";
    modal.className =
      "fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75";

    // 点击背景关闭弹窗
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // 创建弹窗内容
    const modalContent = document.createElement("div");
    modalContent.className =
      "relative bg-white rounded-lg shadow-xl w-full max-w-5xl h-full md:h-5/6 flex flex-col";

    // 创建iframe
    const iframe = document.createElement("iframe");
    iframe.id = "wallpaper-iframe";
    iframe.className = "w-full h-full flex-grow border-none";
    iframe.srcdoc = this.getIframeContent();

    // 添加到DOM
    modalContent.appendChild(iframe);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // 监听ESC键关闭
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const modal = document.getElementById("wallpaper-modal");
        if (modal) modal.remove();
      }
    });
  }

  /**
   * 获取iframe内容
   */
  getIframeContent() {
    return `
      <!DOCTYPE html>
      <html lang="zh">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>壁纸库</title>
        <style type="text/css">
          body {
            height: 100vh;
            margin: 0;
            padding: 0;
            text-align: center;
            background-color: #111;
            overflow: hidden;
            font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
          }
          #wallpaperContainer {
            width: 100%;
            height: calc(100% - 60px);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
          }
          .wallpaper-img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            transition: transform 0.3s ease;
          }
          .nav-arrow {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 50px;
            height: 50px;
            background-color: rgba(0, 0, 0, 0.3);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.3s, background-color 0.3s;
            z-index: 10;
          }
          .nav-arrow.prev {
            left: 20px;
          }
          .nav-arrow.next {
            right: 20px;
          }
          .nav-arrow:hover {
            background-color: rgba(0, 0, 0, 0.6);
          }
          #wallpaperContainer:hover .nav-arrow {
            opacity: 0.7;
          }
          .control-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 60px;
            background-color: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 9999;
            padding: 0 20px;
          }
          .control-button {
            color: black;
            background-color: #fff;
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 6px 20px;
            font-size: 14px;
            min-width: 100px;
            cursor: pointer;
            transition: all 0.2s;
            margin: 0 auto;
          }
          .control-button:hover {
            background-color: #f0f0f0;
            border-color: #999;
            box-shadow: 0 0 5px rgba(0,0,0,0.1);
          }
          .control-button:active {
            background-color: #e0e0e0;
            transform: translateY(1px);
          }
          .close-icon {
            position: absolute;
            top: 10px;
            right: 10px;
            width: 30px;
            height: 30px;
            background-color: rgba(0, 0, 0, 0.5);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 1000;
            transition: opacity 0.3s;
            opacity: 0.5;
          }
          .close-icon:hover {
            opacity: 1;
          }
          .settings-panel {
            padding: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .settings-panel select, .settings-panel input {
            padding: 6px;
            border-radius: 4px;
            border: 1px solid #ccc;
            background: rgba(255, 255, 255, 0.9);
          }
          .image-info {
            position: absolute;
            bottom: 10px;
            left: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.6);
            color: white;
            padding: 8px;
            border-radius: 4px;
            text-align: left;
            font-size: 12px;
            opacity: 0;
            transition: opacity 0.3s;
          }
          #wallpaperContainer:hover .image-info {
            opacity: 1;
          }
          .wallpaper-detail {
            position: absolute;
            z-index: 10;
            top: 10px;
            right: 50px;
            background-color: rgba(0, 0, 0, 0.5);
            color: white;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            opacity: 0.5;
            transition: opacity 0.3s;
          }
          .wallpaper-detail:hover {
            opacity: 1;
          }
          .wallpaper-fullscreen {
            position: absolute;
            z-index: 10;
            top: 10px;
            right: 90px;
            background-color: rgba(0, 0, 0, 0.5);
            color: white;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            opacity: 0.5;
            transition: opacity 0.3s;
          }
          .wallpaper-fullscreen:hover {
            opacity: 1;
          }
          .wallpaper-download {
            position: absolute;
            z-index: 10;
            top: 10px;
            right: 90px;
            background-color: rgba(0, 0, 0, 0.5);
            color: white;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            opacity: 0.5;
            transition: opacity 0.3s;
          }
          .wallpaper-download:hover {
            opacity: 1;
          }
          .detail-modal {
            position: fixed;
            inset: 0;
            background-color: rgba(0, 0, 0, 0.9);
            display: none;
            z-index: 20;
            color: white;
            overflow-y: auto;
            padding: 40px 20px;
          }
          .detail-modal-content {
            max-width: 800px;
            margin: 0 auto;
            position: relative;
          }
          .detail-close {
            position: absolute;
            top: 10px;
            right: 10px;
            color: white;
            font-size: 24px;
            cursor: pointer;
          }
          .detail-title {
            font-size: 24px;
            margin-bottom: 20px;
          }
          .detail-text {
            line-height: 1.6;
            text-align: left;
          }
          .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 16px;
          }
          .toast {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            z-index: 10000;
            display: none;
          }
        </style>
      </head>
      <body>
        <div id="wallpaperContainer">
          <div class="loading">加载中...</div>
          <div class="nav-arrow prev" id="prevDay">❮</div>
          <div class="nav-arrow next" id="nextDay">❯</div>
        </div>
        <div id="detailModal" class="detail-modal">
          <div class="detail-modal-content">
            <div class="detail-close" id="detailClose">×</div>
            <h2 class="detail-title" id="detailTitle"></h2>
            <div class="detail-text" id="detailText"></div>
          </div>
        </div>
        <div class="control-bar">
          <div class="settings-panel">
            <select id="sizeSelect">
              <option value="">原始尺寸</option>
              <option value="UHD">UHD</option>
              <option value="1920x1080" selected>1920x1080</option>
              <option value="1920x1200">1920x1200</option>
              <option value="1366x768">1366x768</option>
              <option value="1280x768">1280x768</option>
              <option value="1024x768">1024x768</option>
              <option value="800x600">800x600</option>
              <option value="800x480">800x480</option>
              <option value="768x1280">768x1280</option>
              <option value="720x1280">720x1280</option>
              <option value="640x480">640x480</option>
              <option value="480x800">480x800</option>
              <option value="400x240">400x240</option>
              <option value="320x240">320x240</option>
              <option value="240x320">240x320</option>
            </select>
            <input type="date" id="dateSelect">
          </div>
          <div style="flex: 1; display: flex; justify-content: center;">
            <button class="control-button" id="randomButton">随机壁纸</button>
          </div>
          <div style="width: 200px;"></div>
        </div>
        <div id="toast" class="toast"></div>
        <div class="close-icon" id="closeIcon">×</div>
        <script>
          // 当前壁纸数据
          let currentWallpaper = {
            url: "",
            copyright: "",
            title: "",
            date: "",
            width: "",
            height: "",
            show: "",
            detail: ""
          };
          
          // 显示提示
          function showToast(message, duration = 3000) {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.style.display = 'block';
            
            setTimeout(() => {
              toast.style.display = 'none';
            }, duration);
          }
          
          // 加载壁纸
          function loadWallpaper(params = {}) {
            const container = document.getElementById('wallpaperContainer');
            // 清空除导航箭头外的内容
            Array.from(container.children).forEach(child => {
              if (!child.classList.contains('nav-arrow')) {
                child.remove();
              }
            });
            
            // 添加加载提示
            const loading = document.createElement('div');
            loading.className = 'loading';
            loading.textContent = '加载中...';
            container.appendChild(loading);
            
            // 构建API URL
            let apiUrl = 'https://bing.ee123.net/img/';
            const queryParams = [];
            
            if (params.date) {
              queryParams.push('date=' + params.date.replace(/-/g, ''));
            }
            
            if (params.size) {
              queryParams.push('size=' + params.size);
            }
            
            // 如果需要获取JSON数据，必须添加type=json参数
            const needJson = params.date || params.needInfo;
            if (needJson) {
              queryParams.push('type=json');
              
              if (queryParams.length > 0) {
                apiUrl += '?' + queryParams.join('&');
              }
              
              // 发送JSON请求
              fetchJsonWallpaper(apiUrl);
            } else {
              // 直接获取图像
              if (params.size) {
                apiUrl += '?' + queryParams.join('&');
              }
              
              fetchImageWallpaper(apiUrl);
            }
            
            // 更新日期选择器
            if (params.date) {
              document.getElementById('dateSelect').value = params.date;
            }
          }
          
          // 获取JSON格式的壁纸数据
          function fetchJsonWallpaper(url) {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            
            xhr.onreadystatechange = function() {
              if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                  try {
                    const response = JSON.parse(xhr.responseText);
                    displayJsonWallpaper(response);
                  } catch(e) {
                    showToast('解析响应失败');
                    const container = document.getElementById('wallpaperContainer');
                    // 移除加载提示
                    removeLoadingIndicator();
                    
                    const errorDiv = document.createElement('div');
                    errorDiv.style.color = 'white';
                    errorDiv.textContent = '加载失败，请重试';
                    container.appendChild(errorDiv);
                  }
                } else {
                  showToast('请求失败: ' + xhr.status);
                  removeLoadingIndicator();
                  
                  const container = document.getElementById('wallpaperContainer');
                  const errorDiv = document.createElement('div');
                  errorDiv.style.color = 'white';
                  errorDiv.textContent = '加载失败，请重试';
                  container.appendChild(errorDiv);
                }
              }
            };
            
            xhr.onerror = function() {
              showToast('网络错误');
              removeLoadingIndicator();
              
              const container = document.getElementById('wallpaperContainer');
              const errorDiv = document.createElement('div');
              errorDiv.style.color = 'white';
              errorDiv.textContent = '网络错误，请重试';
              container.appendChild(errorDiv);
            };
            
            xhr.send();
          }
          
          // 移除加载指示器
          function removeLoadingIndicator() {
            const loadingElement = document.querySelector('.loading');
            if (loadingElement) {
              loadingElement.remove();
            }
          }
          
          // 直接获取图像壁纸
          function fetchImageWallpaper(url) {
            removeLoadingIndicator();
            
            const container = document.getElementById('wallpaperContainer');
            
            const img = document.createElement('img');
            img.className = 'wallpaper-img';
            img.src = url;
            img.alt = '壁纸';
            
            // 图片加载成功后更新当前壁纸数据
            img.onload = function() {
              currentWallpaper = {
                url: url,
                copyright: "Bing壁纸",
                title: "精美壁纸",
                date: new Date().toISOString().split('T')[0],
                width: img.naturalWidth || "",
                height: img.naturalHeight || "",
                show: "",
                detail: ""
              };
              
              // 添加信息显示
              updateInfoPanel();
            };
            
            img.onerror = function() {
              showToast('加载图片失败');
              const errorDiv = document.createElement('div');
              errorDiv.style.color = 'white';
              errorDiv.textContent = '加载失败，请重试';
              container.appendChild(errorDiv);
            };
            
            container.insertBefore(img, document.getElementById('prevDay'));
          }
          
          // 显示JSON壁纸数据
          function displayJsonWallpaper(data) {
            removeLoadingIndicator();
            
            const container = document.getElementById('wallpaperContainer');
            
            // 保存当前壁纸数据
            currentWallpaper = {
              url: data.imgurl || data.imgurl_d || "",
              copyright: data.imgcopyright || "",
              title: data.imgtitle || "壁纸",
              date: data.date || new Date().toISOString().split('T')[0],
              width: "",
              height: "",
              show: data.imgshow || "",
              detail: data.imgdetail || ""
            };
            
            // 创建壁纸图片元素
            const img = document.createElement('img');
            img.className = 'wallpaper-img';
            img.src = currentWallpaper.url;
            img.alt = currentWallpaper.title;
            
            // 图片加载成功后更新尺寸
            img.onload = function() {
              currentWallpaper.width = img.naturalWidth || "";
              currentWallpaper.height = img.naturalHeight || "";
              updateInfoPanel();
            };
            
            container.insertBefore(img, document.getElementById('prevDay'));
            
            // 如果有详细描述，添加详情按钮
            if (currentWallpaper.detail) {
              const detailBtn = document.createElement('div');
              detailBtn.className = 'wallpaper-detail';
              detailBtn.innerHTML = '?';
              detailBtn.title = '查看壁纸详情';
              detailBtn.addEventListener('click', showDetailModal);
              container.appendChild(detailBtn);
            }
            
            // 添加下载按钮
            const downloadBtn = document.createElement('div');
            downloadBtn.className = 'wallpaper-download';
            downloadBtn.innerHTML = '↓';
            downloadBtn.title = '下载壁纸';
            downloadBtn.addEventListener('click', downloadWallpaper);
            container.appendChild(downloadBtn);
            
            // 添加全屏按钮
            const fullscreenBtn = document.createElement('div');
            fullscreenBtn.className = 'wallpaper-fullscreen';
            fullscreenBtn.innerHTML = '⛶';
            fullscreenBtn.title = '全屏显示';
            fullscreenBtn.addEventListener('click', toggleFullscreen);
            container.appendChild(fullscreenBtn);
            
            // 更新信息面板
            updateInfoPanel();
            
            // 更新详情面板
            updateDetailPanel();
          }
          
          // 更新信息面板
          function updateInfoPanel() {
            // 移除旧的信息面板
            const oldInfo = document.querySelector('.image-info');
            if (oldInfo) {
              oldInfo.remove();
            }
            
            const container = document.getElementById('wallpaperContainer');
            
            // 添加信息显示
            const info = document.createElement('div');
            info.className = 'image-info';
            
            let infoHtml = '';
            if (currentWallpaper.title) {
              infoHtml += \`<div>\${currentWallpaper.title}</div>\`;
            }
            if (currentWallpaper.copyright) {
              infoHtml += \`<div>\${currentWallpaper.copyright}</div>\`;
            }
            if (currentWallpaper.show) {
              infoHtml += \`<div>\${currentWallpaper.show}</div>\`;
            }
            if (currentWallpaper.width && currentWallpaper.height) {
              infoHtml += \`<div>分辨率: \${currentWallpaper.width}×\${currentWallpaper.height}</div>\`;
            }
            if (currentWallpaper.date) {
              infoHtml += \`<div>日期: \${currentWallpaper.date}</div>\`;
            }
            
            info.innerHTML = infoHtml;
            
            container.appendChild(info);
          }
          
          // 更新详情面板
          function updateDetailPanel() {
            const detailTitle = document.getElementById('detailTitle');
            const detailText = document.getElementById('detailText');
            
            if (currentWallpaper.title) {
              detailTitle.textContent = currentWallpaper.title;
            } else {
              detailTitle.textContent = '壁纸详情';
            }
            
            if (currentWallpaper.detail) {
              // 清理HTML标签
              const cleanDetail = currentWallpaper.detail
                .replace(/<\\/?p>/g, '')  // 移除<p>和</p>标签
                .replace(/\\u003C\\/p\\u003E/g, '<br><br>')  // 替换Unicode编码的</p>为换行
                .replace(/\\u003Cp\\u003E/g, '')  // 替换Unicode编码的<p>
                .replace(/\\n/g, '<br>');  // 替换换行符
              
              detailText.innerHTML = cleanDetail;
            } else {
              detailText.textContent = '暂无详细信息';
            }
          }
          
          // 显示详情模态框
          function showDetailModal() {
            const modal = document.getElementById('detailModal');
            modal.style.display = 'block';
          }
          
          // 隐藏详情模态框
          function hideDetailModal() {
            const modal = document.getElementById('detailModal');
            modal.style.display = 'none';
          }
          
          // 切换到前一天
          function navigateToPrevDay() {
            if (!currentWallpaper.date) return;
            
            const currentDate = new Date(currentWallpaper.date);
            currentDate.setDate(currentDate.getDate() - 1);
            
            // 检查是否超出最早日期限制 (2010-01-01)
            const minDate = new Date('2010-01-01');
            if (currentDate < minDate) {
              showToast('已经是最早的日期了');
              return;
            }
            
            const year = currentDate.getFullYear();
            const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
            const day = currentDate.getDate().toString().padStart(2, '0');
            const dateString = \`\${year}-\${month}-\${day}\`;
            
            loadWallpaper({
              date: dateString,
              size: document.getElementById('sizeSelect').value
            });
          }
          
          // 切换到后一天
          function navigateToNextDay() {
            if (!currentWallpaper.date) return;
            
            const currentDate = new Date(currentWallpaper.date);
            currentDate.setDate(currentDate.getDate() + 1);
            
            // 检查是否超出今天的日期
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (currentDate > today) {
              showToast('已经是最新的日期了');
              return;
            }
            
            const year = currentDate.getFullYear();
            const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
            const day = currentDate.getDate().toString().padStart(2, '0');
            const dateString = \`\${year}-\${month}-\${day}\`;
            
            loadWallpaper({
              date: dateString,
              size: document.getElementById('sizeSelect').value
            });
          }
          
          // 初始化日期选择器
          function initDatePicker() {
            const dateSelect = document.getElementById('dateSelect');
            const today = new Date();
            const year = today.getFullYear();
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const day = today.getDate().toString().padStart(2, '0');
            
            dateSelect.max = \`\${year}-\${month}-\${day}\`;
            dateSelect.min = '2010-01-01';
            dateSelect.value = \`\${year}-\${month}-\${day}\`;
            
            dateSelect.addEventListener('change', () => {
              if (dateSelect.value) {
                loadWallpaper({
                  date: dateSelect.value,
                  size: document.getElementById('sizeSelect').value
                });
              }
            });
          }
          
          // 下载当前壁纸
          function downloadWallpaper() {
            if (!currentWallpaper.url) {
              showToast('没有可下载的壁纸');
              return;
            }
            
            // 在新标签页打开图片
            window.open(currentWallpaper.url, '_blank');
          }
          
          // 事件绑定
          document.addEventListener('DOMContentLoaded', () => {
            // 初始化日期选择器
            initDatePicker();
            
            // 加载初始壁纸
            loadWallpaper({
              needInfo: true, // 请求带详细信息的JSON
              date: document.getElementById('dateSelect').value,
              size: document.getElementById('sizeSelect').value
            });
            
            // 左右导航箭头事件
            document.getElementById('prevDay').addEventListener('click', navigateToPrevDay);
            document.getElementById('nextDay').addEventListener('click', navigateToNextDay);
            
            // 尺寸选择事件
            document.getElementById('sizeSelect').addEventListener('change', (e) => {
              loadWallpaper({
                date: document.getElementById('dateSelect').value,
                size: e.target.value
              });
            });
            
            // 随机壁纸按钮事件
            document.getElementById('randomButton').addEventListener('click', () => {
              // 在2010-01-01到今天之间随机选择一个日期
              const startDate = new Date('2010-01-01');
              const endDate = new Date();
              const randomDate = getRandomDate(startDate, endDate);
              
              const year = randomDate.getFullYear();
              const month = (randomDate.getMonth() + 1).toString().padStart(2, '0');
              const day = randomDate.getDate().toString().padStart(2, '0');
              const dateString = \`\${year}-\${month}-\${day}\`;
              
              // 更新日期选择器
              document.getElementById('dateSelect').value = dateString;
              
              // 加载随机日期壁纸
              loadWallpaper({
                date: dateString,
                size: document.getElementById('sizeSelect').value
              });
            });
            
            // 关闭按钮事件
            const closeIcon = document.getElementById('closeIcon');
            if (closeIcon) {
              closeIcon.addEventListener('click', function() {
                // 使用try-catch处理可能的错误
                try {
                  if (window.parent && window.parent.document) {
                    const modal = window.parent.document.getElementById('wallpaper-modal');
                    if (modal) {
                      modal.remove();
                    }
                  }
                } catch (e) {
                  console.error('关闭模态框失败:', e);
                }
              });
            }
            
            // 详情模态框关闭事件
            document.getElementById('detailClose').addEventListener('click', hideDetailModal);
          });
          
          // 获取两个日期之间的随机日期
          function getRandomDate(start, end) {
            const startTime = start.getTime();
            const endTime = end.getTime();
            const randomTime = startTime + Math.random() * (endTime - startTime);
            return new Date(randomTime);
          }
          
          // 切换全屏状态
          function toggleFullscreen() {
            const container = document.getElementById('wallpaperContainer');
            const fullscreenBtn = document.querySelector('.wallpaper-fullscreen');
            
            if (!document.fullscreenElement) {
              container.requestFullscreen().catch(err => {
                showToast('全屏模式不可用: ' + err.message);
              });
              fullscreenBtn.innerHTML = '⮽';
              fullscreenBtn.title = '退出全屏';
            } else {
              document.exitFullscreen();
              fullscreenBtn.innerHTML = '⛶';
              fullscreenBtn.title = '全屏显示';
            }
          }
          
          // 监听全屏变化
          document.addEventListener('fullscreenchange', () => {
            const fullscreenBtn = document.querySelector('.wallpaper-fullscreen');
            if (document.fullscreenElement) {
              fullscreenBtn.innerHTML = '⮽';
              fullscreenBtn.title = '退出全屏';
            } else {
              fullscreenBtn.innerHTML = '⛶';
              fullscreenBtn.title = '全屏显示';
            }
          });
        </script>
      </body>
      </html>
    `;
  }
}

// 将组件类暴露给全局
window.Wallpaper = Wallpaper;
