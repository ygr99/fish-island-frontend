/**
 * 工具箱组件
 * 提供各种实用小工具的集合
 */
class Toolbox {
  constructor() {
    this.name = "工具箱";
    this.iconClass = "fa-solid fa-toolbox"; // 更新图标
    this.backgroundColor = "bg-blue-700"; // 更新背景色

    // 添加新属性，用于组件库显示
    this.icon = "fa-solid fa-toolbox";
    this.bgColor = "bg-blue-700";
    this.description = "各种实用小工具集合";
    this.tools = [
      // 重命名为 tools，并添加示例工具
      {
        id: "coinflip", // 新工具 ID
        name: "抛硬币",
        icon: "🪙", // 新工具图标
        url: "./components/Toolbox/tools/coinFlip/index.html", // 指向新工具的路径
        description: "快速帮你做决定",
        disabled: false, // 启用此工具
      },
      {
        id: "cloudFan",
        name: "云风扇",
        icon: "🌬️", // 使用风的表情符号作为图标
        url: "./components/Toolbox/tools/cloudFan/index.html",
        description: "一个没有风的虚拟风扇",
        disabled: false,
      },
      {
        id: "emojiMix",
        name: "Emoji合成",
        icon: "😊",
        url: "./components/Toolbox/tools/emojiMix/index.html",
        description: "Emoji合成，挺好玩儿的。🤯+😭=？",
        disabled: false,
      },
      {
        id: "favicon",
        name: "图标获取",
        icon: "🔍",
        url: "./components/Toolbox/tools/favicon/index.html",
        description: "获取网站favicon图标",
        disabled: false,
      },
      {
        id: "calculator",
        name: "计算器",
        icon: "🧮",
        url: "./components/Toolbox/tools/calculator/index.html", // 更新 URL
        description: "多行简单计算器，实时计算结果",
        disabled: false, // 启用工具
      },
      {
        id: "musicParser",
        name: "网易云音乐解析",
        icon: "🎵",
        url: "https://www.kanxizai.cn/163_music/",
        description: "高品质音乐解析下载工具",
        disabled: false,
      },
      {
        id: "converter",
        name: "单位换算",
        icon: "🔄",
        url: "", // 待实现
        description: "常用单位转换器",
        disabled: true,
      },
      {
        id: "timer",
        name: "计时器",
        icon: "⏱️",
        url: "", // 待实现
        description: "秒表和倒计时",
        disabled: true,
      },
      // 可以根据需要添加更多工具
    ];

    // 当前打开的工具
    this.currentTool = null; // 重命名为 currentTool
  }

  /**
   * 获取组件HTML
   * @returns {string} 组件的HTML元素字符串
   */
  render() {
    // 更新 ID 和文本
    return `
      <div class="app-container flex flex-col items-center cursor-pointer" id="toolbox-icon">
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
      .getElementById("toolbox-icon") // 更新 ID
      .addEventListener("click", this.handleClick.bind(this));
  }

  /**
   * 点击处理函数
   */
  handleClick() {
    this.createToolboxModal(); // 重命名方法
  }

  /**
   * 创建工具箱弹窗
   */
  createToolboxModal() {
    // 重命名方法
    // 检查是否已存在弹窗
    if (document.getElementById("toolbox-modal")) {
      // 更新 ID
      document.getElementById("toolbox-modal").remove(); // 更新 ID
    }

    // 创建弹窗容器
    const modal = document.createElement("div");
    modal.id = "toolbox-modal"; // 更新 ID
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
      "relative bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg shadow-xl w-full max-w-4xl h-full md:h-5/6 flex flex-col overflow-hidden"; // 更新背景渐变

    // 创建动态标题栏
    const header = document.createElement("div");
    header.className =
      "flex justify-between items-center p-4 border-b border-blue-600 relative h-16"; // 更新边框颜色
    // 更新 ID 和文本
    header.innerHTML = `
      <div id="main-view-title-toolbox" class="flex items-center">
        <i class="${this.iconClass} mr-2 text-white"></i>
        <h2 class="text-xl font-bold text-white">${this.name}</h2>
      </div>

      <div id="tool-view-title" class="hidden w-full absolute inset-0 flex items-center p-4">
        <div class="w-1/4 flex items-center justify-start">
          <button id="back-to-tools" class="text-white px-2 py-1 flex items-center">
            <i class="fas fa-arrow-left mr-2"></i>
            <span>返回工具箱</span>
          </button>
        </div>
        <div class="w-1/2 flex justify-center items-center">
          <span id="current-tool-title" class="font-medium text-lg text-white">工具标题</span>
        </div>
        <div class="w-1/4 flex items-center justify-end">
          <button id="fullscreen-tool" class="text-white px-2 py-1 mr-2">
            <i class="fas fa-expand"></i>
          </button>
          <button id="close-tool-btn" class="text-white hover:text-gray-300">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <div id="main-close-btn-toolbox">
        <button id="close-toolbox" class="text-white hover:text-gray-300">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    // 创建内容区域
    const content = document.createElement("div");
    content.id = "toolbox-container"; // 更新 ID
    content.className = "flex-1 overflow-auto p-4";

    // 工具箱主界面
    const mainContent = document.createElement("div");
    mainContent.id = "toolbox-main"; // 更新 ID
    mainContent.className =
      "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 w-full auto-rows-min";
    mainContent.innerHTML = this.renderToolIcons(); // 重命名方法
    content.appendChild(mainContent);

    // 工具界面 (初始隐藏)
    const toolFrameContainer = document.createElement("div"); // 重命名变量
    toolFrameContainer.id = "tool-frame-container"; // 更新 ID
    toolFrameContainer.className =
      "w-full h-full hidden flex flex-col relative";
    // 更新 ID 和背景色
    toolFrameContainer.innerHTML = `
      <div class="tool-content flex-1 w-full">
        <iframe id="tool-iframe" src="about:blank" class="w-full h-full border-0" allowfullscreen></iframe>
      </div>
      <div id="tool-loading-indicator" class="absolute inset-0 flex items-center justify-center bg-blue-800 bg-opacity-75 z-10 hidden">
        <i class="fas fa-spinner fa-spin text-white text-4xl"></i>
      </div>
    `;
    content.appendChild(toolFrameContainer);

    // 添加到DOM
    modalContent.appendChild(header);
    modalContent.appendChild(content);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // 添加事件监听
    document
      .getElementById("close-toolbox") // 更新 ID
      .addEventListener("click", () => {
        modal.remove();
      });

    // 监听ESC键关闭
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const modal = document.getElementById("toolbox-modal"); // 更新 ID
        if (modal) modal.remove();
      }
    });

    // 设置工具点击事件
    this.setupToolEvents(); // 重命名方法
  }

  /**
   * 渲染工具图标列表
   * @returns {string} 工具图标HTML
   */
  renderToolIcons() {
    // 重命名方法
    return this.tools // 使用 this.tools
      .map((tool) => {
        const disabledClass = tool.disabled
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer hover:scale-105";
        const disabledAttr = tool.disabled ? 'disabled="disabled"' : "";
        const toolId = `tool-${tool.id}`; // 更新前缀

        // 处理图标显示，判断icon是URL还是emoji
        let iconHtml = "";
        if (tool.icon && tool.icon.startsWith("http")) {
          // 如果icon是URL，显示为图片
          iconHtml = `<img src="${tool.icon}" class="w-12 h-12 object-contain" alt="${tool.name}">`;
        } else {
          // 否则显示为emoji或文本
          iconHtml = `<div class="w-12 h-12 flex items-center justify-center text-3xl">${
            tool.icon || "🔧" // 默认工具图标
          }</div>`;
        }

        // 更新 ID, 背景色, 和 tool.name
        return `
        <div id="${toolId}" class="tool-icon-container ${disabledClass} transition-all duration-200" ${disabledAttr}
          style="background-color: rgba(37, 99, 235, 0.5); border-radius: 16px; backdrop-filter: blur(5px); height: 120px;">
          <div class="flex flex-col items-center justify-center h-full py-2 px-3 text-center">
            ${iconHtml}
            <div class="text-white font-medium text-xs mt-1 whitespace-nowrap overflow-hidden text-ellipsis w-full">${tool.name}</div>
          </div>
        </div>
      `;
      })
      .join("");
  }

  /**
   * 设置工具点击事件
   */
  setupToolEvents() {
    // 重命名方法
    this.tools.forEach((tool) => {
      // 使用 this.tools
      if (tool.disabled) return;

      const element = document.getElementById(`tool-${tool.id}`); // 更新前缀
      if (element) {
        element.addEventListener("click", () => this.openTool(tool.id)); // 重命名方法
      }
    });

    // 更新按钮 ID
    const backButton = document.getElementById("back-to-tools");
    const fullscreenButton = document.getElementById("fullscreen-tool");
    const closeToolButton = document.getElementById("close-tool-btn");

    if (backButton) {
      backButton.addEventListener("click", () => this.closeTool()); // 重命名方法
    }

    if (fullscreenButton) {
      fullscreenButton.addEventListener("click", () => this.toggleFullscreen());
    }

    if (closeToolButton) {
      closeToolButton.addEventListener("click", () => this.closeTool()); // 重命名方法
    }
  }

  /**
   * 打开指定的工具
   * @param {string} toolId - 要打开的工具ID
   */
  openTool(toolId) {
    // 重命名方法
    const tool = this.tools.find((t) => t.id === toolId); // 使用 this.tools
    if (!tool || tool.disabled) return;

    this.currentTool = tool; // 使用 currentTool

    // 获取加载指示器和iframe (更新 ID)
    const loadingIndicator = document.getElementById("tool-loading-indicator");
    const iframe = document.getElementById("tool-iframe");

    // 更新工具标题 (更新 ID)
    const titleElement = document.getElementById("current-tool-title");
    if (titleElement) {
      titleElement.textContent = tool.name;
    }

    // 切换显示工具界面 (更新 ID)
    document.getElementById("toolbox-main").classList.add("hidden");
    const frameContainer = document.getElementById("tool-frame-container");
    frameContainer.classList.remove("hidden");

    // 显示加载动画
    loadingIndicator.classList.remove("hidden");

    // 切换标题栏显示 (更新 ID)
    document.getElementById("main-view-title-toolbox").classList.add("hidden");
    document.getElementById("tool-view-title").classList.remove("hidden");
    document.getElementById("main-close-btn-toolbox").classList.add("hidden");

    // 设置iframe的src, 并在加载完成后隐藏动画
    iframe.onload = () => {
      loadingIndicator.classList.add("hidden");
    };
    iframe.onerror = () => {
      // 可选：处理加载错误，例如显示错误消息并隐藏动画
      loadingIndicator.classList.add("hidden");
      console.error(`Failed to load tool: ${tool.name}`);
      // 可以考虑显示一个错误提示给用户
    };
    iframe.src = tool.url;
  }

  /**
   * 关闭当前工具
   */
  closeTool() {
    // 重命名方法
    // 切换回工具箱主界面 (更新 ID)
    document.getElementById("toolbox-main").classList.remove("hidden");
    document.getElementById("tool-frame-container").classList.add("hidden");

    // 切换标题栏显示 (更新 ID)
    document
      .getElementById("main-view-title-toolbox")
      .classList.remove("hidden");
    document.getElementById("tool-view-title").classList.add("hidden");
    document
      .getElementById("main-close-btn-toolbox")
      .classList.remove("hidden");

    // 重置iframe src防止工具继续运行 (更新 ID)
    const iframe = document.getElementById("tool-iframe");
    iframe.src = "about:blank";

    // 确保隐藏加载动画 (更新 ID)
    const loadingIndicator = document.getElementById("tool-loading-indicator");
    if (loadingIndicator) {
      loadingIndicator.classList.add("hidden");
    }

    this.currentTool = null; // 使用 currentTool
  }

  /**
   * 切换全屏模式
   */
  toggleFullscreen() {
    const container = document.getElementById("tool-frame-container"); // 更新 ID

    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        /* Safari */
        container.webkitRequestFullscreen();
      } else if (container.msRequestFullscreen) {
        /* IE11 */
        container.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        /* Safari */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        /* IE11 */
        document.msExitFullscreen();
      }
    }
  }
}

// 导出组件类
window.Toolbox = Toolbox; // 导出 Toolbox
