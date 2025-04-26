/**
 * 随机炫猿导航组件
 */
class RandomXydh {
  constructor() {
    this.name = "随机炫猿导航";
    this.iconClass = "fa-solid fa-compass";
    this.backgroundColor = "bg-blue-500";

    // 添加新属性，用于组件库显示
    this.icon = "fa-solid fa-compass";
    this.bgColor = "bg-blue-500";
    this.description =
      "随机访问一个用户的炫猿导航页面（定制，专属域名的个性化导航站）";
  }

  /**
   * 获取组件HTML
   * @returns {string} 组件的HTML元素字符串
   */
  render() {
    return `
      <div class="app-container flex flex-col items-center cursor-pointer" id="random-xydh">
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
      .getElementById("random-xydh")
      .addEventListener("click", this.handleClick.bind(this));
  }

  /**
   * 点击处理函数
   */
  async handleClick() {
    try {
      // 显示加载中提示
      this.showToast("加载中...", "info");

      // 获取随机炫猿用户数据，使用本地代理API
      const response = await fetch("/api/xydh/random");
      const result = await response.json();

      if (result.code === 0 && result.data && result.data.name) {
        // 构建并打开随机炫猿导航链接
        const url = `https://xydh.fun/${result.data.name}`;
        window.open(url, "_blank");
        // 显示成功提示
        this.showToast("已打开随机炫猿导航页面", "success");
      } else {
        throw new Error("获取随机用户失败");
      }
    } catch (error) {
      console.error("Error:", error);
      this.showToast("获取随机炫猿导航失败，请重试", "error");
    }
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
window.RandomXydh = RandomXydh;
