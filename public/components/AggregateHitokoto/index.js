/**
 * 聚合一言组件
 */
class AggregateHitokoto {
  constructor() {
    this.name = "聚合一言";
    this.iconClass = "fa-solid fa-quote-left";
    this.backgroundColor = "bg-indigo-500";

    // 添加新属性，用于组件库显示
    this.icon = "fa-solid fa-quote-left";
    this.bgColor = "bg-indigo-500";
    this.description = "显示各种类型的一言句子";

    // 一言类型配置
    this.hitokotoTypes = [
      { id: "hitokoto", name: "一言", icon: "fa-solid fa-quote-left" },
      { id: "duanzi", name: "段子", icon: "fa-solid fa-face-laugh-squint" },
      { id: "fabing", name: "发病文学", icon: "fa-solid fa-heart-crack" },
      { id: "answer", name: "答案之书", icon: "fa-solid fa-book" },
      { id: "kfc", name: "KFC V50", icon: "fa-solid fa-drumstick-bite" },
      { id: "poetry", name: "古诗词", icon: "fa-solid fa-scroll" },
      { id: "ipartment", name: "爱情公寓", icon: "fa-solid fa-heart" },
    ];

    // 默认一言类型
    this.currentType = "hitokoto";

    // 保存当前内容
    this.currentContent = "";
  }

  /**
   * 获取组件HTML
   * @returns {string} 组件的HTML元素字符串
   */
  render() {
    return `
        <div class="app-container flex flex-col items-center cursor-pointer" id="aggregate-hitokoto">
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
      .getElementById("aggregate-hitokoto")
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
    if (document.getElementById("aggregate-hitokoto-modal")) {
      document.getElementById("aggregate-hitokoto-modal").remove();
    }

    // 创建弹窗容器
    const modal = document.createElement("div");
    modal.id = "aggregate-hitokoto-modal";
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
    iframe.id = "aggregate-hitokoto-iframe";
    iframe.className = "w-full h-full flex-grow border-none";
    iframe.srcdoc = this.getIframeContent();

    // 添加到DOM
    modalContent.appendChild(iframe);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // 监听ESC键关闭
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const modal = document.getElementById("aggregate-hitokoto-modal");
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
          <title>聚合一言</title>
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
              color: #6366f1;
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
              color: #6366f1;
              background-color: #fff;
              border-left: 3px solid #6366f1;
            }
            .tab-nav-item:hover {
              background-color: #f0f0f0;
            }
            .tab-nav-item i {
              margin-right: 8px;
              width: 16px;
              text-align: center;
            }
            .content-area {
              flex-grow: 1;
              display: flex;
              flex-direction: column;
              padding: 20px;
              overflow-y: auto;
              background-color: #fff;
            }
            .hitokoto-content {
              flex-grow: 1;
              padding: 20px;
              background-color: #f9f9f9;
              border-radius: 8px;
              margin-bottom: 20px;
              font-size: 18px;
              line-height: 1.6;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              min-height: 200px;
            }
            .action-buttons {
              display: flex;
              justify-content: center;
            }
            .refresh-btn {
              background-color: #6366f1;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 16px;
              display: flex;
              align-items: center;
              transition: background-color 0.3s;
            }
            .refresh-btn:hover {
              background-color: #4f46e5;
            }
            .refresh-btn i {
              margin-right: 8px;
            }
            .spinner {
              display: inline-block;
              width: 20px;
              height: 20px;
              border: 3px solid rgba(255,255,255,.3);
              border-radius: 50%;
              border-top-color: #fff;
              animation: spin 1s ease-in-out infinite;
              margin-right: 8px;
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            .toast {
              position: fixed;
              bottom: 20px;
              left: 50%;
              transform: translateX(-50%);
              background-color: rgba(0, 0, 0, 0.8);
              color: white;
              padding: 10px 20px;
              border-radius: 4px;
              font-size: 14px;
              opacity: 0;
              transition: opacity 0.3s;
              z-index: 1000;
            }
            .toast.show {
              opacity: 1;
            }
            .hitokoto-result-container {
              flex-grow: 1;
              display: flex;
              flex-direction: column;
            }
          </style>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div>
                <span class="title">聚合一言</span>
                <span class="subtitle" id="current-type-text">一言</span>
              </div>
              <span class="update-time" id="update-time"></span>
              <div class="close-btn" id="close-btn">&times;</div>
            </div>
            <div class="content-container">
              <div class="tab-nav" id="tab-nav"></div>
              <div class="content-area">
                <div class="hitokoto-result-container">
                  <div class="hitokoto-content" id="hitokoto-content">
                    正在加载...
                  </div>
                  <div class="action-buttons">
                    <button class="refresh-btn" id="refresh-btn">
                      <i class="fas fa-sync-alt"></i> 再来一条
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="toast" id="toast"></div>

          <script>
            const hitokotoTypes = ${JSON.stringify(this.hitokotoTypes)};
            let currentType = "${this.currentType}";
            let isLoading = false;
            
            // 更新类型文本
            function updateTypeText() {
              const currentTypeObj = hitokotoTypes.find(t => t.id === currentType);
              if (currentTypeObj) {
                document.getElementById('current-type-text').textContent = currentTypeObj.name;
              }
            }
            
            // 初始化类型标签
            function initTabs() {
              const tabNav = document.getElementById('tab-nav');
              tabNav.innerHTML = '';
              
              hitokotoTypes.forEach(type => {
                const tab = document.createElement('div');
                tab.className = 'tab-nav-item' + (type.id === currentType ? ' active' : '');
                tab.innerHTML = \`<i class="\${type.icon}"></i>\${type.name}\`;
                tab.addEventListener('click', () => {
                  if (currentType === type.id) return;
                  
                  // 更新活跃标签
                  document.querySelectorAll('.tab-nav-item').forEach(t => t.classList.remove('active'));
                  tab.classList.add('active');
                  
                  // 更新当前类型
                  currentType = type.id;
                  updateTypeText();
                  
                  // 获取数据
                  fetchHitokoto();
                });
                
                tabNav.appendChild(tab);
              });
            }
            
            // 获取一言数据
            async function fetchHitokoto() {
              if (isLoading) return;
              
              isLoading = true;
              const content = document.getElementById('hitokoto-content');
              const refreshBtn = document.getElementById('refresh-btn');
              
              // 更新按钮状态
              refreshBtn.innerHTML = '<span class="spinner"></span> 加载中...';
              refreshBtn.disabled = true;
              
              try {
                let apiUrl = '';
                // 区分古诗词API和其他类型的API
                if (currentType === 'poetry') {
                  apiUrl = 'https://oiapi.net/API/Sentences';
                } else if (currentType === 'ipartment') {
                  apiUrl = 'https://oiapi.net/API/iPartmentWord';
                } else {
                  apiUrl = \`https://60s-api.viki.moe/v2/\${currentType}\`;
                }
                const response = await fetch(apiUrl);
                
                if (!response.ok) {
                  throw new Error('网络响应不正确');
                }
                
                const data = await response.json();
                
                // 根据不同类型获取对应内容
                let resultText = '';
                
                if (currentType === 'poetry') {
                  // 古诗词API已单独处理，直接使用response
                  if (data.code === 1 && data.data && data.data.content) {
                    // 只使用content字段
                    resultText = data.data.content;
                  } else {
                    resultText = '获取数据失败';
                  }
                } else if (currentType === 'ipartment') {
                  // 爱情公寓语录API处理
                  if (data.code === 1 && data.message) {
                    resultText = data.message;
                  } else {
                    resultText = '获取数据失败';
                  }
                } else if (currentType === 'hitokoto' && data.data.hitokoto) {
                  resultText = data.data.hitokoto;
                } else if (currentType === 'duanzi' && data.data.duanzi) {
                  resultText = data.data.duanzi;
                } else if (currentType === 'fabing' && data.data.saying) {
                  resultText = data.data.saying;
                } else if (currentType === 'answer' && data.data.answer) {
                  resultText = data.data.answer;
                } else if (currentType === 'kfc' && data.data.kfc) {
                  resultText = data.data.kfc;
                } else {
                  resultText = '获取内容失败';
                }
                
                // 更新内容
                content.textContent = resultText;
                
                // 更新时间
                updateTime();
              } catch (error) {
                console.error('获取一言数据出错:', error);
                content.textContent = '获取数据失败，请稍后再试...';
                showToast('获取数据失败，请稍后再试');
              } finally {
                // 恢复按钮状态
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> 再来一条';
                refreshBtn.disabled = false;
                isLoading = false;
              }
            }
            
            // 更新时间
            function updateTime() {
              const now = new Date();
              const hours = now.getHours().toString().padStart(2, '0');
              const minutes = now.getMinutes().toString().padStart(2, '0');
              const seconds = now.getSeconds().toString().padStart(2, '0');
              document.getElementById('update-time').textContent = \`更新时间: \${hours}:\${minutes}:\${seconds}\`;
            }
            
            // 显示提示信息
            function showToast(message, duration = 3000) {
              const toast = document.getElementById('toast');
              toast.textContent = message;
              toast.classList.add('show');
              
              setTimeout(() => {
                toast.classList.remove('show');
              }, duration);
            }
            
            // 初始化页面
            document.addEventListener('DOMContentLoaded', () => {
              // 初始化类型标签
              initTabs();
              
              // 更新类型文本
              updateTypeText();
              
              // 获取初始数据
              fetchHitokoto();
              
              // 刷新按钮点击事件
              document.getElementById('refresh-btn').addEventListener('click', fetchHitokoto);
              
              // 关闭按钮点击事件
              document.getElementById('close-btn').addEventListener('click', () => {
                window.parent.document.getElementById('aggregate-hitokoto-modal').remove();
              });
            });
          </script>
        </body>
        </html>
    `;
  }
}

// 如果在浏览器环境，将类导出
if (typeof window !== "undefined") {
  window.AggregateHitokoto = AggregateHitokoto;
}
