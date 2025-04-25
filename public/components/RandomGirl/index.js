/**
 * 随机小姐姐视频组件
 */
class RandomGirl {
  constructor() {
    this.name = '随机小姐姐';
    this.iconClass = 'fa-female';
    this.backgroundColor = 'bg-pink-500';

    // 添加新属性，用于组件库显示
    this.icon = 'fa-female';
    this.bgColor = 'bg-pink-500';
    this.description = '随机播放小姐姐视频';
  }

  /**
   * 获取组件HTML
   * @returns {string} 组件的HTML元素字符串
   */
  render() {
    return `
      <div class="app-container flex flex-col items-center cursor-pointer" id="random-girl">
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
    document.getElementById('random-girl').addEventListener('click', this.handleClick.bind(this));
  }

  /**
   * 点击处理函数
   */
  handleClick() {
    // 创建iframe弹窗
    this.createModal();
  }

  /**
   * 创建弹窗
   */
  createModal() {
    // 检查是否已存在弹窗
    if (document.getElementById('random-girl-modal')) {
      document.getElementById('random-girl-modal').remove();
    }

    // 创建弹窗容器
    const modal = document.createElement('div');
    modal.id = 'random-girl-modal';
    modal.className = 'fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75';

    // 点击背景关闭弹窗
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // 创建弹窗内容
    const modalContent = document.createElement('div');
    modalContent.className =
      'relative bg-white rounded-lg shadow-xl w-full max-w-md h-full md:h-5/6 flex flex-col';

    // 创建iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'random-girl-iframe';
    iframe.className = 'w-full h-full flex-grow border-none';
    iframe.srcdoc = this.getIframeContent();

    // 添加到DOM
    modalContent.appendChild(iframe);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // 监听ESC键关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('random-girl-modal');
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
        <title>随机小姐姐</title>
        <style type="text/css">
          body {
            height: 100vh;
            margin: 0;
            padding: 0;
            text-align: center;
            background-color: #000;
            overflow: hidden;
          }
          #videoContainer {
            width: 100%;
            height: calc(100% - 50px);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          video {
            width: 100%;
            height: 100%;
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
        <div id="videoContainer"></div>
        <div class="control-bar">
          <button class="control-button" id="closeModalButton">关闭</button>
          <button class="control-button" id="nextButton">下一个视频</button>
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

          // 视频加载函数
          function loadVideo() {
            ajaxTools({
              type: 'get',
              url: '/api/miss',
              success(res) {
                if (res.code === 200 && res.data) {
                  const videoContainer = document.getElementById('videoContainer');
                  videoContainer.innerHTML = '';
                  
                  const video = document.createElement('video');
                  video.id = 'v1';
                  video.controls = true;
                  video.autoplay = true;
                  video.title = "点击下一个";
                  video.playsInline = true;
                  
                  const source = document.createElement('source');
                  source.src = res.data;
                  source.type = 'video/mp4';
                  
                  video.appendChild(source);
                  videoContainer.appendChild(video);
                  
                  video.volume = 0.6;
                  
                  video.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    loadVideo();
                  };
                  
                  video.onerror = function() {
                    console.error('视频加载失败，尝试下一个');
                    loadVideo();
                  };
                } else {
                  console.error('API返回错误:', res.msg);
                  setTimeout(loadVideo, 1000);
                }
              },
              error(status, statusText) {
                console.error('API请求失败:', status, statusText);
                setTimeout(loadVideo, 1000);
              }
            });
          }
          
          // 添加控制栏按钮事件
          document.getElementById('nextButton').addEventListener('click', function() {
            loadVideo();
          });
          
          document.getElementById('closeModalButton').addEventListener('click', function() {
            window.parent.document.getElementById('random-girl-modal').remove();
          });

          // 页面加载时开始加载视频
          loadVideo();
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
  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    if (!toast || !toastMessage) return;

    // 设置消息内容
    toastMessage.textContent = message;

    // 根据类型设置背景色
    if (type === 'error') {
      toast.className =
        'fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    } else if (type === 'success') {
      toast.className =
        'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    } else if (type === 'warning') {
      toast.className =
        'fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    } else {
      toast.className =
        'fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    }
    // 显示提示框
    toast.classList.remove('hidden');

    // 2秒后自动隐藏
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 2000);
  }
}

// 确保类导出到全局作用域
window.RandomGirl = RandomGirl;

// 如果组件系统已经初始化，直接注册组件
if (window.componentSystem) {
  try {
    window.componentSystem.register(RandomGirl);
    console.log('随机小姐姐组件已自动注册');
  } catch (err) {
    console.error('注册随机小姐姐组件时出错:', err);
  }
}

