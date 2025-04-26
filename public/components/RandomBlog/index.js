/**
 * 随机博客组件
 */
class RandomBlog {
  constructor() {
    this.name = "随机博客";
    this.iconClass = "fa-solid fa-rss";
    this.backgroundColor = "bg-orange-500";

    // 添加新属性，用于组件库显示
    this.icon = "fa-solid fa-rss";
    this.bgColor = "bg-orange-500";
    this.description = "随机访问博客";

    // 默认博客网站列表
    this.blogs = [
      {
        name: "十年之约",
        url: "https://www.foreverblog.cn/go.html",
      },
      {
        name: "BlogFinder",
        // 使用自定义方法处理，而不是预设URL
        customHandler: true,
        handler: () => this.openRandomBlogFinder(),
      },
      {
        name: "开往-友链接力",
        url: "https://www.travellings.cn/go.html",
      },
      {
        name: "异次元之旅-跃迁",
        url: "https://travel.moe/go?travel=on",
      },
      {
        name: "博客录",
        url: "https://boke.lu/sj/",
      },
    ];
  }

  /**
   * 打开随机BlogFinder博客
   */
  openRandomBlogFinder() {
    // 直接使用服务器的随机博客API，服务器会处理验证和重定向
    window.open("/api/blogs/random", "_blank");
    this.showToast(`已打开随机博客`, "success");
  }

  /**
   * 获取组件HTML
   * @returns {string} 组件的HTML元素字符串
   */
  render() {
    return `
      <div class="app-container flex flex-col items-center cursor-pointer" id="random-blog">
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
      .getElementById("random-blog")
      .addEventListener("click", this.handleClick.bind(this));
  }

  /**
   * 点击处理函数
   */
  async handleClick() {
    try {
      // 显示加载中提示
      this.showToast("加载中...", "info");

      // 从列表中随机选择一个博客网站
      const randomBlog =
        this.blogs[Math.floor(Math.random() * this.blogs.length)];

      if (
        randomBlog.customHandler &&
        typeof randomBlog.handler === "function"
      ) {
        // 使用自定义处理函数
        randomBlog.handler();
      } else {
        // 打开随机博客网站
        window.open(randomBlog.url, "_blank");

        // 显示成功提示
        this.showToast(`已打开${randomBlog.name}`, "success");
      }
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
window.RandomBlog = RandomBlog;
