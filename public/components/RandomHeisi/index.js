/**
 * 随机黑丝图片组件
 */
class RandomHeisi {
  constructor() {
    this.name = "随机黑丝";
    this.iconClass = "fa-solid fa-image";
    this.backgroundColor = "bg-purple-500";

    // 添加新属性，用于组件库显示
    this.icon = "fa-solid fa-image";
    this.bgColor = "bg-purple-500";
    this.description = "随机展示黑丝图片";
  }

  /**
   * 获取组件HTML
   * @returns {string} 组件的HTML元素字符串
   */
  render() {
    return `
      <div class="app-container flex flex-col items-center cursor-pointer" id="random-heisi">
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
      .getElementById("random-heisi")
      .addEventListener("click", this.handleClick.bind(this));
  }

  /**
   * 点击处理函数
   */
  handleClick() {
    // 创建图片弹窗
    this.createModal();
  }

  /**
   * 创建弹窗
   */
  createModal() {
    // 检查是否已存在弹窗
    if (document.getElementById("random-heisi-modal")) {
      document.getElementById("random-heisi-modal").remove();
    }

    // 创建弹窗容器
    const modal = document.createElement("div");
    modal.id = "random-heisi-modal";
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
      "relative bg-white rounded-lg shadow-xl w-full max-w-md h-full md:h-5/6 flex flex-col";

    // 创建iframe
    const iframe = document.createElement("iframe");
    iframe.id = "random-heisi-iframe";
    iframe.className = "w-full h-full flex-grow border-none";
    iframe.srcdoc = this.getIframeContent();

    // 添加到DOM
    modalContent.appendChild(iframe);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // 监听ESC键关闭
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const modal = document.getElementById("random-heisi-modal");
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
        <title>随机黑丝</title>
        <style type="text/css">
          body {
            height: 100vh;
            margin: 0;
            padding: 0;
            text-align: center;
            background-color: #000;
            overflow: hidden;
          }
          #imageContainer {
            width: 100%;
            height: calc(100% - 50px);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }
          .control-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 50px;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: space-around;
            align-items: center;
            z-index: 9999;
          }
          .control-button {
            color: white;
            background-color: rgba(255, 255, 255, 0.2);
            border: none;
            border-radius: 5px;
            padding: 10px 30px;
            font-size: 16px;
            min-width: 120px;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <div id="imageContainer"></div>
        <div class="control-bar">
          <button class="control-button" id="closeModalButton">关闭</button>
          <button class="control-button" id="nextButton">下一张图片</button>
        </div>
        <script>
          // AJAX工具函数
          function ajaxTools(config) {
            // 创建xhr对象实例
            const xhr = new XMLHttpRequest();
            const isGetRequest = config.type.toUpperCase() === 'GET';
            const isPOSTRequest = config.type.toUpperCase() === 'POST';
            let url = config.url;

            if (isGetRequest) {
              if (typeof config.data !== 'undefined') {
                if (typeof config.data === 'string') {
                  url += '?' + config.data;
                } else if (typeof config.data === 'object') {
                  const params = new URLSearchParams(config.data).toString();
                  url += '?' + params;
                }
              }
              xhr.open('GET', url, true);
            } else if (isPOSTRequest) {
              if (config.data instanceof FormData) {
                // 无需为FormData设置content-type;浏览器处理它。
              } else if (typeof config.data === "object") {
                xhr.setRequestHeader('Content-Type', 'application/json');
                config.data = JSON.stringify(config.data);
              } else if (typeof config.data === 'string') {
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
              }
              xhr.open('POST', config.url, true);
            }

            // 添加请求头
            addHeaders(xhr, config.header);

            // 监听状态变化
            xhr.onreadystatechange = function () {
              if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                  const response = JSON.parse(xhr.responseText);
                  if (typeof config.success === 'function') {
                    config.success(response);
                  }
                } else {
                  if (typeof config.error === 'function') {
                    config.error(xhr.status, xhr.statusText);
                  }
                }
              }
            };

            // 发送请求
            if (isGetRequest) {
              xhr.send();
            } else if (isPOSTRequest) {
              xhr.send(config.data);
            }

            /**添加请求头*/
            function addHeaders(xhr, headers) {
              if (typeof headers === 'object') {
                Object.keys(headers).forEach(key => {
                  xhr.setRequestHeader(key, headers[key]);
                });
              }
            }
          }

          // 图片加载函数
          function loadImage() {
            ajaxTools({
              type: 'get',
              url: '/api/heisi',
              success(res) {
                if (res.code === 200 && res.data) {
                  const imageContainer = document.getElementById('imageContainer');
                  imageContainer.innerHTML = '';
                  
                  const img = document.createElement('img');
                  img.src = res.data;
                  img.alt = "随机黑丝图片";
                  img.title = "点击下一张";
                  
                  imageContainer.appendChild(img);
                  
                  img.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    loadImage();
                  };
                  
                  img.onerror = function() {
                    console.error('图片加载失败，尝试下一张');
                    loadImage();
                  };
                } else {
                  console.error('API返回错误:', res.msg);
                  setTimeout(loadImage, 1000);
                }
              },
              error(status, statusText) {
                console.error('API请求失败:', status, statusText);
                setTimeout(loadImage, 1000);
              }
            });
          }
          
          // 添加控制栏按钮事件
          document.getElementById('nextButton').addEventListener('click', function() {
            loadImage();
          });
          
          document.getElementById('closeModalButton').addEventListener('click', function() {
            window.parent.document.getElementById('random-heisi-modal').remove();
          });

          // 页面加载时开始加载图片
          loadImage();
        </script>
      </body>
      </html>
    `;
  }

  /**
   * 显示提示消息
   * @param {string} message - 提示内容
   * @param {string} type - 提示类型 (error, success, info, warning)
   */
  showToast(message, type = "info") {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");

    if (!toast || !toastMessage) return;

    // 设置消息内容
    toastMessage.textContent = message;

    // 根据类型设置背景色
    if (type === "error") {
      toast.className =
        "fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
    } else if (type === "success") {
      toast.className =
        "fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
    } else if (type === "warning") {
      toast.className =
        "fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
    } else {
      toast.className =
        "fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
    }

    // 显示提示框
    toast.classList.remove("hidden");

    // 2秒后自动隐藏
    setTimeout(() => {
      toast.classList.add("hidden");
    }, 2000);
  }
}

// 导出组件
window.RandomHeisi = RandomHeisi;
