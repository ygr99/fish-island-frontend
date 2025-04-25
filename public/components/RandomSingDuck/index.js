/**
 * 随机唱鸭组件
 */
class RandomSingDuck {
  constructor() {
    this.name = "随机唱鸭";
    this.iconClass = "fa-solid fa-music";
    this.backgroundColor = "bg-teal-500";

    // 添加新属性，用于组件库显示
    this.icon = "fa-solid fa-music";
    this.bgColor = "bg-teal-500";
    this.description = "随机展示唱鸭歌曲";
  }

  /**
   * 获取组件HTML
   * @returns {string} 组件的HTML元素字符串
   */
  render() {
    return `
      <div class="app-container flex flex-col items-center cursor-pointer" id="random-singduck">
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
      .getElementById("random-singduck")
      .addEventListener("click", this.handleClick.bind(this));
  }

  /**
   * 点击处理函数
   */
  handleClick() {
    // 创建唱鸭弹窗
    this.createModal();
  }

  /**
   * 创建弹窗
   */
  createModal() {
    // 检查是否已存在弹窗
    if (document.getElementById("random-singduck-modal")) {
      document.getElementById("random-singduck-modal").remove();
    }

    // 创建弹窗容器
    const modal = document.createElement("div");
    modal.id = "random-singduck-modal";
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
    iframe.id = "random-singduck-iframe";
    iframe.className = "w-full h-full flex-grow border-none";
    iframe.srcdoc = this.getIframeContent();

    // 添加到DOM
    modalContent.appendChild(iframe);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // 监听ESC键关闭
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const modal = document.getElementById("random-singduck-modal");
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
        <title>随机唱鸭</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style type="text/css">
          body {
            height: 100vh;
            margin: 0;
            padding: 0;
            text-align: center;
            background-color: #000;
            overflow: hidden;
            color: white;
            font-family: 'Arial', sans-serif;
          }
          #contentContainer {
            width: 100%;
            height: calc(100% - 50px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            padding: 20px;
            overflow-y: auto;
            position: relative;
            background: linear-gradient(to bottom, #1e2a78, #0f1642);
          }
          .song-info {
            width: 100%;
            max-width: 500px;
            margin-bottom: 20px;
            text-align: left;
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          }
          .song-info h2 {
            font-size: 28px;
            margin: 0 0 10px 0;
            color: #4fd1c5;
            font-weight: bold;
          }
          .song-info .artist {
            font-size: 18px;
            margin: 0 0 10px 0;
            color: #e2e8f0;
          }
          .user-info {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 15px;
            width: 100%;
            max-width: 500px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          }
          .user-image {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            margin-right: 15px;
            object-fit: cover;
            border: 3px solid rgba(79, 209, 197, 0.6);
            box-shadow: 0 0 10px rgba(79, 209, 197, 0.4);
          }
          .user-name {
            font-size: 18px;
            color: #e2e8f0;
          }
          .lyrics {
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 20px;
            text-align: left;
            max-width: 500px;
            width: 100%;
            margin: 0 auto 20px;
            white-space: pre-line;
            line-height: 1.8;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            color: #e2e8f0;
            border-left: 4px solid #4fd1c5;
          }
          audio {
            width: 100%;
            max-width: 500px;
            margin: 20px 0;
            border-radius: 30px;
            outline: none;
          }
          audio::-webkit-media-controls-panel {
            background-color: rgba(255, 255, 255, 0.15);
            border-radius: 30px;
          }
          audio::-webkit-media-controls-play-button {
            background-color: #4fd1c5;
            border-radius: 50%;
            color: white;
          }
          .error-message {
            color: #ff6b6b;
            padding: 20px;
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            margin: 20px 0;
            width: 100%;
            max-width: 500px;
            text-align: center;
          }
          .iframe-container {
            width: 100%;
            flex-grow: 1;
            margin-top: 20px;
          }
          iframe {
            width: 100%;
            height: 100%;
            border: none;
          }
          .control-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 60px;
            background: linear-gradient(to right, #1e2a78, #2d3a88);
            display: flex;
            justify-content: space-around;
            align-items: center;
            z-index: 9999;
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.5);
          }
          .control-button {
            color: white;
            background-color: rgba(79, 209, 197, 0.7);
            border: none;
            border-radius: 30px;
            padding: 12px 30px;
            font-size: 16px;
            min-width: 140px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
          }
          .control-button:hover {
            background-color: rgba(79, 209, 197, 1);
            transform: translateY(-2px);
          }
          .control-button i {
            margin-right: 8px;
          }
          .original-page-button {
            position: absolute;
            top: 20px;
            right: 20px;
            background-color: rgba(79, 209, 197, 0.7);
            color: white;
            border: none;
            border-radius: 30px;
            padding: 8px 16px;
            font-size: 14px;
            cursor: pointer;
            z-index: 100;
            display: flex;
            align-items: center;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
          }
          .original-page-button:hover {
            background-color: rgba(79, 209, 197, 1);
            transform: translateY(-2px);
          }
          .original-page-button i {
            margin-right: 5px;
          }
          .loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
          }
          .spinner {
            border: 4px solid rgba(79, 209, 197, 0.2);
            border-radius: 50%;
            border-top: 4px solid #4fd1c5;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }
          .loading-text {
            color: #4fd1c5;
            font-size: 18px;
            margin-top: 15px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
          }
        </style>
      </head>
      <body>
        <div id="contentContainer">
          <div id="loadingIndicator" class="loading">
            <div class="spinner"></div>
            <div class="loading-text">加载中...</div>
          </div>
        </div>
        <div class="control-bar">
          <button class="control-button" id="closeModalButton"><i class="fa fa-times"></i>关闭</button>
          <button class="control-button" id="nextButton"><i class="fa fa-random"></i>下一首歌曲</button>
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
              xhr.open('POST', config.url, true);
              if (config.data instanceof FormData) {
                // 无需为FormData设置content-type;浏览器处理它。
              } else if (typeof config.data === "object") {
                xhr.setRequestHeader('Content-Type', 'application/json');
                config.data = JSON.stringify(config.data);
              } else if (typeof config.data === 'string') {
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
              }
            }

            // 添加请求头
            addHeaders(xhr, config.header);

            // 监听状态变化
            xhr.onreadystatechange = function () {
              if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                  try {
                    const response = JSON.parse(xhr.responseText);
                    if (typeof config.success === 'function') {
                      config.success(response);
                    }
                  } catch (e) {
                    if (typeof config.error === 'function') {
                      config.error(xhr.status, 'JSON解析错误：' + e.message);
                    }
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

          // 显示加载状态
          function showLoading() {
            const container = document.getElementById('contentContainer');
            container.innerHTML = '<div id="loadingIndicator" class="loading"><div class="spinner"></div><div class="loading-text">加载中...</div></div>';
          }

          // 显示错误信息
          function showError(message) {
            const container = document.getElementById('contentContainer');
            container.innerHTML = \`<div class="error-message">\${message}</div>\`;
          }

          // 显示歌曲信息
          function showSongInfo(data) {
            if (!data || !data.code) {
              showError('获取歌曲信息失败');
              return;
            }

            if (data.code !== 1) {
              showError(\`错误码: \${data.code}, 信息: \${data.message || '未知错误'}\`);
              return;
            }

            const songData = data.data;
            const container = document.getElementById('contentContainer');
            
            // 清空加载指示器
            container.innerHTML = '';
            
            // 添加音频播放器容器
            const audioContainer = document.createElement('div');
            audioContainer.className = 'audio-container';
            audioContainer.style.width = '100%';
            audioContainer.style.maxWidth = '500px';
            audioContainer.style.marginTop = '10px';
            audioContainer.style.marginBottom = '20px';
            audioContainer.style.opacity = '0';
            audioContainer.style.transition = 'opacity 0.5s ease';
            
            // 创建歌曲信息部分
            const songInfo = document.createElement('div');
            songInfo.className = 'song-info';
            songInfo.style.opacity = '0';
            songInfo.style.transform = 'translateY(20px)';
            songInfo.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            
            // 歌曲名称
            const songTitle = document.createElement('h2');
            songTitle.textContent = songData.song_name || '未知歌曲';
            songInfo.appendChild(songTitle);
            
            // 原唱
            const artist = document.createElement('div');
            artist.className = 'artist';
            artist.textContent = \`原唱: \${songData.song_singer || '未知歌手'}\`;
            songInfo.appendChild(artist);
            
            // 用户信息（翻唱者）
            const userInfo = document.createElement('div');
            userInfo.className = 'user-info';
            userInfo.style.opacity = '0';
            userInfo.style.transform = 'translateY(20px)';
            userInfo.style.transition = 'opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s';
            
            // 用户头像
            if (songData.user_image) {
              const userImage = document.createElement('img');
              userImage.className = 'user-image';
              userImage.src = songData.user_image;
              userImage.alt = songData.user_name || '用户';
              userImage.onerror = function() {
                this.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24"><path fill="%23aaa" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3s-3-1.34-3-3s1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22c.03-1.99 4-3.08 6-3.08c1.99 0 5.97 1.09 6 3.08c-1.29 1.94-3.5 3.22-6 3.22z"/></svg>';
              };
              userInfo.appendChild(userImage);
            }
            
            // 用户名（翻唱者）
            const userName = document.createElement('div');
            userName.className = 'user-name';
            userName.innerHTML = \`<span style="font-size:14px;opacity:0.7;">翻唱:</span><br>\${songData.user_name || '未知用户'}\`;
            userInfo.appendChild(userName);
            
            // 添加音频播放器
            if (songData.song_url) {
              const audioPlayer = document.createElement('audio');
              audioPlayer.controls = true;
              audioPlayer.autoplay = true;
              audioPlayer.src = songData.song_url;
              audioContainer.appendChild(audioPlayer);
              
              // 处理音频错误
              audioPlayer.onerror = function() {
                this.outerHTML = '<div class="error-message">音频加载失败</div>';
              };
              
              // 添加播放状态指示器
              const playStatus = document.createElement('div');
              playStatus.style.fontSize = '14px';
              playStatus.style.color = '#4fd1c5';
              playStatus.style.marginTop = '5px';
              playStatus.style.textAlign = 'center';
              
              // 监听播放状态
              audioPlayer.addEventListener('play', () => {
                playStatus.innerHTML = '<i class="fa fa-music"></i> 正在播放...';
                playStatus.style.animation = 'pulse 2s infinite';
              });
              
              audioPlayer.addEventListener('pause', () => {
                playStatus.innerHTML = '<i class="fa fa-pause"></i> 已暂停';
                playStatus.style.animation = 'none';
              });
              
              audioPlayer.addEventListener('ended', () => {
                playStatus.innerHTML = '<i class="fa fa-check"></i> 播放完成';
                playStatus.style.animation = 'none';
              });
              
              audioContainer.appendChild(playStatus);
            }
            
            // 添加歌词
            let lyrics = null;
            if (songData.song_lyric) {
              lyrics = document.createElement('div');
              lyrics.className = 'lyrics';
              lyrics.textContent = songData.song_lyric;
              lyrics.style.opacity = '0';
              lyrics.style.transform = 'translateY(20px)';
              lyrics.style.transition = 'opacity 0.6s ease 0.4s, transform 0.6s ease 0.4s';
            }
            
            // 如果有URL，创建链接到原唱鸭页面的按钮
            if (songData.url) {
              const iframeButton = document.createElement('button');
              iframeButton.className = 'original-page-button';
              iframeButton.innerHTML = '<i class="fa fa-external-link"></i>查看原唱鸭页面';
              iframeButton.onclick = function() {
                // 在新标签页打开链接
                window.open(songData.url, '_blank');
              };
              
              container.appendChild(iframeButton);
            }
            
            // 添加所有元素到容器
            container.appendChild(songInfo);
            container.appendChild(userInfo);
            container.appendChild(audioContainer);
            if (lyrics) container.appendChild(lyrics);
            
            // 触发动画
            setTimeout(() => {
              songInfo.style.opacity = '1';
              songInfo.style.transform = 'translateY(0)';
              
              setTimeout(() => {
                userInfo.style.opacity = '1';
                userInfo.style.transform = 'translateY(0)';
                
                setTimeout(() => {
                  audioContainer.style.opacity = '1';
                  
                  if (lyrics) {
                    setTimeout(() => {
                      lyrics.style.opacity = '1';
                      lyrics.style.transform = 'translateY(0)';
                    }, 200);
                  }
                }, 200);
              }, 200);
            }, 100);
          }

          // 加载唱鸭数据
          function loadSingDuckData() {
            showLoading();
            
            ajaxTools({
              type: 'get',
              url: 'https://oiapi.net/API/SingDuck',
              success: function(res) {
                showSongInfo(res);
              },
              error: function(status, message) {
                showError(\`请求失败 (\${status}): \${message}\`);
              }
            });
          }

          // 初始化页面
          document.addEventListener('DOMContentLoaded', function() {
            // 加载第一首歌曲
            loadSingDuckData();
            
            // 设置按钮事件
            document.getElementById('closeModalButton').addEventListener('click', function() {
              try {
                window.parent.document.getElementById('random-singduck-modal').remove();
              } catch (e) {
                window.close();
              }
            });
            
            document.getElementById('nextButton').addEventListener('click', function() {
              loadSingDuckData();
            });
          });
        </script>
      </body>
      </html>
    `;
  }

  /**
   * 显示toast提示
   * @param {string} message - 提示消息
   * @param {string} type - 提示类型，可选值：info, success, error, warning
   */
  showToast(message, type = "info") {
    // 创建toast容器（如果不存在）
    let toastContainer = document.getElementById("toast-container");
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.id = "toast-container";
      toastContainer.className = "fixed top-16 right-4 z-50";
      document.body.appendChild(toastContainer);
    }

    // 创建toast元素
    const toast = document.createElement("div");
    toast.className = "mb-3 p-3 rounded shadow-lg animate-fade-in-down";

    // 根据类型设置样式
    switch (type) {
      case "success":
        toast.className += " bg-green-500 text-white";
        break;
      case "error":
        toast.className += " bg-red-500 text-white";
        break;
      case "warning":
        toast.className += " bg-yellow-500 text-white";
        break;
      case "info":
      default:
        toast.className += " bg-blue-500 text-white";
        break;
    }

    // 设置内容
    toast.textContent = message;

    // 添加到容器
    toastContainer.appendChild(toast);

    // 3秒后移除
    setTimeout(() => {
      toast.classList.add("animate-fade-out");
      setTimeout(() => {
        if (toast.parentNode === toastContainer) {
          toastContainer.removeChild(toast);
        }
        // 如果没有更多的toast，移除容器
        if (toastContainer.children.length === 0) {
          document.body.removeChild(toastContainer);
        }
      }, 300);
    }, 3000);
  }
}

// 全局导出组件类
window.RandomSingDuck = RandomSingDuck;
