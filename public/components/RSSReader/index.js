/**
 * RSS阅读器组件
 */
class RSSReader {
  constructor() {
    this.name = "RSS阅读器";
    this.iconClass = "fa-solid fa-rss";
    this.backgroundColor = "bg-orange-500";

    // 添加新属性，用于组件库显示
    this.icon = "fa-solid  fa-rss";
    this.bgColor = "bg-orange-500";
    this.description = "RSS订阅阅读器，查看您喜爱的博客和新闻";

    // 从本地存储加载RSS源
    this.rssSources = this.loadRssSources() || {
      科技爱好者: "https://www.ruanyifeng.com/blog/atom.xml",
      BlogFinder: "https://bf.zzxworld.com/feed.xml",
    };

    // 默认RSS源
    this.currentSource = "科技爱好者";
  }

  /**
   * 从本地存储加载RSS源
   */
  loadRssSources() {
    try {
      const saved = localStorage.getItem("rss-reader-sources");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("加载RSS源失败:", e);
      return null;
    }
  }

  /**
   * 保存RSS源到本地存储
   */
  saveRssSources(sources) {
    try {
      localStorage.setItem("rss-reader-sources", JSON.stringify(sources));
    } catch (e) {
      console.error("保存RSS源失败:", e);
    }
  }

  /**
   * 获取组件HTML
   * @returns {string} 组件的HTML元素字符串
   */
  render() {
    return `
        <div class="app-container flex flex-col items-center cursor-pointer" id="rss-reader">
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
      .getElementById("rss-reader")
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
    if (document.getElementById("rss-reader-modal")) {
      document.getElementById("rss-reader-modal").remove();
    }

    // 创建弹窗容器
    const modal = document.createElement("div");
    modal.id = "rss-reader-modal";
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
      "relative bg-white rounded-lg shadow-xl w-full max-w-4xl h-full md:h-5/6 flex flex-col";

    // 创建iframe
    const iframe = document.createElement("iframe");
    iframe.id = "rss-reader-iframe";
    iframe.className = "w-full h-full flex-grow border-none";
    iframe.srcdoc = this.getIframeContent();

    // 添加到DOM
    modalContent.appendChild(iframe);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // 监听ESC键关闭
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const modal = document.getElementById("rss-reader-modal");
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
          <title>RSS阅读器</title>
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
            .header-left {
              display: flex;
              align-items: center;
              min-width: 150px;
              border-right: 1px solid #eee;
              padding-right: 15px;
              height: 28px;
            }
            .app-title {
              font-weight: bold;
              font-size: 18px;
              margin-right: 10px;
            }
            .add-btn {
              background-color: #4285f4;
              color: white;
              border: none;
              border-radius: 4px;
              padding: 4px 8px;
              font-size: 12px;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 4px;
              height: 24px;
            }
            .add-btn:hover {
              background-color: #3367d6;
            }
            .header-center {
              flex-grow: 1;
              text-align: left;
              padding-left: 15px;
              font-size: 16px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .header-right {
              display: flex;
              align-items: center;
            }
            .close-btn {
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
              color: #fd7e14;
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
              color: #fd7e14;
              background-color: #fff;
              border-left: 3px solid #fd7e14;
            }
            .tab-nav-item:hover {
              background-color: #f0f0f0;
            }
            .add-rss-btn {
              margin: 10px;
              padding: 10px;
              background-color: #fd7e14;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              text-align: center;
              font-size: 14px;
              transition: all 0.2s;
            }
            .add-rss-btn:hover {
              background-color: #e06000;
            }
            .list-container {
              flex-grow: 1;
              overflow-y: auto;
              padding: 0 15px;
              background-color: #fff;
              display: flex;
              flex-direction: column;
            }
            .rss-list {
              list-style: none;
              padding: 0;
              margin: 0;
            }
            .rss-item {
              padding: 15px 0;
              border-bottom: 1px solid #f0f0f0;
            }
            .rss-item-title {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 8px;
              color: #333;
              text-decoration: none;
              display: block;
            }
            .rss-item-title:hover {
              color: #fd7e14;
            }
            .rss-item-meta {
              display: flex;
              font-size: 12px;
              color: #666;
              margin-bottom: 8px;
            }
            .rss-item-date {
              margin-right: 15px;
            }
            .rss-item-author {
              font-style: italic;
            }
            .rss-item-content {
              font-size: 14px;
              line-height: 1.6;
              color: #555;
              margin-bottom: 10px;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 3;
              -webkit-box-orient: vertical;
            }
            .rss-item-read-more {
              font-size: 13px;
              color: #fd7e14;
              text-decoration: none;
            }
            .rss-item-read-more:hover {
              text-decoration: underline;
            }
            .loading {
              text-align: center;
              padding: 20px;
              color: #999;
            }
            .error {
              text-align: center;
              padding: 20px;
              color: #fd7e14;
            }
            .icon {
              margin-right: 8px;
            }
            .empty {
              text-align: center;
              padding: 30px;
              color: #999;
            }
            .article-view {
              padding: 20px;
              line-height: 1.6;
              overflow-y: auto;
              max-height: 100%;
              display: none;
            }
            .article-view.active {
              display: block;
            }
            .article-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .article-meta {
              font-size: 12px;
              color: #666;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 1px solid #eee;
            }
            .article-content {
              font-size: 16px;
            }
            .article-content img {
              max-width: 100%;
              height: auto;
            }
            .back-to-list {
              position: sticky;
              top: 0;
              background: white;
              padding: 10px 0;
              display: inline-block;
              margin-bottom: 15px;
              cursor: pointer;
              color: #fd7e14;
              border: none;
              background: none;
              font-size: 14px;
              text-decoration: none;
            }
            .back-to-list:hover {
              text-decoration: underline;
            }
            .modal-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-color: rgba(0,0,0,0.5);
              display: flex;
              justify-content: center;
              align-items: center;
              z-index: 1000;
            }
            .modal-content {
              background: white;
              padding: 20px;
              border-radius: 8px;
              width: 90%;
              max-width: 500px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .modal-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 15px;
            }
            .modal-title {
              font-size: 18px;
              font-weight: bold;
            }
            .modal-close {
              font-size: 20px;
              cursor: pointer;
              color: #999;
            }
            .modal-close:hover {
              color: #fd7e14;
            }
            .form-group {
              margin-bottom: 15px;
            }
            .form-label {
              display: block;
              margin-bottom: 5px;
              font-weight: 500;
            }
            .form-input {
              width: 100%;
              padding: 8px 10px;
              border: 1px solid #ddd;
              border-radius: 4px;
              font-size: 14px;
            }
            .form-input:focus {
              border-color: #fd7e14;
              outline: none;
            }
            .form-submit {
              padding: 8px 16px;
              background-color: #fd7e14;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
              transition: all 0.2s;
            }
            .form-submit:hover {
              background-color: #e06000;
            }
            .form-error {
              color: #e53e3e;
              font-size: 14px;
              margin-top: 5px;
            }
            .delete-source {
              color: #e53e3e;
              margin-left: 10px;
              cursor: pointer;
              font-size: 12px;
              visibility: hidden;
            }
            .tab-nav-item:hover .delete-source {
              visibility: visible;
            }
          </style>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="header-left">
                <span class="app-title">RSS阅读器</span>
                <button class="add-btn" id="add-rss-btn">
                  <i class="fas fa-plus"></i> 添加
                </button>
              </div>
              <div class="header-center" id="current-feed-title">
                <!-- 当前RSS源标题 -->
              </div>
              <div class="header-right">
                <div class="close-btn" id="close-btn">
                  <i class="fas fa-times"></i>
                </div>
              </div>
            </div>
            
            <div class="content-container">
              <div class="tab-nav" id="tab-nav">
                <!-- RSS源将在这里显示 -->
              </div>
              
              <div class="list-container" id="main-container">
                <div class="loading" id="loading">正在加载...</div>
                <ul class="rss-list" id="rss-list"></ul>
                <div class="article-view" id="article-view">
                  <a href="#" class="back-to-list" id="back-to-list"><i class="fas fa-arrow-left icon"></i>返回列表</a>
                  <div class="article-title" id="article-title"></div>
                  <div class="article-meta" id="article-meta"></div>
                  <div class="article-content" id="article-content"></div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 添加RSS源弹窗 -->
          <div class="modal-overlay" id="add-rss-modal" style="display: none;">
            <div class="modal-content">
              <div class="modal-header">
                <div class="modal-title">添加RSS源</div>
                <div class="modal-close" id="modal-close">&times;</div>
              </div>
              <form id="add-rss-form">
                <div class="form-group">
                  <label class="form-label">源名称</label>
                  <input type="text" class="form-input" id="source-name" placeholder="例如：科技爱好者" required>
                </div>
                <div class="form-group">
                  <label class="form-label">RSS链接</label>
                  <input type="url" class="form-input" id="source-url" placeholder="例如：https://example.com/feed.xml" required>
                </div>
                <div class="form-error" id="form-error" style="display: none;"></div>
                <button type="submit" class="form-submit">添加</button>
              </form>
            </div>
          </div>
          
          <script>
            // 从本地存储加载RSS源
            function loadRssSources() {
              try {
                const saved = localStorage.getItem("rss-reader-sources");
                return saved ? JSON.parse(saved) : null;
              } catch (e) {
                console.error("加载RSS源失败:", e);
                return null;
              }
            }
            
            // 保存RSS源到本地存储
            function saveRssSources(sources) {
              try {
                localStorage.setItem("rss-reader-sources", JSON.stringify(sources));
              } catch (e) {
                console.error("保存RSS源失败:", e);
              }
            }
            
            // RSS源配置
            const RSS_SOURCES = loadRssSources() || {
              "科技爱好者": "https://www.ruanyifeng.com/blog/atom.xml",
              "BlogFinder": "https://bf.zzxworld.com/feed.xml",
            };
            
            // 当前选中的RSS源
            let currentSource = "科技爱好者";
            
            // 存储RSS数据
            let rssData = {};
            
            // 当前查看的文章
            let currentArticle = null;
            
            // 初始化页面
            function init() {
              // 生成RSS源菜单
              generateSourceMenu();
              
              // 绑定事件
              document.getElementById('back-to-list').addEventListener('click', backToList);
              document.getElementById('add-rss-btn').addEventListener('click', showAddRssModal);
              document.getElementById('modal-close').addEventListener('click', hideAddRssModal);
              document.getElementById('add-rss-form').addEventListener('submit', handleAddRssSubmit);
              
              // 默认加载第一个RSS源
              if (Object.keys(RSS_SOURCES).length > 0) {
                loadRSS(Object.keys(RSS_SOURCES)[0]);
              } else {
                // 没有任何RSS源
                const listContainer = document.getElementById('rss-list');
                const loadingEl = document.getElementById('loading');
                loadingEl.style.display = 'none';
                listContainer.innerHTML = '<div class="empty">暂无RSS源，请添加</div>';
              }
            }
            
            // 生成RSS源菜单
            function generateSourceMenu() {
              const tabNav = document.getElementById('tab-nav');
              // 清空现有内容
              tabNav.innerHTML = '';
              
              Object.keys(RSS_SOURCES).forEach((sourceName, index) => {
                const tabItem = document.createElement('div');
                tabItem.className = 'tab-nav-item' + (index === 0 ? ' active' : '');
                tabItem.setAttribute('data-source', sourceName);
                
                tabItem.innerHTML = '<i class="fas fa-rss icon"></i>' + sourceName + 
                                    '<span class="delete-source" data-source="' + sourceName + '"><i class="fas fa-trash"></i></span>';
                
                // 添加点击事件
                tabItem.addEventListener('click', function(e) {
                  // 检查是否点击了删除按钮
                  if (e.target.closest('.delete-source')) {
                    e.stopPropagation();
                    const sourceName = e.target.closest('.delete-source').getAttribute('data-source');
                    deleteRssSource(sourceName);
                    return;
                  }
                  
                  document.querySelectorAll('.tab-nav-item').forEach(tab => tab.classList.remove('active'));
                  this.classList.add('active');
                  
                  const sourceName = this.getAttribute('data-source');
                  loadRSS(sourceName);
                });
                
                tabNav.appendChild(tabItem);
              });
            }
            
            // 显示添加RSS源弹窗
            function showAddRssModal() {
              document.getElementById('add-rss-modal').style.display = 'flex';
              document.getElementById('source-name').focus();
              // 清空表单
              document.getElementById('add-rss-form').reset();
              document.getElementById('form-error').style.display = 'none';
            }
            
            // 隐藏添加RSS源弹窗
            function hideAddRssModal() {
              document.getElementById('add-rss-modal').style.display = 'none';
            }
            
            // 处理添加RSS源表单提交
            function handleAddRssSubmit(e) {
              e.preventDefault();
              
              const nameInput = document.getElementById('source-name');
              const urlInput = document.getElementById('source-url');
              const errorEl = document.getElementById('form-error');
              
              const name = nameInput.value.trim();
              const url = urlInput.value.trim();
              
              // 验证输入
              if (!name || !url) {
                errorEl.textContent = '请填写完整信息';
                errorEl.style.display = 'block';
                return;
              }
              
              // 检查名称是否已存在
              if (RSS_SOURCES[name]) {
                errorEl.textContent = '该名称已存在';
                errorEl.style.display = 'block';
                return;
              }
              
              // 验证URL是否有效
              try {
                new URL(url);
              } catch (e) {
                errorEl.textContent = '请输入有效的URL';
                errorEl.style.display = 'block';
                return;
              }
              
              // 尝试加载RSS源以验证有效性
              const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url);
              
              errorEl.textContent = '正在验证RSS源...';
              errorEl.style.display = 'block';
              
              fetch(proxyUrl)
                .then(response => response.text())
                .then(str => {
                  const parser = new DOMParser();
                  const xmlDoc = parser.parseFromString(str, 'text/xml');
                  
                  // 检查是否是有效的RSS/Atom
                  const isRss = xmlDoc.querySelector('rss, feed') !== null;
                  
                  if (!isRss) {
                    throw new Error('提供的URL不是有效的RSS或Atom格式');
                  }
                  
                  // 添加RSS源
                  RSS_SOURCES[name] = url;
                  saveRssSources(RSS_SOURCES);
                  
                  // 重新生成菜单
                  generateSourceMenu();
                  
                  // 加载新添加的源
                  loadRSS(name);
                  
                  // 关闭弹窗
                  hideAddRssModal();
                })
                .catch(error => {
                  errorEl.textContent = '验证失败: ' + error.message;
                  errorEl.style.display = 'block';
                });
            }
            
            // 删除RSS源
            function deleteRssSource(sourceName) {
              if (!confirm(\`确定要删除 "\${sourceName}" 吗？\`)) {
                return;
              }
              
              // 从源列表中删除
              delete RSS_SOURCES[sourceName];
              saveRssSources(RSS_SOURCES);
              
              // 如果删除的是当前源，加载第一个源
              if (currentSource === sourceName) {
                const sources = Object.keys(RSS_SOURCES);
                if (sources.length > 0) {
                  currentSource = sources[0];
                  loadRSS(currentSource);
                } else {
                  // 没有源了
                  const listContainer = document.getElementById('rss-list');
                  const loadingEl = document.getElementById('loading');
                  const currentFeedTitle = document.getElementById('current-feed-title');
                  
                  loadingEl.style.display = 'none';
                  listContainer.innerHTML = '<div class="empty">暂无RSS源，请添加</div>';
                  currentFeedTitle.textContent = '';
                }
              }
              
              // 重新生成菜单
              generateSourceMenu();
            }
            
            // 加载RSS
            function loadRSS(sourceName) {
              currentSource = sourceName;
              
              const listContainer = document.getElementById('rss-list');
              const loadingEl = document.getElementById('loading');
              const articleView = document.getElementById('article-view');
              const currentFeedTitle = document.getElementById('current-feed-title');
              
              // 显示加载状态
              listContainer.innerHTML = '';
              loadingEl.style.display = 'block';
              articleView.classList.remove('active');
              
              // 更新当前RSS源标题
              currentFeedTitle.textContent = sourceName || '';
              
              // 如果已经有缓存数据，直接显示
              if (rssData[sourceName]) {
                displayRSS(rssData[sourceName]);
                return;
              }
              
              // 使用CORS代理获取RSS数据
              const rssUrl = RSS_SOURCES[sourceName];
              const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(rssUrl);
              
              fetch(proxyUrl)
                .then(response => response.text())
                .then(str => {
                  const parser = new DOMParser();
                  const xmlDoc = parser.parseFromString(str, 'text/xml');
                  
                  // 解析RSS/Atom格式
                  const data = parseXML(xmlDoc);
                  
                  // 缓存数据
                  rssData[sourceName] = data;
                  
                  // 显示数据
                  displayRSS(data);
                })
                .catch(error => {
                  loadingEl.style.display = 'none';
                  listContainer.innerHTML = \`<div class="error">加载失败: \${error.message}</div>\`;
                });
            }
            
            // 解析XML (支持RSS和Atom)
            function parseXML(xmlDoc) {
              let feedTitle, feedLink, feedDesc, feedUpdateTime;
              let entries = [];
              
              // 检查是RSS还是Atom
              const isAtom = xmlDoc.querySelector('feed') !== null;
              
              if (isAtom) {
                // Atom格式解析
                const feed = xmlDoc.querySelector('feed');
                feedTitle = feed.querySelector('title')?.textContent || '';
                feedLink = feed.querySelector('link[rel="alternate"]')?.getAttribute('href') || 
                           feed.querySelector('link')?.getAttribute('href') || '';
                feedDesc = feed.querySelector('subtitle')?.textContent || '';
                feedUpdateTime = feed.querySelector('updated')?.textContent || '';
                
                // 解析条目
                const items = feed.querySelectorAll('entry');
                items.forEach(item => {
                  const title = item.querySelector('title')?.textContent || '';
                  const link = item.querySelector('link[rel="alternate"]')?.getAttribute('href') || 
                              item.querySelector('link')?.getAttribute('href') || '';
                  const pubDate = item.querySelector('published')?.textContent || 
                                  item.querySelector('updated')?.textContent || '';
                  const author = item.querySelector('author > name')?.textContent || '';
                  const content = item.querySelector('content')?.textContent || 
                                  item.querySelector('summary')?.textContent || '';
                  
                  entries.push({
                    title,
                    link,
                    pubDate,
                    author,
                    content,
                    id: entries.length
                  });
                });
              } else {
                // RSS格式解析
                const channel = xmlDoc.querySelector('channel');
                feedTitle = channel.querySelector('title')?.textContent || '';
                feedLink = channel.querySelector('link')?.textContent || '';
                feedDesc = channel.querySelector('description')?.textContent || '';
                feedUpdateTime = channel.querySelector('lastBuildDate')?.textContent || '';
                
                // 解析条目
                const items = channel.querySelectorAll('item');
                items.forEach(item => {
                  const title = item.querySelector('title')?.textContent || '';
                  const link = item.querySelector('link')?.textContent || '';
                  const pubDate = item.querySelector('pubDate')?.textContent || '';
                  const author = item.querySelector('author')?.textContent || 
                                item.querySelector('dc\\:creator')?.textContent || '';
                  const content = item.querySelector('content\\:encoded')?.textContent || 
                                  item.querySelector('description')?.textContent || '';
                  
                  entries.push({
                    title,
                    link,
                    pubDate,
                    author,
                    content,
                    id: entries.length
                  });
                });
              }
              
              return {
                title: feedTitle,
                link: feedLink,
                description: feedDesc,
                updateTime: formatDate(feedUpdateTime),
                entries
              };
            }
            
            // 显示RSS数据
            function displayRSS(data) {
              const listContainer = document.getElementById('rss-list');
              const loadingEl = document.getElementById('loading');
              const currentFeedTitle = document.getElementById('current-feed-title');
              
              // 隐藏加载状态
              loadingEl.style.display = 'none';
              
              // 更新标题和描述
              currentFeedTitle.textContent = data.title || currentSource;
              
              // 清空列表
              listContainer.innerHTML = '';
              
              if (data.entries && data.entries.length > 0) {
                // 显示文章列表
                data.entries.forEach(item => {
                  const li = document.createElement('li');
                  li.className = 'rss-item';
                  li.setAttribute('data-id', item.id);
                  
                  // 格式化日期
                  const formattedDate = formatDate(item.pubDate);
                  
                  // 提取内容摘要（去除HTML标签）
                  let contentSummary = item.content.replace(/<[^>]*>/g, '').trim();
                  if (contentSummary.length > 150) {
                    contentSummary = contentSummary.substr(0, 150) + '...';
                  }
                  
                  li.innerHTML = \`
                    <a href="\${item.link}" target="_blank" class="rss-item-title">\${item.title}</a>
                    <div class="rss-item-meta">
                      <span class="rss-item-date">\${formattedDate}</span>
                      \${item.author ? \`<span class="rss-item-author">作者: \${item.author}</span>\` : ''}
                    </div>
                    <div class="rss-item-content">\${contentSummary}</div>
                    <a href="#" class="rss-item-read-more">阅读全文</a>
                  \`;
                  
                  // 添加"阅读全文"点击事件
                  const readMoreLink = li.querySelector('.rss-item-read-more');
                  readMoreLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    const id = parseInt(li.getAttribute('data-id'));
                    viewArticle(id);
                  });
                  
                  listContainer.appendChild(li);
                });
              } else {
                listContainer.innerHTML = '<div class="empty">暂无数据</div>';
              }
            }
            
            // 查看文章详情
            function viewArticle(id) {
              const articleView = document.getElementById('article-view');
              const articleTitle = document.getElementById('article-title');
              const articleMeta = document.getElementById('article-meta');
              const articleContent = document.getElementById('article-content');
              const rssList = document.getElementById('rss-list');
              
              // 获取文章数据
              const article = rssData[currentSource].entries[id];
              currentArticle = article;
              
              // 更新文章内容
              articleTitle.textContent = article.title;
              
              // 格式化日期
              const formattedDate = formatDate(article.pubDate);
              
              articleMeta.innerHTML = \`
                <span class="rss-item-date">\${formattedDate}</span>
                \${article.author ? \`<span class="rss-item-author">作者: \${article.author}</span>\` : ''}
                \${article.link ? \`<a href="\${article.link}" target="_blank" style="margin-left: 15px;">原文链接</a>\` : ''}
              \`;
              
              // 显示内容
              articleContent.innerHTML = article.content;
              
              // 处理文章中的图片链接问题
              const images = articleContent.querySelectorAll('img');
              images.forEach(img => {
                // 检查图片URL是否为相对路径，如果是则转为绝对路径
                if (img.src && !img.src.startsWith('http')) {
                  const baseUrl = new URL(article.link).origin;
                  img.src = new URL(img.src, baseUrl).href;
                }
              });
              
              // 处理链接，让所有链接在新标签页打开
              const links = articleContent.querySelectorAll('a');
              links.forEach(link => {
                link.setAttribute('target', '_blank');
              });
              
              // 显示文章视图
              rssList.style.display = 'none';
              articleView.classList.add('active');
            }
            
            // 返回列表
            function backToList(e) {
              e.preventDefault();
              
              const articleView = document.getElementById('article-view');
              const rssList = document.getElementById('rss-list');
              
              articleView.classList.remove('active');
              rssList.style.display = 'block';
              
              currentArticle = null;
            }
            
            // 格式化日期
            function formatDate(dateString) {
              if (!dateString) return '';
              
              try {
                const date = new Date(dateString);
                return date.toLocaleString('zh-CN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                });
              } catch (e) {
                return dateString;
              }
            }
            
            // 页面加载完成后初始化
            document.addEventListener('DOMContentLoaded', function() {
              init();
            });
            
            // 关闭按钮事件
            window.closeModal = function() {
              try {
                window.parent.document.getElementById('rss-reader-modal').remove();
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
    if (document.getElementById("rss-reader-toast")) {
      document.getElementById("rss-reader-toast").remove();
    }

    // 创建toast元素
    const toast = document.createElement("div");
    toast.id = "rss-reader-toast";
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-md shadow-md ${
      type === "error" ? "bg-red-500" : "bg-green-500"
    } text-white`;
    toast.textContent = message;

    // 添加到DOM
    document.body.appendChild(toast);

    // 3秒后自动消失
    setTimeout(() => {
      if (document.getElementById("rss-reader-toast")) {
        document.getElementById("rss-reader-toast").remove();
      }
    }, 3000);
  }
}

// 导出组件
window.RSSReader = RSSReader;
