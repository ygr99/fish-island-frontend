/**
 * 热榜插件组件
 */
class HotList {
  constructor() {
    this.name = "热榜";
    this.iconClass = "fa-solid fa-fire";
    this.backgroundColor = "bg-red-500";

    // 添加新属性，用于组件库显示
    this.icon = "fa-solid fa-fire";
    this.bgColor = "bg-red-500";
    this.description = "显示各大平台热门榜单";

    // 热榜类型配置
    this.hotTypes = [
      { id: "zhihu", name: "知乎热榜", icon: "fa-brands fa-zhihu" },
      { id: "weibo", name: "微博热搜", icon: "fa-brands fa-weibo" },
      { id: "baidu", name: "百度热点", icon: "fa-brands fa-baidu" },
      { id: "history", name: "历史上的今天", icon: "fa-solid fa-history" },
      { id: "bilihot", name: "哔哩哔哩热搜", icon: "fa-brands fa-bilibili" },
      {
        id: "biliall",
        name: "哔哩哔哩全站日榜",
        icon: "fa-brands fa-bilibili",
      },
      { id: "sspai", name: "少数派头条", icon: "fa-solid fa-newspaper" },
      { id: "douyin", name: "抖音热搜", icon: "fa-brands fa-tiktok" },
    ];

    // 默认热榜类型
    this.currentType = "zhihu";
  }

  /**
   * 获取组件HTML
   * @returns {string} 组件的HTML元素字符串
   */
  render() {
    return `
        <div class="app-container flex flex-col items-center cursor-pointer" id="hot-list">
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
      .getElementById("hot-list")
      .addEventListener("click", this.handleClick.bind(this));
  }

  /**
   * 点击处理函数
   */
  handleClick() {
    // 创建弹窗
    this.createModal();
  }

  /**
   * 创建弹窗
   */
  createModal() {
    // 检查是否已存在弹窗
    if (document.getElementById("hot-list-modal")) {
      document.getElementById("hot-list-modal").remove();
    }

    // 创建弹窗容器
    const modal = document.createElement("div");
    modal.id = "hot-list-modal";
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
      "relative bg-white rounded-lg shadow-xl w-full max-w-2xl h-full md:h-5/6 flex flex-col";

    // 创建iframe
    const iframe = document.createElement("iframe");
    iframe.id = "hot-list-iframe";
    iframe.className = "w-full h-full flex-grow border-none";
    iframe.srcdoc = this.getIframeContent();

    // 添加到DOM
    modalContent.appendChild(iframe);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // 监听ESC键关闭
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const modal = document.getElementById("hot-list-modal");
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
          <title>热门榜单</title>
          <style type="text/css">
            body {
              height: 100vh;
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background-color: #f8f9fa;
              overflow: hidden;
            }
            * {
              box-sizing: border-box;
            }
            .container {
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
            }
            .header {
              background-color: #fff;
              border-bottom: 1px solid #e0e0e0;
              padding: 10px 15px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              flex-shrink: 0;
              position: relative;
            }
            .title {
              font-size: 18px;
              font-weight: bold;
            }
            .subtitle {
              font-size: 12px;
              color: #666;
              margin-left: 10px;
            }
            .update-time {
              font-size: 12px;
              color: #999;
              margin-right: 40px;
            }
            .close-btn {
              position: absolute;
              right: 15px;
              top: 10px;
              width: 24px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
              color: #666;
              cursor: pointer;
              transition: all 0.2s;
              border-radius: 50%;
            }
            .close-btn:hover {
              background-color: rgba(0,0,0,0.05);
              color: #f44336;
            }
            .content-container {
              display: flex;
              flex: 1;
              overflow: hidden;
            }
            .tab-nav {
              display: flex;
              flex-direction: column;
              width: 150px;
              background-color: #f8f8f8;
              border-right: 1px solid #e0e0e0;
              overflow-y: auto;
              flex-shrink: 0;
            }
            .tab-nav-item {
              padding: 12px 10px;
              cursor: pointer;
              transition: all 0.2s;
              border-left: 3px solid transparent;
              display: flex;
              align-items: center;
              font-size: 14px;
            }
            .tab-nav-item.active {
              color: #f44336;
              background-color: #fff;
              border-left: 3px solid #f44336;
            }
            .tab-nav-item:hover {
              background-color: #f0f0f0;
            }
            .list-container {
              flex-grow: 1;
              overflow-y: auto;
              padding: 0 15px;
              background-color: #fff;
            }
            .hot-list {
              list-style: none;
              padding: 0;
              margin: 0;
            }
            .hot-item {
              display: flex;
              padding: 12px 0;
              border-bottom: 1px solid #f0f0f0;
              align-items: center;
            }
            .hot-item a {
              color: #333;
              text-decoration: none;
              flex-grow: 1;
              font-size: 15px;
              line-height: 1.5;
            }
            .hot-item a:hover {
              color: #f44336;
            }
            .hot-index {
              width: 24px;
              height: 24px;
              line-height: 24px;
              text-align: center;
              border-radius: 4px;
              background-color: #f5f5f5;
              color: #999;
              margin-right: 12px;
              font-size: 14px;
              flex-shrink: 0;
              font-weight: bold;
            }
            .hot-index.top1 {
              background-color: #f44336;
              color: white;
            }
            .hot-index.top2 {
              background-color: #ff9800;
              color: white;
            }
            .hot-index.top3 {
              background-color: #ffb74d;
              color: white;
            }
            .loading {
              text-align: center;
              padding: 20px;
              color: #999;
            }
            .error {
              text-align: center;
              padding: 20px;
              color: #f44336;
            }
            .icon {
              margin-right: 8px;
            }
            .empty {
              text-align: center;
              padding: 30px;
              color: #999;
            }
          </style>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div>
                <span class="title" id="list-title">热门榜单</span>
                <span class="subtitle" id="list-subtitle"></span>
              </div>
              <div class="update-time" id="update-time"></div>
              <div class="close-btn" id="close-btn"><i class="fas fa-times"></i></div>
            </div>
            
            <div class="content-container">
              <div class="tab-nav" id="tab-nav">
                <div class="loading">加载中...</div>
              </div>
              
              <div class="list-container">
                <div class="loading" id="loading">正在加载...</div>
                <ul class="hot-list" id="hot-list"></ul>
              </div>
            </div>
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
                    try {
                      const response = JSON.parse(xhr.responseText);
                      if (typeof config.success === 'function') {
                        config.success(response);
                      }
                    } catch (e) {
                      if (typeof config.error === 'function') {
                        config.error('解析JSON失败', e);
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
  
            // 全局变量存储所有热榜数据
            let allHotListData = [];
            
            // 初始化标签切换
            function initTabs() {
              // 先加载所有热榜数据
              loadAllHotList();
            }
            
            // 加载所有热榜数据
            function loadAllHotList() {
              const listContainer = document.getElementById('hot-list');
              const loadingEl = document.getElementById('loading');
              const tabNav = document.getElementById('tab-nav');
              
              listContainer.innerHTML = '';
              loadingEl.style.display = 'block';
              tabNav.innerHTML = '<div class="loading">加载中...</div>';
              
              ajaxTools({
                type: 'get',
                url: 'https://api.vvhan.com/api/hotlist/all',
                success(res) {
                  loadingEl.style.display = 'none';
                  tabNav.innerHTML = '';
                  
                  if (res.success && res.data && res.data.length > 0) {
                    // 存储所有热榜数据
                    allHotListData = res.data;
                    
                    // 为每个平台创建标签
                    allHotListData.forEach((platform, index) => {
                      const tabItem = document.createElement('div');
                      tabItem.className = 'tab-nav-item' + (index === 0 ? ' active' : '');
                      tabItem.setAttribute('data-name', platform.name);
                      
                      // 设置图标（简单映射一些常见平台）
                      let iconClass = 'fa-solid fa-fire';
                      if (platform.name.includes('知乎')) iconClass = 'fab fa-zhihu';
                      else if (platform.name.includes('微博')) iconClass = 'fab fa-weibo';
                      else if (platform.name.includes('百度')) iconClass = 'fab fa-baidu';
                      else if (platform.name.includes('哔哩')) iconClass = 'fab fa-bilibili';
                      else if (platform.name.includes('抖音')) iconClass = 'fab fa-tiktok';
                      else if (platform.name.includes('头条')) iconClass = 'fas fa-newspaper';
                      
                      tabItem.innerHTML = '<i class="' + iconClass + ' icon"></i>' + platform.name.slice(0, 4);
                      
                      // 添加点击事件
                      tabItem.addEventListener('click', function() {
                        document.querySelectorAll('.tab-nav-item').forEach(tab => tab.classList.remove('active'));
                        this.classList.add('active');
                        
                        const platformName = this.getAttribute('data-name');
                        displayHotListByName(platformName);
                      });
                      
                      tabNav.appendChild(tabItem);
                    });
                    
                    // 显示第一个平台的数据
                    displayHotListByName(allHotListData[0].name);
                  } else {
                    listContainer.innerHTML = '<div class="empty">暂无数据</div>';
                    tabNav.innerHTML = '<div class="empty">暂无数据</div>';
                  }
                },
                error(status, message) {
                  loadingEl.style.display = 'none';
                  listContainer.innerHTML = '<div class="error">加载失败: ' + status + ' ' + message + '</div>';
                  tabNav.innerHTML = '<div class="error">加载失败</div>';
                }
              });
            }
            
            // 显示指定名称的热榜数据
            function displayHotListByName(platformName) {
              const listContainer = document.getElementById('hot-list');
              const titleEl = document.getElementById('list-title');
              const subtitleEl = document.getElementById('list-subtitle');
              const updateTimeEl = document.getElementById('update-time');
              
              // 获取列表容器的父元素（滚动容器）并重置滚动位置
              const listScrollContainer = document.querySelector('.list-container');
              if (listScrollContainer) {
                listScrollContainer.scrollTop = 0;
              }
              
              listContainer.innerHTML = '';
              
              const platform = allHotListData.find(item => item.name === platformName);
              
              if (platform && platform.data && platform.data.length > 0) {
                titleEl.textContent = platform.name || '热门榜单';
                subtitleEl.textContent = platform.subtitle || '';
                updateTimeEl.textContent = '更新时间: ' + (platform.update_time || '');
                
                platform.data.forEach((item, index) => {
                  const li = document.createElement('li');
                  li.className = 'hot-item';
                  
                  const indexClass = index < 3 ? \`top\${index+1}\` : '';
                  
                  li.innerHTML = \`
                    <div class="hot-index \${indexClass}">\${item.index || index+1}</div>
                    <a href="\${item.url || item.mobil_url}" target="_blank" rel="noopener noreferrer">\${item.title}</a>
                  \`;
                  
                  listContainer.appendChild(li);
                });
              } else {
                listContainer.innerHTML = '<div class="empty">暂无数据</div>';
              }
            }
            
            // 页面加载完成后初始化
            document.addEventListener('DOMContentLoaded', function() {
              initTabs();
            });
            
            // 关闭按钮事件
            window.closeModal = function() {
              try {
                window.parent.document.getElementById('hot-list-modal').remove();
              } catch(e) {
                console.error('关闭弹窗失败', e);
              }
            };
            
            // 添加关闭按钮事件监听
            document.getElementById('close-btn').addEventListener('click', function() {
              window.closeModal();
            });
          </script>
        </body>
        </html>
      `;
  }

  /**
   * 显示提示消息
   * @param {string} message - 消息内容
   * @param {string} type - 消息类型
   */
  showToast(message, type = "info") {
    // 检查是否已有toast
    if (document.getElementById("hot-list-toast")) {
      document.getElementById("hot-list-toast").remove();
    }

    // 创建toast元素
    const toast = document.createElement("div");
    toast.id = "hot-list-toast";
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-md shadow-md ${
      type === "error" ? "bg-red-500" : "bg-green-500"
    } text-white`;
    toast.textContent = message;

    // 添加到DOM
    document.body.appendChild(toast);

    // 3秒后自动消失
    setTimeout(() => {
      if (document.getElementById("hot-list-toast")) {
        document.getElementById("hot-list-toast").remove();
      }
    }, 3000);
  }
}

// 导出组件
window.HotList = HotList;
