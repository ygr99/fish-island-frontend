/**
 * 快递查询组件
 */
class ExpressTracker {
  constructor() {
    this.name = "快递查询";
    this.iconClass = "fa-solid fa-truck";
    this.backgroundColor = "bg-green-500";

    // 添加新属性，用于组件库显示
    this.icon = "fa-solid fa-truck";
    this.bgColor = "bg-green-500";
    this.description = "查询快递物流信息";

    // 快递查询历史记录 - 修改为对象数组，包含单号和备注
    this.history = this.loadHistory() || [];
  }

  /**
   * 保存查询历史到本地存储
   */
  saveHistory() {
    try {
      localStorage.setItem(
        "express-tracker-history",
        JSON.stringify(this.history)
      );
    } catch (e) {
      console.error("保存快递查询历史失败:", e);
    }
  }

  /**
   * 从本地存储加载查询历史
   */
  loadHistory() {
    try {
      const saved = localStorage.getItem("express-tracker-history");
      const parsed = saved ? JSON.parse(saved) : [];

      // 兼容旧数据格式（字符串数组）
      if (parsed.length > 0 && typeof parsed[0] === "string") {
        return parsed.map((number) => ({ number, note: "" }));
      }

      return parsed;
    } catch (e) {
      console.error("加载快递查询历史失败:", e);
      return [];
    }
  }

  /**
   * 添加记录到历史
   * @param {string} trackingNumber - 快递单号
   * @param {string} note - 备注信息
   */
  addToHistory(trackingNumber, note = "") {
    // 检查是否已存在相同单号
    const existingItem = this.history.find(
      (item) => item.number === trackingNumber
    );

    // 如果已存在相同单号，且新备注为空，则保留旧备注
    if (existingItem && !note) {
      note = existingItem.note;
    }

    // 如果已存在相同单号，则移除旧记录
    this.history = this.history.filter(
      (item) => item.number !== trackingNumber
    );

    // 添加到历史记录开头
    this.history.unshift({ number: trackingNumber, note });

    // 限制历史记录数量，最多保存10条
    if (this.history.length > 10) {
      this.history = this.history.slice(0, 10);
    }

    // 保存到本地存储
    this.saveHistory();
  }

  /**
   * 更新历史记录的备注
   * @param {string} trackingNumber - 快递单号
   * @param {string} note - 新的备注信息
   */
  updateNote(trackingNumber, note) {
    const index = this.history.findIndex(
      (item) => item.number === trackingNumber
    );
    if (index !== -1) {
      this.history[index].note = note;
      this.saveHistory();
    }
  }

  /**
   * 获取组件HTML
   * @returns {string} 组件的HTML元素字符串
   */
  render() {
    return `
      <div class="app-container flex flex-col items-center cursor-pointer" id="express-tracker">
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
      .getElementById("express-tracker")
      .addEventListener("click", this.handleClick.bind(this));
  }

  /**
   * 点击处理函数
   */
  handleClick() {
    // 创建快递查询弹窗
    this.createModal();
  }

  /**
   * 创建弹窗
   */
  createModal() {
    // 检查是否已存在弹窗
    if (document.getElementById("express-tracker-modal")) {
      document.getElementById("express-tracker-modal").remove();
    }

    // 创建弹窗容器
    const modal = document.createElement("div");
    modal.id = "express-tracker-modal";
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
      "relative bg-white rounded-lg shadow-xl w-full max-w-md p-6";
    modalContent.addEventListener("click", (e) => e.stopPropagation());

    // 标题
    const title = document.createElement("h3");
    title.className = "text-xl font-bold text-center mb-4 text-gray-800";
    title.textContent = "快递查询";

    // 表单
    const form = document.createElement("form");
    form.className = "space-y-4";
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSearch(inputField.value);
    });

    // 输入框
    const inputField = document.createElement("input");
    inputField.type = "text";
    inputField.placeholder = "请输入快递单号，基本上支持所有快递";
    inputField.className =
      "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500";
    inputField.required = true;

    // 备注输入框
    const noteField = document.createElement("input");
    noteField.type = "text";
    noteField.placeholder = "添加备注（可选）";
    noteField.className =
      "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 mt-2";
    noteField.id = "tracking-note";

    // 提示文本
    const hint = document.createElement("p");
    hint.className = "text-sm text-gray-500";
    hint.innerHTML = "";

    // 历史记录容器
    const historyContainer = document.createElement("div");
    historyContainer.className = "mt-4";

    // 历史记录标题
    if (this.history.length > 0) {
      const historyTitle = document.createElement("div");
      historyTitle.className = "flex items-center justify-between mb-2";

      const historyLabel = document.createElement("span");
      historyLabel.className = "text-sm font-medium text-gray-700";
      historyLabel.textContent = "查询历史:";

      const clearButton = document.createElement("button");
      clearButton.type = "button";
      clearButton.className = "text-xs text-gray-500 hover:text-red-500";
      clearButton.textContent = "清空";
      clearButton.onclick = (e) => {
        e.stopPropagation();
        this.history = [];
        this.saveHistory();
        historyContainer.innerHTML = "";
      };

      historyTitle.appendChild(historyLabel);
      historyTitle.appendChild(clearButton);
      historyContainer.appendChild(historyTitle);

      // 添加提示文本
      const tipText = document.createElement("p");
      tipText.className = "text-xs text-gray-500 mb-2";
      tipText.innerHTML =
        "<i class='fas fa-info-circle'></i> 提示：点击单个快递单号可直接查询，勾选多个可批量查询";
      historyContainer.appendChild(tipText);

      // 历史记录列表
      const historyList = document.createElement("div");
      historyList.className = "space-y-1";

      this.history.forEach((item) => {
        const historyItem = document.createElement("div");
        historyItem.className =
          "flex items-center bg-gray-100 rounded p-2 hover:bg-gray-200 cursor-pointer";

        // 添加提示图标
        const clickIcon = document.createElement("i");
        clickIcon.className = "fas fa-search text-green-500 text-xs mr-1";
        clickIcon.title = "点击查询此快递单号";

        // 添加复选框
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "tracking-checkbox mr-2";
        checkbox.value = item.number;
        checkbox.addEventListener("click", (e) => e.stopPropagation());

        const numberText = document.createElement("span");
        numberText.className = "text-gray-700 text-sm flex-grow";
        numberText.textContent = item.number;

        // 备注显示
        const noteText = document.createElement("span");
        noteText.className = "text-gray-500 text-xs ml-2";
        noteText.textContent = item.note ? `(${item.note})` : "";

        // 编辑备注按钮
        const editNoteIcon = document.createElement("i");
        editNoteIcon.className =
          "fas fa-edit text-blue-500 text-sm p-1 hover:bg-gray-300 rounded mr-1";
        editNoteIcon.style.cursor = "pointer";
        editNoteIcon.title = "编辑备注";

        // 编辑备注功能
        editNoteIcon.addEventListener("click", (e) => {
          e.stopPropagation();
          const newNote = prompt("请输入备注:", item.note);
          if (newNote !== null) {
            this.updateNote(item.number, newNote);
            noteText.textContent = newNote ? `(${newNote})` : "";
          }
        });

        const deleteIcon = document.createElement("i");
        deleteIcon.className =
          "fas fa-times text-red-500 text-sm p-1 hover:bg-gray-300 rounded";
        deleteIcon.style.cursor = "pointer";

        // 添加删除单条记录的功能
        deleteIcon.addEventListener("click", (e) => {
          e.stopPropagation(); // 阻止事件冒泡，避免触发整个historyItem的点击事件
          this.history = this.history.filter(
            (historyItem) => historyItem.number !== item.number
          );
          this.saveHistory();
          historyItem.remove(); // 从DOM中移除

          // 如果删除后历史记录为空，则隐藏整个历史记录容器
          if (this.history.length === 0) {
            historyContainer.remove();
          }
        });

        historyItem.appendChild(checkbox);
        historyItem.appendChild(clickIcon);
        historyItem.appendChild(numberText);
        historyItem.appendChild(noteText);
        historyItem.appendChild(editNoteIcon);
        historyItem.appendChild(deleteIcon);

        // 添加鼠标悬停提示
        historyItem.title = "点击查询此快递单号";

        // 点击整个记录项时自动进行查询
        historyItem.addEventListener("click", () => {
          this.handleSearch(item.number);
        });

        historyList.appendChild(historyItem);
      });

      historyContainer.appendChild(historyList);

      // 批量查询按钮 - 移到历史记录列表下方，并调整样式
      const batchQueryButton = document.createElement("button");
      batchQueryButton.type = "button";
      batchQueryButton.className =
        "w-full py-1 px-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 mt-2 text-sm";
      batchQueryButton.innerHTML =
        "<i class='fas fa-search-plus mr-1'></i>批量查询选中单号";
      batchQueryButton.onclick = (e) => {
        e.preventDefault();
        const selectedNumbers = Array.from(
          document.querySelectorAll(".tracking-checkbox:checked")
        ).map((checkbox) => checkbox.value);

        if (selectedNumbers.length === 0) {
          alert("请至少选择一个快递单号");
          return;
        }

        this.handleBatchSearch(selectedNumbers);
      };
      historyContainer.appendChild(batchQueryButton);
    }

    // 按钮容器
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "flex space-x-4";

    // 取消按钮
    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className =
      "flex-1 py-2 px-4 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400";
    cancelButton.textContent = "取消";
    cancelButton.onclick = () => modal.remove();

    // 搜索按钮
    const searchButton = document.createElement("button");
    searchButton.type = "submit";
    searchButton.className =
      "flex-1 py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600";
    searchButton.textContent = "查询";

    // 添加元素到DOM
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(searchButton);
    form.appendChild(inputField);
    form.appendChild(noteField);
    form.appendChild(hint);
    if (this.history.length > 0) {
      form.appendChild(historyContainer);
    }
    form.appendChild(buttonContainer);
    modalContent.appendChild(title);
    modalContent.appendChild(form);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // 聚焦输入框
    setTimeout(() => inputField.focus(), 100);

    // 监听ESC键关闭
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const modal = document.getElementById("express-tracker-modal");
        if (modal) modal.remove();
      }
    });
  }

  /**
   * 处理搜索
   * @param {string} trackingNumber - 快递单号
   */
  handleSearch(trackingNumber) {
    if (!trackingNumber) return;

    // 验证快递单号格式
    const trackingPattern =
      /^([A-Za-z]{2}\d{9}[A-Za-z]{2}|\d{12,16}|[A-Za-z]{2,3}\d{12,16})$/;

    if (!trackingPattern.test(trackingNumber.trim())) {
      alert("请输入正确格式的快递单号");
      return;
    }

    // 获取备注
    const noteField = document.getElementById("tracking-note");
    const note = noteField ? noteField.value.trim() : "";

    // 检查是否已存在相同单号
    const existingItem = this.history.find(
      (item) => item.number === trackingNumber.trim()
    );

    // 如果已存在相同单号，且新备注为空，则保留旧备注
    const finalNote = existingItem && !note ? existingItem.note : note;

    // 添加到历史记录
    this.addToHistory(trackingNumber.trim(), finalNote);

    // 格式正确，跳转到17track查询
    const trackingUrl = `https://t.17track.net/zh-cn#nums=${trackingNumber.trim()}`;
    window.open(trackingUrl, "_blank");

    // 关闭弹窗
    const modal = document.getElementById("express-tracker-modal");
    if (modal) modal.remove();
  }

  /**
   * 处理批量搜索
   * @param {Array<string>} trackingNumbers - 快递单号数组
   */
  handleBatchSearch(trackingNumbers) {
    if (!trackingNumbers || trackingNumbers.length === 0) return;

    // 验证所有快递单号格式
    const trackingPattern =
      /^([A-Za-z]{2}\d{9}[A-Za-z]{2}|\d{12,16}|[A-Za-z]{2,3}\d{12,16})$/;

    for (const number of trackingNumbers) {
      if (!trackingPattern.test(number.trim())) {
        alert(`快递单号 ${number} 格式不正确`);
        return;
      }
    }

    // 格式正确，跳转到17track查询
    const trackingUrl = `https://t.17track.net/zh-cn#nums=${trackingNumbers.join(
      ","
    )}`;
    window.open(trackingUrl, "_blank");

    // 关闭弹窗
    const modal = document.getElementById("express-tracker-modal");
    if (modal) modal.remove();
  }
}

// 注册组件到全局
window.ExpressTracker = ExpressTracker;
