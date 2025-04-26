/**
 * 游戏中心组件
 * 提供各种小游戏的集合
 */
class GameCenter {
  constructor() {
    this.name = "游戏中心";
    this.iconClass = "fa-solid fa-gamepad";
    this.backgroundColor = "bg-purple-700";

    // 添加新属性，用于组件库显示
    this.icon = "fa-solid fa-gamepad";
    this.bgColor = "bg-purple-700";
    this.description = "各种休闲小游戏集合";
    this.games = [
      {
        id: "flappybird",
        name: "Flappy Bird",
        icon: "https://game.share888.top/images/y64.png",
        url: "https://flappybird.huang.co/",
        description: "经典的Flappy Bird小游戏",
      },
      {
        id: "squishbird",
        name: "压扁 Flappy Bird",
        icon: "https://game.share888.top/images/y63.png",
        url: "https://game.share888.top/yxmb/63/",
        description:
          "你恨 flappy bird吗?你每天晚上对着那个愚蠢的鸟做噩梦吗？压扁它们！",
      },
      {
        id: "blockbreaker",
        name: "打砖块",
        icon: "🧱",
        url: "https://blockbreaker.co/games/google-block-breaker/",
        description: "经典的打砖块游戏，控制挡板反弹小球击碎砖块！",
      },
      {
        id: "timer666",
        name: "挑战6.66秒暂停",
        icon: "⏱️",
        url: "./components/GameCenter/games/timer666/index.html",
        description: "挑战你的时间感知能力，越接近6.66秒越好！",
      },
      {
        id: "guessidioms",
        name: "看图猜成语",
        icon: "🔍",
        url: "./components/GameCenter/games/guessidioms/index.html",
        description: "根据图片猜测对应的成语，提高你的成语知识！",
      },
      {
        id: "leveldevil",
        name: "Level Devil",
        icon: "https://img.poki-cdn.com/cdn-cgi/image/quality=78,width=48,height=48,fit=cover,f=auto/2d6442164d27e469ce5d8b6db7864631.png",
        url: "https://leveldevil2.io/game/level-devil",
        description: "一个充满惊喜的平台跳跃游戏",
      },
      {
        id: "blockblast",
        name: "Block Blast",
        icon: "https://blockblast.game/favicon.ico",
        url: "https://blockblast.game/game",
        description: "方块消除类游戏",
      },
      {
        id: "2048",
        name: "2048",
        icon: "https://2048juego.com/favicon.ico",
        url: "https://2048juego.com/zh/", // 未来可添加
        description: "2048数字游戏",
      },
      {
        id: "chromedino",
        name: "Chrome Dino",
        icon: "https://dinosaur.game/apple-touch-icon.png",
        url: "https://dinosaur.game/zh/dinosaur-game",
        description: "Chrome离线小恐龙游戏",
      },
      {
        id: "templerun",
        name: "神庙逃亡",
        icon: "https://8090-game.online/images/Temple-Run.jpg",
        url: "https://gamemonetize.co/game/pkyyuilfrqkcdnmrxsg60j22ypk0peje/",
        description: "经典跑酷游戏，在神庙中不断奔跑并躲避障碍",
      },
      {
        id: "rubik",
        name: "3D魔方",
        icon: "🧩",
        url: "", // 未来可添加
        description: "3D魔方游戏",
        disabled: true,
      },
      {
        id: "tetris",
        name: "俄罗斯方块",
        icon: "🎲",
        url: "", // 未来可添加
        description: "经典俄罗斯方块游戏",
        disabled: true,
      },
      {
        id: "snake",
        name: "贪吃蛇",
        icon: "🐍",
        url: "", // 未来可添加
        description: "经典贪吃蛇游戏",
        disabled: true,
      },
    ];

    // 当前打开的游戏
    this.currentGame = null;
  }

  /**
   * 获取组件HTML
   * @returns {string} 组件的HTML元素字符串
   */
  render() {
    return `
      <div class="app-container flex flex-col items-center cursor-pointer" id="game-center-icon">
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
      .getElementById("game-center-icon")
      .addEventListener("click", this.handleClick.bind(this));
  }

  /**
   * 点击处理函数
   */
  handleClick() {
    this.createGameCenterModal();
  }

  /**
   * 创建游戏中心弹窗
   */
  createGameCenterModal() {
    // 检查是否已存在弹窗
    if (document.getElementById("game-center-modal")) {
      document.getElementById("game-center-modal").remove();
    }

    // 创建弹窗容器
    const modal = document.createElement("div");
    modal.id = "game-center-modal";
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
      "relative bg-gradient-to-br from-purple-900 to-purple-700 rounded-lg shadow-xl w-full max-w-4xl h-full md:h-5/6 flex flex-col overflow-hidden";

    // 创建动态标题栏
    const header = document.createElement("div");
    header.className =
      "flex justify-between items-center p-4 border-b border-purple-600 relative h-16";
    header.innerHTML = `
      <div id="main-view-title" class="flex items-center">
        <i class="${this.iconClass} mr-2 text-white"></i>
        <h2 class="text-xl font-bold text-white">${this.name}</h2>
      </div>
      
      <div id="game-view-title" class="hidden w-full absolute inset-0 flex items-center p-4">
        <div class="w-1/4 flex items-center justify-start">
          <button id="back-to-games" class="text-white px-2 py-1 flex items-center">
            <i class="fas fa-arrow-left mr-2"></i>
            <span>返回游戏中心</span>
          </button>
        </div>
        <div class="w-1/2 flex justify-center items-center">
          <span id="current-game-title" class="font-medium text-lg text-white">游戏标题</span>
        </div>
        <div class="w-1/4 flex items-center justify-end">
          <button id="fullscreen-game" class="text-white px-2 py-1 mr-2">
            <i class="fas fa-expand"></i>
          </button>
          <button id="close-game-btn" class="text-white hover:text-gray-300">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      <div id="main-close-btn">
        <button id="close-game-center" class="text-white hover:text-gray-300">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    // 创建内容区域
    const content = document.createElement("div");
    content.id = "game-center-container";
    content.className = "flex-1 overflow-auto p-4";

    // 游戏中心主界面
    const mainContent = document.createElement("div");
    mainContent.id = "game-center-main";
    mainContent.className =
      "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 w-full auto-rows-min";
    mainContent.innerHTML = this.renderGameIcons();
    content.appendChild(mainContent);

    // 游戏界面 (初始隐藏)
    const gameFrameContainer = document.createElement("div");
    gameFrameContainer.id = "game-frame-container";
    gameFrameContainer.className =
      "w-full h-full hidden flex flex-col relative";
    gameFrameContainer.innerHTML = `
      <div class="game-content flex-1 w-full">
        <iframe id="game-iframe" src="about:blank" class="w-full h-full border-0" allowfullscreen></iframe>
      </div>
      <div id="game-loading-indicator" class="absolute inset-0 flex items-center justify-center bg-purple-800 bg-opacity-75 z-10 hidden">
        <i class="fas fa-spinner fa-spin text-white text-4xl"></i>
      </div>
    `;
    content.appendChild(gameFrameContainer);

    // 添加到DOM
    modalContent.appendChild(header);
    modalContent.appendChild(content);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // 添加事件监听
    document
      .getElementById("close-game-center")
      .addEventListener("click", () => {
        modal.remove();
      });

    // 监听ESC键关闭
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const modal = document.getElementById("game-center-modal");
        if (modal) modal.remove();
      }
    });

    // 设置游戏点击事件
    this.setupGameEvents();
  }

  /**
   * 渲染游戏图标列表
   * @returns {string} 游戏图标HTML
   */
  renderGameIcons() {
    return this.games
      .map((game) => {
        const disabledClass = game.disabled
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer hover:scale-105";
        const disabledAttr = game.disabled ? 'disabled="disabled"' : "";
        const gameId = `game-${game.id}`;

        // 处理图标显示，判断icon是URL还是emoji
        let iconHtml = "";
        if (game.icon && game.icon.startsWith("http")) {
          // 如果icon是URL，显示为图片
          iconHtml = `<img src="${game.icon}" class="w-12 h-12 object-contain" alt="${game.name}">`;
        } else {
          // 否则显示为emoji或文本
          iconHtml = `<div class="w-12 h-12 flex items-center justify-center text-3xl">${
            game.icon || "🎮"
          }</div>`;
        }

        return `
        <div id="${gameId}" class="game-icon-container ${disabledClass} transition-all duration-200" ${disabledAttr}
          style="background-color: rgba(107, 33, 168, 0.5); border-radius: 16px; backdrop-filter: blur(5px); height: 120px;">
          <div class="flex flex-col items-center justify-center h-full py-2 px-3 text-center">
            ${iconHtml}
            <div class="text-white font-medium text-xs mt-1 whitespace-nowrap overflow-hidden text-ellipsis w-full">${game.name}</div>
          </div>
        </div>
      `;
      })
      .join("");
  }

  /**
   * 设置游戏点击事件
   */
  setupGameEvents() {
    this.games.forEach((game) => {
      if (game.disabled) return;

      const element = document.getElementById(`game-${game.id}`);
      if (element) {
        element.addEventListener("click", () => this.openGame(game.id));
      }
    });

    const backButton = document.getElementById("back-to-games");
    const fullscreenButton = document.getElementById("fullscreen-game");
    const closeGameButton = document.getElementById("close-game-btn");

    if (backButton) {
      backButton.addEventListener("click", () => this.closeGame());
    }

    if (fullscreenButton) {
      fullscreenButton.addEventListener("click", () => this.toggleFullscreen());
    }

    if (closeGameButton) {
      closeGameButton.addEventListener("click", () => this.closeGame());
    }
  }

  /**
   * 打开指定的游戏
   * @param {string} gameId - 要打开的游戏ID
   */
  openGame(gameId) {
    const game = this.games.find((g) => g.id === gameId);
    if (!game || game.disabled) return;

    this.currentGame = game;

    // 获取加载指示器和iframe
    const loadingIndicator = document.getElementById("game-loading-indicator");
    const iframe = document.getElementById("game-iframe");

    // 更新游戏标题
    const titleElement = document.getElementById("current-game-title");
    if (titleElement) {
      titleElement.textContent = game.name;
    }

    // 切换显示游戏界面
    document.getElementById("game-center-main").classList.add("hidden");
    const frameContainer = document.getElementById("game-frame-container");
    frameContainer.classList.remove("hidden");

    // 显示加载动画
    loadingIndicator.classList.remove("hidden");

    // 切换标题栏显示
    document.getElementById("main-view-title").classList.add("hidden");
    document.getElementById("game-view-title").classList.remove("hidden");
    document.getElementById("main-close-btn").classList.add("hidden");

    // 设置iframe的src, 并在加载完成后隐藏动画
    iframe.onload = () => {
      loadingIndicator.classList.add("hidden");
    };
    iframe.onerror = () => {
      // 可选：处理加载错误，例如显示错误消息并隐藏动画
      loadingIndicator.classList.add("hidden");
      console.error(`Failed to load game: ${game.name}`);
      // 可以考虑显示一个错误提示给用户
    };
    iframe.src = game.url;
  }

  /**
   * 关闭当前游戏
   */
  closeGame() {
    // 切换回游戏中心主界面
    document.getElementById("game-center-main").classList.remove("hidden");
    document.getElementById("game-frame-container").classList.add("hidden");

    // 切换标题栏显示
    document.getElementById("main-view-title").classList.remove("hidden");
    document.getElementById("game-view-title").classList.add("hidden");
    document.getElementById("main-close-btn").classList.remove("hidden");

    // 重置iframe src防止游戏继续运行
    const iframe = document.getElementById("game-iframe");
    iframe.src = "about:blank";

    // 确保隐藏加载动画
    const loadingIndicator = document.getElementById("game-loading-indicator");
    if (loadingIndicator) {
      loadingIndicator.classList.add("hidden");
    }

    this.currentGame = null;
  }

  /**
   * 切换全屏模式
   */
  toggleFullscreen() {
    const container = document.getElementById("game-frame-container");

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
window.GameCenter = GameCenter;
