/**
 * 随机追剧组件
 */
class RandomTV {
  constructor() {
    this.name = "随机追剧";
    this.iconClass = "fa-solid fa-tv";
    this.backgroundColor = "bg-purple-500";

    // 添加新属性，用于组件库显示
    this.icon = "fa-solid fa-tv";
    this.bgColor = "bg-purple-500";
    this.description = "随机推荐电视剧";

    // 最大电视剧ID
    this.maxTVId = 46614;
  }

  /**
   * 获取组件HTML
   * @returns {string} 组件的HTML元素字符串
   */
  render() {
    return `
      <div class="app-container flex flex-col items-center cursor-pointer" id="random-tv">
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
      .getElementById("random-tv")
      .addEventListener("click", this.handleClick.bind(this));
  }

  /**
   * 点击处理函数
   */
  async handleClick() {
    let attempts = 0;
    const maxAttempts = 5; // 最大尝试次数

    // 显示加载中提示
    this.showToast("加载中...", "info");

    while (attempts < maxAttempts) {
      // 生成随机ID
      const randomId = Math.floor(Math.random() * this.maxTVId) + 1;

      try {
        // 检查是否有效
        const response = await fetch(
          `https://tv.codebug.icu/heimuer/api.php/provide/vod/?ac=detail&ids=${randomId}`
        );
        const data = await response.json();

        // 如果存在且有效
        if (data.code === 1 && data.list && data.list.length > 0) {
          window.open(`https://tv.codebug.icu/detail/${randomId}`, "_blank");
          return;
        }

        attempts++;
      } catch (error) {
        console.error("检查时出错:", error);
        attempts++;
      }
    }

    // 如果多次尝试都失败，显示提示
    this.showToast("未能找到有效内容，再点一下试试看~", "error");
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
window.RandomTV = RandomTV;
