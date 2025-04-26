/**
 * 随机一本书组件
 */
class RandomBook {
  constructor() {
    this.name = "随机一本书";
    this.iconClass = "fa-solid fa-book";
    this.backgroundColor = "bg-yellow-500";

    // 添加新属性，用于组件库显示
    this.icon = "fa-solid fa-book";
    this.bgColor = "bg-yellow-500";
    this.description = "随机跳转到一本书";
  }

  /**
   * 获取组件HTML
   * @returns {string} 组件的HTML元素字符串
   */
  render() {
    return `
      <div class="app-container flex flex-col items-center cursor-pointer" id="random-book">
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
      .getElementById("random-book")
      .addEventListener("click", this.handleClick.bind(this));
  }

  /**
   * 点击处理函数
   */
  async handleClick() {
    try {
      // 显示加载中提示
      this.showToast("加载中...", "info");

      // 直接打开随机书籍页面
      window.open("https://book.tstrs.me/G2R", "_blank");

      // 显示成功提示
      this.showToast("已打开随机书籍页面", "success");
    } catch (error) {
      console.error("Error:", error);
      this.showToast("打开失败，请重试", "error");
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
window.RandomBook = RandomBook;
