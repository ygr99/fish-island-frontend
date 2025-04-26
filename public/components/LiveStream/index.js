/**
 * 直播视界组件
 */
class LiveStream {
  constructor() {
    this.name = "直播视界";
    this.iconClass = "fa-solid fa-tv";
    this.backgroundColor = "bg-purple-500";

    // 添加新属性，用于组件库显示
    this.icon = "fa-solid fa-tv";
    this.bgColor = "bg-purple-500";
    this.description = "查看您喜爱的直播平台主播";

    // 平台映射配置
    this.platformConfig = {
      douyu: {
        name: "斗鱼",
        color: "#ff5d23",
        urlTemplate: "https://www.douyu.com/{roomId}",
        liveStatusField: "data.room_status",
        liveStatusValue: "1",
        coverField: "data.room_thumb",
        avatarField: "data.avatar",
        nameField: "data.owner_name",
        categoryField: "data.cate_name",
        hotField: "data.hn",
      },
      bilibili: {
        name: "B站",
        color: "#23ade5",
        urlTemplate: "https://live.bilibili.com/{roomId}",
        liveStatusField: "data.live_status",
        liveStatusValue: 1,
        coverField: "data.keyframe",
        avatarField: "user.face",
        nameField: "user.name",
        categoryField: "data.area_name",
        hotField: "data.online",
      },
      douyin: {
        name: "抖音",
        color: "#fe2c55",
        urlTemplate: "https://live.douyin.com/{roomId}",
        liveStatusField: "data.data[0].status",
        liveStatusValue: 2,
        coverField: "data.data[0].cover.url_list[0]",
        avatarField: "data.user.avatar_thumb.url_list[0]",
        nameField: "data.user.nickname",
        categoryField: "data.data[0].title",
        hotField: "data.data[0].user_count_str",
      },
    };

    // 从本地存储加载直播源
    this.liveStreams = this.loadLiveStreams() || [
      {
        platform: "douyu",
        roomId: "9690322",
        name: "大聪明小小芳",
        tags: ["游戏", "PUBG"],
        customName: "",
      },
      {
        platform: "bilibili",
        roomId: "32447141",
        name: "编程导航",
        tags: ["面试", "编程"],
        customName: "",
      },
      {
        platform: "douyin",
        roomId: "659712903300",
        name: "AI代码侠土豆",
        tags: ["直播", "测试"],
        customName: "",
      },
    ];

    // 状态管理
    this.liveStreamData = new Map(); // 缓存直播数据
    this.currentFilter = { platform: "all", tag: "all" }; // 当前筛选条件
  }

  /**
   * 从本地存储加载直播源
   */
  loadLiveStreams() {
    try {
      const saved = localStorage.getItem("livestream-sources");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("加载直播源失败:", e);
      return null;
    }
  }

  /**
   * 保存直播源到本地存储
   */
  saveLiveStreams() {
    try {
      localStorage.setItem(
        "livestream-sources",
        JSON.stringify(this.liveStreams)
      );
    } catch (e) {
      console.error("保存直播源失败:", e);
    }
  }

  /**
   * 获取所有标签
   */
  getAllTags() {
    const tagSet = new Set();
    this.liveStreams.forEach((stream) => {
      if (stream.tags && Array.isArray(stream.tags)) {
        stream.tags.forEach((tag) => tagSet.add(tag));
      }
    });
    return Array.from(tagSet);
  }

  /**
   * 获取组件HTML
   * @returns {string} 组件的HTML元素字符串
   */
  render() {
    return `
      <div class="app-container flex flex-col items-center cursor-pointer" id="livestream-component">
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
      .getElementById("livestream-component")
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
    if (document.getElementById("livestream-modal")) {
      document.getElementById("livestream-modal").remove();
    }

    // 创建弹窗容器
    const modal = document.createElement("div");
    modal.id = "livestream-modal";
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
    iframe.id = "livestream-iframe";
    iframe.className = "w-full h-full flex-grow border-none";
    iframe.srcdoc = this.getIframeContent();

    // 添加到DOM
    modalContent.appendChild(iframe);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // iframe加载完成后初始化数据
    iframe.onload = () => {
      this.initIframeEvents();
      this.loadStreamData();
    };

    // 监听ESC键关闭
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const modal = document.getElementById("livestream-modal");
        if (modal) modal.remove();
      }
    });
  }

  /**
   * 初始化iframe内事件
   */
  initIframeEvents() {
    const iframe = document.getElementById("livestream-iframe");
    const iframeDocument =
      iframe.contentDocument || iframe.contentWindow.document;

    // 关闭按钮
    const closeBtn = iframeDocument.getElementById("close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        document.getElementById("livestream-modal").remove();
      });
    }

    // 添加直播按钮
    const addBtn = iframeDocument.getElementById("add-btn");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        this.showAddStreamForm(iframeDocument);
      });
    }

    // 平台筛选按钮
    const platformBtns = iframeDocument.querySelectorAll(".platform-btn");
    platformBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        // 移除所有按钮的激活状态
        platformBtns.forEach((b) =>
          b.classList.remove("bg-custom", "text-white")
        );
        // 添加当前按钮的激活状态
        btn.classList.add("bg-custom", "text-white");

        // 设置当前平台筛选
        this.currentFilter.platform = btn.dataset.platform;
        this.renderStreamList(iframeDocument);
      });
    });

    // 标签筛选按钮
    this.renderTagButtons(iframeDocument);
  }

  /**
   * 渲染标签按钮
   */
  renderTagButtons(doc) {
    const tagsContainer = doc.getElementById("tags-container");
    if (!tagsContainer) return;

    // 清空现有标签
    tagsContainer.innerHTML = `
      <button class="px-4 py-1 text-blue-500 border-b-2 border-blue-500 tag-btn active" data-tag="all">
        全部
      </button>
    `;

    // 获取所有标签并添加
    const allTags = this.getAllTags();
    allTags.forEach((tag) => {
      const tagBtn = document.createElement("button");
      tagBtn.className = "px-4 py-1 text-gray-500 hover:text-custom tag-btn";
      tagBtn.dataset.tag = tag;
      tagBtn.textContent = tag;
      tagsContainer.appendChild(tagBtn);

      // 添加点击事件
      tagBtn.addEventListener("click", () => {
        // 移除所有标签按钮的激活状态
        doc.querySelectorAll(".tag-btn").forEach((b) => {
          b.classList.remove(
            "text-blue-500",
            "border-b-2",
            "border-blue-500",
            "active"
          );
          b.classList.add("text-gray-500");
        });

        // 添加当前标签按钮的激活状态
        tagBtn.classList.remove("text-gray-500");
        tagBtn.classList.add(
          "text-blue-500",
          "border-b-2",
          "border-blue-500",
          "active"
        );

        // 设置当前标签筛选
        this.currentFilter.tag = tag;
        this.renderStreamList(doc);
      });
    });

    // 全部标签按钮点击事件
    const allTagBtn = doc.querySelector('.tag-btn[data-tag="all"]');
    if (allTagBtn) {
      allTagBtn.addEventListener("click", () => {
        doc.querySelectorAll(".tag-btn").forEach((b) => {
          b.classList.remove(
            "text-blue-500",
            "border-b-2",
            "border-blue-500",
            "active"
          );
          b.classList.add("text-gray-500");
        });

        allTagBtn.classList.remove("text-gray-500");
        allTagBtn.classList.add(
          "text-blue-500",
          "border-b-2",
          "border-blue-500",
          "active"
        );

        this.currentFilter.tag = "all";
        this.renderStreamList(doc);
      });
    }
  }

  /**
   * 加载直播数据
   */
  async loadStreamData() {
    const iframe = document.getElementById("livestream-iframe");
    const iframeDocument =
      iframe.contentDocument || iframe.contentWindow.document;

    const loadingEl = iframeDocument.getElementById("loading-indicator");
    if (loadingEl) loadingEl.classList.remove("hidden");

    // 重置直播数据
    this.liveStreamData.clear();

    // 逐个加载直播数据
    const promises = this.liveStreams.map(async (stream) => {
      try {
        const data = await this.fetchStreamData(stream.platform, stream.roomId);
        this.liveStreamData.set(`${stream.platform}-${stream.roomId}`, data);
      } catch (error) {
        console.error(
          `加载直播数据失败: ${stream.platform}-${stream.roomId}`,
          error
        );
      }
    });

    await Promise.all(promises);

    if (loadingEl) loadingEl.classList.add("hidden");

    // 渲染直播列表
    this.renderStreamList(iframeDocument);
    // 更新直播统计
    this.updateLiveCount(iframeDocument);
  }

  /**
   * 获取直播数据
   */
  async fetchStreamData(platform, roomId) {
    const response = await fetch(`/api/livestream/${platform}/${roomId}`);
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();

    // 如果是B站，额外获取用户信息
    if (platform === "bilibili" && data && data.data && data.data.uid) {
      const userResponse = await fetch(
        `/api/livestream/bilibili/user/${data.data.uid}`
      );
      if (userResponse.ok) {
        const userData = await userResponse.json();
        return { ...data, user: userData.data.info };
      }
    }

    return data;
  }

  /**
   * 渲染直播列表
   */
  renderStreamList(doc) {
    const container = doc.getElementById("anchor-list");
    if (!container) return;

    // 清空列表
    container.innerHTML = "";

    // 筛选直播源
    const filteredStreams = this.liveStreams.filter((stream) => {
      // 平台筛选
      if (
        this.currentFilter.platform !== "all" &&
        stream.platform !== this.currentFilter.platform
      ) {
        return false;
      }

      // 标签筛选
      if (
        this.currentFilter.tag !== "all" &&
        (!stream.tags || !stream.tags.includes(this.currentFilter.tag))
      ) {
        return false;
      }

      return true;
    });

    // 无结果提示
    if (filteredStreams.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-10 text-gray-500">
          没有找到符合条件的直播间
        </div>
      `;
      return;
    }

    // 对直播间进行排序，使直播中的排在前面
    const sortedStreams = [...filteredStreams].sort((a, b) => {
      const dataA = this.liveStreamData.get(`${a.platform}-${a.roomId}`);
      const dataB = this.liveStreamData.get(`${b.platform}-${b.roomId}`);

      // 如果没有数据，则排在后面
      if (!dataA) return 1;
      if (!dataB) return -1;

      const platformConfigA = this.platformConfig[a.platform];
      const platformConfigB = this.platformConfig[b.platform];

      const liveStatusA = this.getValueFromPath(
        dataA,
        platformConfigA.liveStatusField
      );
      const liveStatusB = this.getValueFromPath(
        dataB,
        platformConfigB.liveStatusField
      );

      const isLiveA = liveStatusA == platformConfigA.liveStatusValue;
      const isLiveB = liveStatusB == platformConfigB.liveStatusValue;

      // 直播中的排在前面
      if (isLiveA && !isLiveB) return -1;
      if (!isLiveA && isLiveB) return 1;

      return 0;
    });

    // 渲染直播卡片
    sortedStreams.forEach((stream) => {
      const data = this.liveStreamData.get(
        `${stream.platform}-${stream.roomId}`
      );
      const platformConfig = this.platformConfig[stream.platform];

      // 如果没有数据，显示加载中
      if (!data) {
        container.innerHTML += this.renderLoadingCard(stream);
        return;
      }

      // 获取直播状态
      const liveStatus = this.getValueFromPath(
        data,
        platformConfig.liveStatusField
      );
      const isLive = liveStatus == platformConfig.liveStatusValue;

      // 获取封面图、头像等信息
      let coverUrl =
        this.getValueFromPath(data, platformConfig.coverField) || "";
      let avatarUrl =
        this.getValueFromPath(data, platformConfig.avatarField) || "";
      const name =
        stream.customName ||
        this.getValueFromPath(data, platformConfig.nameField) ||
        stream.name;
      const category =
        this.getValueFromPath(data, platformConfig.categoryField) || "";
      const hot = this.getValueFromPath(data, platformConfig.hotField) || "0";

      // 使用图片代理处理B站图片
      if (stream.platform === "bilibili") {
        if (avatarUrl && !avatarUrl.startsWith("/api/proxy")) {
          avatarUrl = `/api/proxy/image?url=${encodeURIComponent(avatarUrl)}`;
        }
        if (coverUrl && !coverUrl.startsWith("/api/proxy")) {
          coverUrl = `/api/proxy/image?url=${encodeURIComponent(coverUrl)}`;
        }
      } else {
        // 其他平台的图片处理逻辑
        if (
          avatarUrl &&
          !avatarUrl.startsWith("http") &&
          !avatarUrl.startsWith("/")
        ) {
          avatarUrl = `https:${avatarUrl}`;
        }

        if (
          coverUrl &&
          !coverUrl.startsWith("http") &&
          !coverUrl.startsWith("/")
        ) {
          coverUrl = `https:${coverUrl}`;
        }
      }

      // 如果封面URL为空，使用头像作为封面
      if (!coverUrl && avatarUrl) {
        coverUrl = avatarUrl;
      }

      // 确保封面和头像URL不为空（使用默认Base64透明图片）
      const defaultImg =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
      coverUrl = coverUrl || defaultImg;
      avatarUrl = avatarUrl || defaultImg;

      // 直播间URL
      const liveUrl = platformConfig.urlTemplate.replace(
        "{roomId}",
        stream.roomId
      );

      // 渲染直播卡片
      container.innerHTML += `
        <div class="bg-white rounded-lg overflow-hidden shadow-md relative group cursor-pointer hover:shadow-lg transform transition-transform duration-300 hover:-translate-y-1">
          <a href="${liveUrl}" target="_blank" class="block">
            <div class="relative">
              <img 
                src="${coverUrl}" 
                alt="${name}" 
                class="w-full h-40 object-cover"
                onerror="this.src='${avatarUrl}'"
              >
              <div class="absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium" 
                   style="background-color: ${
                     platformConfig.color
                   }; color: white;">
                ${platformConfig.name}
              </div>
              ${
                isLive
                  ? '<div class="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white rounded text-xs font-medium">直播中</div>'
                  : '<div class="absolute top-2 right-2 px-2 py-1 bg-gray-500 text-white rounded text-xs font-medium">未开播</div>'
              }
              <div class="absolute bottom-2 right-2 px-2 py-1 bg-black/50 text-white rounded text-xs">
                <span>${hot}</span>
              </div>
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                <span class="text-white font-medium">点击进入直播间</span>
              </div>
            </div>
          </a>
          <div class="p-3">
            <div class="flex items-center space-x-2 mb-2">
              <img 
                src="${avatarUrl}" 
                class="w-8 h-8 rounded-full border-2 border-gray-200"
                onerror="this.style.display='none'"
              >
              <span class="font-medium text-sm truncate">${name}</span>
            </div>
            <div class="text-sm text-gray-600 truncate">${category}</div>
            <div class="mt-2 flex flex-wrap gap-1">
              ${
                stream.tags &&
                stream.tags
                  .map(
                    (tag) =>
                      `<span class="text-xs px-2 py-1 bg-gray-100 rounded-full">${tag}</span>`
                  )
                  .join("")
              }
            </div>
            <div class="mt-3 flex justify-end space-x-2">
              <button class="text-xs px-3 py-1 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 edit-stream"
                      data-platform="${stream.platform}" 
                      data-roomid="${stream.roomId}">
                编辑
              </button>
              <button class="text-xs px-3 py-1 bg-red-500 text-white rounded-full hover:bg-red-600 delete-stream"
                      data-platform="${stream.platform}" 
                      data-roomid="${stream.roomId}">
                删除
              </button>
            </div>
          </div>
        </div>
      `;
    });

    // 添加删除事件
    doc.querySelectorAll(".delete-stream").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.deleteStream(btn.dataset.platform, btn.dataset.roomid, doc);
      });
    });

    // 添加编辑事件
    doc.querySelectorAll(".edit-stream").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.editStream(btn.dataset.platform, btn.dataset.roomid, doc);
      });
    });
  }

  /**
   * 获取对象中的嵌套属性值
   */
  getValueFromPath(obj, path) {
    if (!obj || !path) return undefined;

    // 处理数组路径，如 "data.data[0].title"
    const parts = path.replace(/\[(\d+)\]/g, ".$1").split(".");
    let value = obj;

    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) break;
    }

    return value;
  }

  /**
   * 渲染加载中卡片
   */
  renderLoadingCard(stream) {
    const platformConfig = this.platformConfig[stream.platform];

    return `
      <div class="bg-white rounded-lg overflow-hidden shadow-md relative animate-pulse">
        <div class="relative">
          <div class="w-full h-40 bg-gray-200"></div>
          <div class="absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium" 
               style="background-color: ${platformConfig.color}; color: white;">
            ${platformConfig.name}
          </div>
        </div>
        <div class="p-3">
          <div class="flex items-center space-x-2 mb-2">
            <div class="w-8 h-8 rounded-full bg-gray-300"></div>
            <div class="w-20 h-4 bg-gray-300 rounded"></div>
          </div>
          <div class="w-full h-4 bg-gray-200 rounded"></div>
          <div class="mt-2 flex gap-1">
            <div class="w-12 h-5 bg-gray-200 rounded-full"></div>
            <div class="w-12 h-5 bg-gray-200 rounded-full"></div>
          </div>
          <div class="mt-3 flex justify-end gap-2">
            <div class="w-16 h-6 bg-gray-200 rounded-full"></div>
            <div class="w-16 h-6 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 更新直播统计
   */
  updateLiveCount(doc) {
    const liveCountEl = doc.getElementById("liveCount");
    const nonLiveCountEl = doc.getElementById("nonLiveCount");

    if (!liveCountEl || !nonLiveCountEl) return;

    let liveCount = 0;
    let nonLiveCount = 0;

    // 统计直播状态
    this.liveStreams.forEach((stream) => {
      const data = this.liveStreamData.get(
        `${stream.platform}-${stream.roomId}`
      );
      if (!data) return;

      const platformConfig = this.platformConfig[stream.platform];
      const liveStatus = this.getValueFromPath(
        data,
        platformConfig.liveStatusField
      );

      if (liveStatus == platformConfig.liveStatusValue) {
        liveCount++;
      } else {
        nonLiveCount++;
      }
    });

    liveCountEl.textContent = liveCount;
    nonLiveCountEl.textContent = nonLiveCount;
  }

  /**
   * 显示添加直播表单
   */
  showAddStreamForm(doc) {
    // 创建表单容器
    const formModal = doc.createElement("div");
    formModal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10";
    formModal.id = "add-stream-form";

    // 表单内容
    formModal.innerHTML = `
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-medium mb-4">添加直播间</h3>
        <form id="stream-form">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">平台</label>
            <select id="platform" class="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="douyu">斗鱼</option>
              <option value="bilibili">B站</option>
              <option value="douyin">抖音</option>
            </select>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">房间ID</label>
            <input type="text" id="roomId" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="请输入房间ID">
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">自定义名称 (可选)</label>
            <input type="text" id="customName" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="自定义主播名称">
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">标签 (用逗号分隔)</label>
            <input type="text" id="tags" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="例如：游戏,英雄联盟">
          </div>
          
          <div class="flex justify-end gap-2">
            <button type="button" id="cancel-add" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md">取消</button>
            <button type="submit" class="px-4 py-2 bg-purple-500 text-white rounded-md">添加</button>
          </div>
        </form>
      </div>
    `;

    // 添加到DOM
    doc.body.appendChild(formModal);

    // 取消按钮
    const cancelBtn = doc.getElementById("cancel-add");
    cancelBtn.addEventListener("click", () => {
      formModal.remove();
    });

    // 提交表单
    const form = doc.getElementById("stream-form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const platform = doc.getElementById("platform").value;
      const roomId = doc.getElementById("roomId").value.trim();
      const customName = doc.getElementById("customName").value.trim();
      const tags = doc.getElementById("tags").value.trim()
        ? doc
            .getElementById("tags")
            .value.split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        : [];

      // 验证
      if (!roomId) {
        this.showToast(doc, "请输入房间ID", "error");
        return;
      }

      // 检查是否已存在
      const exists = this.liveStreams.some(
        (stream) => stream.platform === platform && stream.roomId === roomId
      );

      if (exists) {
        this.showToast(doc, "该直播间已存在", "error");
        return;
      }

      // 添加新直播源
      try {
        // 先尝试获取数据验证房间ID是否有效
        const data = await this.fetchStreamData(platform, roomId);
        if (!data) {
          this.showToast(doc, "无法获取直播间信息，请检查房间ID", "error");
          return;
        }

        // 添加到列表
        this.liveStreams.push({
          platform,
          roomId,
          customName,
          tags,
        });

        // 保存数据
        this.saveLiveStreams();

        // 关闭表单
        formModal.remove();

        // 重新加载数据
        this.showToast(doc, "添加成功", "success");
        await this.loadStreamData();

        // 更新标签筛选按钮
        this.renderTagButtons(doc);
      } catch (error) {
        console.error("添加直播间失败:", error);
        this.showToast(doc, "添加失败，请检查房间ID是否正确", "error");
      }
    });
  }

  /**
   * 删除直播源
   */
  async deleteStream(platform, roomId, doc) {
    if (!confirm("确定要删除该直播间吗？")) return;

    // 从列表中删除
    const index = this.liveStreams.findIndex(
      (stream) => stream.platform === platform && stream.roomId === roomId
    );

    if (index !== -1) {
      this.liveStreams.splice(index, 1);
      this.saveLiveStreams();

      // 从缓存中删除
      this.liveStreamData.delete(`${platform}-${roomId}`);

      // 重新渲染
      this.renderStreamList(doc);
      this.updateLiveCount(doc);

      // 更新标签筛选按钮
      this.renderTagButtons(doc);

      this.showToast(doc, "删除成功", "success");
    }
  }

  /**
   * 显示提示消息
   */
  showToast(doc, message, type = "info") {
    // 创建toast元素
    const toast = doc.createElement("div");
    toast.className = `fixed top-4 right-4 p-3 rounded-md shadow-md z-50 ${
      type === "error"
        ? "bg-red-500"
        : type === "success"
        ? "bg-green-500"
        : "bg-blue-500"
    } text-white`;
    toast.textContent = message;

    // 添加到DOM
    doc.body.appendChild(toast);

    // 3秒后自动移除
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  /**
   * 编辑直播源
   */
  editStream(platform, roomId, doc) {
    // 查找要编辑的直播源
    const streamIndex = this.liveStreams.findIndex(
      (stream) => stream.platform === platform && stream.roomId === roomId
    );

    if (streamIndex === -1) return;

    const stream = this.liveStreams[streamIndex];

    // 创建表单容器
    const formModal = doc.createElement("div");
    formModal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10";
    formModal.id = "edit-stream-form";

    // 表单内容
    formModal.innerHTML = `
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-medium mb-4">编辑直播间</h3>
        <form id="stream-edit-form">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">平台</label>
            <select id="platform" class="w-full px-3 py-2 border border-gray-300 rounded-md" disabled>
              <option value="douyu" ${
                stream.platform === "douyu" ? "selected" : ""
              }>斗鱼</option>
              <option value="bilibili" ${
                stream.platform === "bilibili" ? "selected" : ""
              }>B站</option>
              <option value="douyin" ${
                stream.platform === "douyin" ? "selected" : ""
              }>抖音</option>
            </select>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">房间ID</label>
            <input type="text" id="roomId" class="w-full px-3 py-2 border border-gray-300 rounded-md" value="${
              stream.roomId
            }" readonly>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">自定义名称</label>
            <input type="text" id="customName" class="w-full px-3 py-2 border border-gray-300 rounded-md" value="${
              stream.customName || ""
            }" placeholder="自定义主播名称">
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">标签 (用逗号分隔)</label>
            <input type="text" id="tags" class="w-full px-3 py-2 border border-gray-300 rounded-md" value="${(
              stream.tags || []
            ).join(",")}" placeholder="例如：游戏,英雄联盟">
          </div>
          
          <div class="flex justify-end gap-2">
            <button type="button" id="cancel-edit" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md">取消</button>
            <button type="submit" class="px-4 py-2 bg-purple-500 text-white rounded-md">保存</button>
          </div>
        </form>
      </div>
    `;

    // 添加到DOM
    doc.body.appendChild(formModal);

    // 取消按钮
    const cancelBtn = doc.getElementById("cancel-edit");
    cancelBtn.addEventListener("click", () => {
      formModal.remove();
    });

    // 提交表单
    const form = doc.getElementById("stream-edit-form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const customName = doc.getElementById("customName").value.trim();
      const tags = doc.getElementById("tags").value.trim()
        ? doc
            .getElementById("tags")
            .value.split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        : [];

      // 更新直播源
      this.liveStreams[streamIndex] = {
        ...stream,
        customName,
        tags,
      };

      // 保存数据
      this.saveLiveStreams();

      // 关闭表单
      formModal.remove();

      // 重新加载数据
      this.showToast(doc, "编辑成功", "success");
      await this.loadStreamData();

      // 更新标签筛选按钮
      this.renderTagButtons(doc);
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
        <link href="https://ai-public.mastergo.com/gen_page/tailwind-custom.css" rel="stylesheet">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com/3.4.5?plugins=forms@0.5.7,typography@0.5.13,aspect-ratio@0.4.2,container-queries@0.1.1"></script>
        <script src="https://ai-public.mastergo.com/gen_page/tailwind-config.min.js" data-color="#3176FF" data-border-radius="small"></script>
        <style>
          :root {
            --custom-color: #6c5ce7;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
          }
          .bg-custom {
            background-color: var(--custom-color);
          }
          .text-custom {
            color: var(--custom-color);
          }
          .border-custom {
            border-color: var(--custom-color);
          }
          .hover\\:bg-custom:hover {
            background-color: var(--custom-color);
          }
          .hover\\:text-custom:hover {
            color: var(--custom-color);
          }
          .hover\\:border-custom:hover {
            border-color: var(--custom-color);
          }
          .rounded-button {
            border-radius: 0.375rem;
          }
        </style>
      </head>
      <body>
        <div class="min-h-screen bg-gray-50">
          <nav class="bg-white shadow-sm">
            <div class="max-w-7xl mx-auto px-4">
              <div class="flex justify-between h-16 items-center">
                <div class="flex items-center space-x-8">
                  <div class="font-['Pacifico'] text-2xl text-custom">直播视界</div>
                </div>
                <div class="flex items-center space-x-4">
                  <!-- 添加直播数量统计 -->
                  <div class="text-sm font-medium">
                    直播中: <span id="liveCount" class="text-blue-500 font-bold">0</span>
                    未开播: <span id="nonLiveCount" class="text-red-500 font-bold">0</span>
                  </div>
                  <button id="add-btn" class="px-3 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 !rounded-button">
                    <i class="fas fa-plus mr-1"></i> 添加直播间
                  </button>
                  <button id="close-btn" class="p-2 text-gray-500 hover:text-red-500">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
          </nav>

          <div class="max-w-7xl mx-auto px-4 py-6">
            <div class="flex space-x-4 mb-8 overflow-x-auto pb-2">
              <button class="px-6 py-2 bg-custom text-white rounded-full !rounded-button platform-btn" data-platform="all">
                全部
              </button>
              <button class="px-6 py-2 bg-white text-gray-600 rounded-full border border-gray-200 hover:border-custom hover:text-custom !rounded-button platform-btn" data-platform="douyu">
                斗鱼
              </button>
              <button class="px-6 py-2 bg-white text-gray-600 rounded-full border border-gray-200 hover:border-custom hover:text-custom !rounded-button platform-btn" data-platform="bilibili">
                B站
              </button>
              <button class="px-6 py-2 bg-white text-gray-600 rounded-full border border-gray-200 hover:border-custom hover:text-custom !rounded-button platform-btn" data-platform="douyin">
                抖音
              </button>
            </div>

            <div id="tags-container" class="flex space-x-4 mb-8 overflow-x-auto pb-2">
              <button class="px-4 py-1 text-blue-500 border-b-2 border-blue-500 tag-btn active" data-tag="all">
                全部
              </button>
              <!-- 动态生成标签 -->
            </div>

            <!-- 加载指示器 -->
            <div id="loading-indicator" class="text-center py-10">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
              <p class="mt-2 text-gray-600">正在加载直播数据...</p>
            </div>

            <!-- 响应式布局：主播卡片 -->
            <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" id="anchor-list">
              <!-- 主播卡片将动态插入到这里 -->
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

// 注册组件到全局
window.LiveStream = LiveStream;
