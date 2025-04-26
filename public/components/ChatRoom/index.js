/**
 * 聊天室组件
 */
class ChatRoom {
  constructor() {
    this.name = "聊天室";
    this.iconClass = "fa-solid fa-comments";
    this.backgroundColor = "bg-blue-500";

    // 添加新属性，用于组件库显示
    this.icon = "fa-solid fa-comments";
    this.bgColor = "bg-blue-500";
    this.description = "基于MQTT的实时聊天室";

    // MQTT连接配置
    this.mqttConfig = {
      host: "123.60.153.252",
      port: 8083,
      path: "/mqtt",
      username: "admin",
      password: "admin",
      clientId: "chatroom_" + Math.random().toString(16).substr(2, 8),
    };

    // 聊天相关
    this.client = null;
    this.username = "";
    this.connected = false;
    this.userList = [];
    this.messageHistory = [];
    this.mainTopic = "chatroom/public";
    this.usersTopic = "chatroom/users";
    this.historyTopic = "chatroom/history";

    // 本地存储key（仅用于保存用户名）
    this.storageUsernameKey = "chatroom_username";
    this.storageSettingsKey = "chatroom_settings";

    // 历史记录配置
    this.maxHistoryMessages = 100; // 存储在内存中的最大消息数量
    this.pageSize = 10; // 每页显示的消息数量
    this.currentPage = 1; // 当前页码
    this.isLoadingMoreMessages = false; // 是否正在加载更多消息
    this.allMessagesLoaded = false; // 是否已加载所有消息
    this.historyProcessed = false; // 历史消息处理标志

    // 用户设置
    this.settings = {
      showFullTime: false, // 默认不显示完整时间
    };
  }

  /**
   * 获取以前保存的用户名
   */
  getSavedUsername() {
    try {
      return localStorage.getItem(this.storageUsernameKey) || "";
    } catch (error) {
      return "";
    }
  }

  /**
   * 保存用户名到本地存储
   */
  saveUsernameToStorage(username) {
    try {
      localStorage.setItem(this.storageUsernameKey, username);
    } catch (error) {
      console.error("保存用户名失败:", error);
    }
  }

  /**
   * 获取组件HTML
   * @returns {string} 组件的HTML元素字符串
   */
  render() {
    return `
        <div class="app-container flex flex-col items-center cursor-pointer" id="chat-room">
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
      .getElementById("chat-room")
      .addEventListener("click", this.handleClick.bind(this));
  }

  /**
   * 点击处理函数
   */
  handleClick() {
    // 检查是否已经存在聊天室弹窗
    const existingModal = document.getElementById("chat-room-modal");
    if (existingModal) {
      // 如果弹窗已存在，则不创建新弹窗，只需要确保显示
      return;
    }

    // 确保之前的客户端连接被正确关闭
    if (this.client) {
      try {
        // 发送用户下线消息
        if (this.connected) {
          this.publishUserStatus("offline");
        }
        // 完全断开连接
        this.client.end(true);
        this.client = null;
      } catch (error) {
        console.error("断开连接失败:", error);
      }
    }

    // 重置相关状态
    this.historyProcessed = false;
    this.messageHistory = [];
    this.userList = [];
    this.allMessagesLoaded = false;
    this.currentPage = 1;
    this.isLoadingMoreMessages = false;
    this.connected = false;

    // 创建弹窗
    this.createModal();

    // 检查是否有保存的用户名，如果有则直接登录
    const savedUsername = this.getSavedUsername();
    if (savedUsername) {
      // 延长等待时间，确保iframe完全加载
      setTimeout(() => {
        if (this.iframeDocument) {
          console.log("使用保存的用户名自动登录:", savedUsername);
          this.username = savedUsername;

          // 先进行预连接获取用户列表
          this.preConnectForUserList();

          // 稍后再连接MQTT，确保获取到了用户列表
          setTimeout(() => {
            // 检查用户名是否已存在
            if (this.userList.includes(savedUsername)) {
              console.log("用户名已存在，需要重新输入");
              // 显示错误消息
              const errorMessage =
                this.iframeDocument.querySelector(".error-message");
              if (errorMessage) {
                errorMessage.textContent = "用户名已被使用，请选择其他名称";
                errorMessage.style.display = "block";
              }

              // 显示登录界面
              const loginContainer =
                this.iframeDocument.querySelector(".login-container");
              const chatContainer =
                this.iframeDocument.querySelector(".chat-container");
              if (loginContainer && chatContainer) {
                loginContainer.style.display = "flex";
                chatContainer.style.display = "none";
              }
            } else {
              // 正常连接
              this.connectMqtt();
            }
          }, 500);
        }
      }, 500); // 增加等待时间到500ms
    }
  }

  /**
   * 连接MQTT服务器
   */
  connectMqtt() {
    // 确保之前的连接被正确清理
    if (this.client) {
      try {
        this.client.end(true);
        this.client = null;
      } catch (error) {
        console.error("清理旧连接失败:", error);
      }
    }

    console.log("开始连接MQTT服务器...");

    // 重置消息历史处理状态
    this.historyProcessed = false;
    this.connected = false;

    // 确保消息队列是干净的
    if (this.iframeDocument) {
      const messageList = this.iframeDocument.querySelector(".message-list");
      if (messageList) {
        messageList.innerHTML = "";
      }

      // 获取容器元素
      const loadingContainer =
        this.iframeDocument.querySelector(".loading-container");
      const chatContainer =
        this.iframeDocument.querySelector(".chat-container");
      const loginContainer =
        this.iframeDocument.querySelector(".login-container");

      // 显示加载状态，隐藏其他界面
      if (loadingContainer && chatContainer && loginContainer) {
        loadingContainer.style.display = "flex";
        chatContainer.style.display = "none";
        loginContainer.style.display = "none";

        // 更新加载文字
        const loadingText = loadingContainer.querySelector(".loading-text");
        if (loadingText) {
          loadingText.textContent = "正在连接聊天服务器...";
        }
      }
    }

    // 加载MQTT客户端库
    if (typeof mqtt === "undefined") {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/mqtt/dist/mqtt.min.js";
      document.head.appendChild(script);

      script.onload = () => {
        this.initMqttConnection();
      };
    } else {
      this.initMqttConnection();
    }
  }

  /**
   * 初始化MQTT连接
   */
  initMqttConnection() {
    // 重新生成clientId，避免重复连接问题
    this.mqttConfig.clientId =
      "chatroom_" + Math.random().toString(16).substr(2, 8);

    const { host, port, path, username, password, clientId } = this.mqttConfig;
    const connectUrl = `ws://${host}:${port}${path}`;

    // 更新加载状态文本
    const loadingContainer =
      this.iframeDocument.querySelector(".loading-container");
    if (loadingContainer) {
      const loadingText = loadingContainer.querySelector(".loading-text");
      if (loadingText) {
        loadingText.textContent = "正在连接聊天服务器...";
      }
    }

    // 添加连接超时处理
    const connectionTimeout = setTimeout(() => {
      if (!this.connected) {
        console.error("MQTT连接超时");
        this.showConnectionError("连接超时，请重试");

        // 如果连接超时，显示登录界面
        if (this.iframeDocument) {
          const loadingContainer =
            this.iframeDocument.querySelector(".loading-container");
          const loginContainer =
            this.iframeDocument.querySelector(".login-container");
          const chatContainer =
            this.iframeDocument.querySelector(".chat-container");

          if (loadingContainer && loginContainer && chatContainer) {
            loadingContainer.style.display = "none";
            loginContainer.style.display = "flex";
            chatContainer.style.display = "none";
          }
        }
      }
    }, 15000); // 增加到15秒超时

    try {
      // 设置更可靠的MQTT连接配置
      this.client = mqtt.connect(connectUrl, {
        clientId,
        username,
        password,
        clean: true,
        keepalive: 30, // 30秒keepalive间隔
        reconnectPeriod: 3000, // 3秒重连间隔
        connectTimeout: 15000, // 增加连接超时时间到15秒
        rejectUnauthorized: false, // 允许自签名证书
        // 禁用缓存，避免连接问题
        properties: {
          sessionExpiryInterval: 0,
        },
      });

      // 连接中断时的回调
      this.client.on("offline", () => {
        console.log("MQTT连接断开，处于离线状态");
        this.connected = false;
        this.displaySystemMessage("连接已断开，正在尝试重新连接...");
      });

      // 重连事件
      this.client.on("reconnect", () => {
        console.log("正在尝试重新连接MQTT...");
        // 不更新UI状态，等待连接成功再处理
      });

      // 设置断开连接时的回调
      this.client.on("disconnect", () => {
        console.log("MQTT断开连接");
        this.connected = false;
        this.displaySystemMessage("与服务器的连接已断开");
      });

      this.client.on("connect", () => {
        console.log("MQTT连接成功");
        this.connected = true;
        clearTimeout(connectionTimeout); // 清除超时定时器

        // 显示系统消息
        if (
          this.iframeDocument.querySelector(".chat-container").style.display ===
          "flex"
        ) {
          this.displaySystemMessage("已成功连接到聊天服务器");
        }

        this.showLoginSuccess();

        // 订阅消息主题
        this.client.subscribe(this.mainTopic, { qos: 1 }, (err) => {
          if (!err) {
            // 发送用户上线消息
            this.publishUserStatus("online");
          } else {
            console.error("订阅主题失败:", err);
          }
        });

        // 订阅用户列表主题
        this.client.subscribe(this.usersTopic, { qos: 1 }, (err) => {
          if (!err) {
            // 请求当前用户列表
            this.requestUserList();
          } else {
            console.error("订阅用户列表主题失败:", err);
          }
        });

        // 订阅历史消息主题
        this.client.subscribe(this.historyTopic, { qos: 1 }, (err) => {
          if (!err) {
            // 请求历史消息
            this.requestHistoryMessages();
          } else {
            console.error("订阅历史消息主题失败:", err);
          }
        });
      });

      this.client.on("message", (topic, message) => {
        try {
          const msg = message.toString();
          const data = JSON.parse(msg);

          if (topic === this.mainTopic) {
            // 处理聊天消息
            if (data.type === "message") {
              // 判断是否需要自动滚动
              const shouldScroll = this.isNearBottom();

              // 显示消息
              this.displayMessage(data);

              // 如果滚动条在底部附近，收到新消息后强制滚动到底部
              if (shouldScroll) {
                this.scrollToBottom();
              }

              // 将消息添加到历史记录
              this.addToMessageHistory(data);
            }
          } else if (topic === this.usersTopic) {
            // 处理用户列表更新
            if (data.type === "user_status") {
              this.updateUserList(data);
            } else if (data.type === "user_list_request") {
              // 响应用户列表请求
              this.respondToUserListRequest();
            } else if (data.type === "user_list") {
              // 更新完整用户列表
              this.setUserList(data.users);
            }
          } else if (topic === this.historyTopic) {
            // 处理历史消息请求
            if (data.type === "history_request") {
              // 响应历史消息请求
              this.respondToHistoryRequest();
            } else if (data.type === "history_response") {
              // 处理历史消息响应
              this.handleHistoryResponse(data);
            }
          }
        } catch (e) {
          console.error(
            "处理消息失败:",
            e,
            "原始消息:",
            message.toString().substring(0, 100) + "..."
          );
        }
      });

      this.client.on("error", (err) => {
        console.error("MQTT连接错误:", err);
        clearTimeout(connectionTimeout); // 清除超时定时器
        this.showConnectionError(err.message);
      });

      this.client.on("close", () => {
        this.connected = false;
        console.log("MQTT连接已关闭");
      });

      // 添加连接结束时的处理
      this.client.on("end", () => {
        this.connected = false;
        console.log("MQTT连接已结束");
      });
    } catch (error) {
      console.error("MQTT连接初始化失败:", error);
      clearTimeout(connectionTimeout); // 清除超时定时器
      this.showConnectionError(error.message || "连接服务器失败");
    }
  }

  /**
   * 断开MQTT连接
   */
  disconnectMqtt() {
    if (this.client) {
      try {
        // 发送用户下线消息
        if (this.connected) {
          this.publishUserStatus("offline");
        }

        // 延迟一下再断开连接，确保消息发送出去
        setTimeout(() => {
          if (this.client) {
            this.client.end(true, () => {
              console.log("MQTT连接已正常断开");
              this.client = null;
            });
            this.connected = false;
            this.username = "";
            this.userList = [];
            // 重置历史消息处理标志
            this.historyProcessed = false;
          }
        }, 500);
      } catch (error) {
        console.error("断开连接失败:", error);
        // 确保状态被重置
        this.client = null;
        this.connected = false;
      }
    }
  }

  /**
   * 发布用户状态（上线/下线）
   */
  publishUserStatus(status, customUsername) {
    if (!this.client || !this.connected) return;

    const message = {
      type: "user_status",
      username: customUsername || this.username,
      status: status,
      timestamp: new Date().getTime(),
    };

    this.client.publish(this.usersTopic, JSON.stringify(message));
  }

  /**
   * 请求当前用户列表
   */
  requestUserList() {
    if (!this.client || !this.connected) return;

    const message = {
      type: "user_list_request",
      username: this.username,
      timestamp: new Date().getTime(),
    };

    this.client.publish(this.usersTopic, JSON.stringify(message));
  }

  /**
   * 响应用户列表请求
   */
  respondToUserListRequest() {
    if (!this.client || !this.connected) return;

    // 只有当自己在线时才响应
    if (this.userList.indexOf(this.username) === -1) {
      this.userList.push(this.username);
    }

    // 随机延时，避免所有用户同时响应
    setTimeout(() => {
      const message = {
        type: "user_list",
        username: this.username,
        users: [this.username],
        timestamp: new Date().getTime(),
      };

      this.client.publish(this.usersTopic, JSON.stringify(message));
    }, Math.random() * 1000);
  }

  /**
   * 更新用户列表
   */
  updateUserList(data) {
    if (data.status === "online") {
      // 用户上线
      if (this.userList.indexOf(data.username) === -1) {
        this.userList.push(data.username);
        this.displaySystemMessage(`${data.username} 加入了聊天室`);
      }
    } else if (data.status === "offline") {
      // 用户下线
      const index = this.userList.indexOf(data.username);
      if (index !== -1) {
        this.userList.splice(index, 1);
        this.displaySystemMessage(`${data.username} 离开了聊天室`);
      }
    }

    // 更新用户列表UI
    this.renderUserList();
  }

  /**
   * 设置完整用户列表
   */
  setUserList(users) {
    if (!Array.isArray(users)) return;

    // 合并用户列表，去重
    users.forEach((user) => {
      if (this.userList.indexOf(user) === -1) {
        this.userList.push(user);
      }
    });

    // 更新用户列表UI
    this.renderUserList();
  }

  /**
   * 滚动到消息容器底部
   */
  scrollToBottom() {
    const messageContainer =
      this.iframeDocument.querySelector(".message-container");
    if (messageContainer) {
      // 使用多次尝试，确保一定会滚动到底部
      // 立即执行一次
      messageContainer.scrollTop = messageContainer.scrollHeight;

      // 短暂延迟后再执行一次
      setTimeout(() => {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }, 10);

      // 再进行一次延时较长的滚动，以应对DOM可能延迟渲染的情况
      setTimeout(() => {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }, 100);
    }
  }

  /**
   * 检查滚动条是否在底部或接近底部
   * @returns {boolean} 是否在底部或接近底部
   */
  isNearBottom() {
    const messageContainer =
      this.iframeDocument.querySelector(".message-container");
    if (!messageContainer) return true;

    // 增加判断阈值，从50px改为100px，使更容易判定为"接近底部"
    const scrollPosition =
      messageContainer.scrollTop + messageContainer.clientHeight;
    const scrollHeight = messageContainer.scrollHeight;

    return scrollHeight - scrollPosition < 100;
  }

  /**
   * 发送聊天消息
   */
  sendMessage(content) {
    if (!content) {
      console.error("无法发送空消息");
      return;
    }

    try {
      const message = {
        type: "message",
        username: this.username,
        content: content,
        timestamp: new Date().getTime(),
      };

      // 发送到服务器保存（持久化存储）
      fetch("/api/chat/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("保存消息到服务器失败");
          }
          return response.json();
        })
        .then((data) => {
          if (!data.success) {
            console.error("服务器保存消息失败:", data.error);
          } else {
            console.log("消息已保存到服务器");
          }
        })
        .catch((error) => {
          console.error("保存消息到服务器出错:", error);
        });

      // 如果MQTT连接正常，也发送到MQTT（实时广播给其他用户）
      if (this.client && this.connected) {
        // 使用QoS 1发送，确保消息至少送达一次
        this.client.publish(
          this.mainTopic,
          JSON.stringify(message),
          { qos: 1 },
          (err) => {
            if (err) {
              console.error("MQTT消息发送失败:", err);
              this.displaySystemMessage("消息发送失败，但已保存到历史记录");
            } else {
              console.log("MQTT消息发送成功");
            }
          }
        );
      } else {
        this.displaySystemMessage(
          "您当前处于离线状态，消息已保存但其他用户无法立即看到"
        );
      }

      // 不在本地显示消息，完全依赖MQTT消息循环，避免消息重复显示
      // this.displayMessage(message);

      // 发送消息后确保滚动到底部（这是用户自己的操作，所以总是滚动）
      this.scrollToBottom();
    } catch (error) {
      console.error("发送消息时发生错误:", error);
      this.displaySystemMessage("消息发送时出错，请重试");
    }
  }

  /**
   * 显示聊天消息
   */
  displayMessage(data, addToHistory = false) {
    const messageList = this.iframeDocument.querySelector(".message-list");
    if (!messageList) return;

    const messageContainer = document.createElement("div");
    messageContainer.className = "message-container-item";

    // 为消息元素添加数据库ID属性（如果有）
    if (data.id) {
      messageContainer.setAttribute("data-message-id", data.id);
    }

    if (data.username === this.username) {
      messageContainer.classList.add("self");
    }

    // 格式化时间戳
    const date = new Date(data.timestamp);
    const timeStr = `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;

    // 格式化完整日期时间，包括星期几
    const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
    const fullDateStr = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date
      .getDate()
      .toString()
      .padStart(2, "0")} ${timeStr} 星期${weekDays[date.getDay()]}`;

    // 根据设置决定显示的时间格式
    const displayTimeStr = this.settings.showFullTime ? fullDateStr : timeStr;

    messageContainer.innerHTML = `
      <div class="message-username">${data.username}</div>
      <div class="message-item">
        <div class="message-content">${this.escapeHtml(data.content)}</div>
      </div>
      <div class="message-time" title="${fullDateStr}">${displayTimeStr}</div>
    `;

    // 将消息添加到列表底部
    messageList.appendChild(messageContainer);

    // 只有自己发送的消息才在这里滚动到底部
    // 其他用户的消息滚动逻辑已在接收MQTT消息时处理
    if (data.username === this.username) {
      this.scrollToBottom();
    }
  }

  /**
   * 显示系统消息
   */
  displaySystemMessage(message) {
    const messageList = this.iframeDocument.querySelector(".message-list");
    if (!messageList) return;

    const messageContainer = document.createElement("div");
    messageContainer.className = "message-container-item system";

    messageContainer.innerHTML = `
      <div class="message-item system">
        <div class="message-content">${message}</div>
      </div>
    `;

    messageList.appendChild(messageContainer);

    // 改进系统消息滚动逻辑，更容易自动滚动到底部
    // 对于用户加入/退出等重要系统消息，应该始终可见
    if (
      this.isNearBottom() ||
      message.includes("加入") ||
      message.includes("离开")
    ) {
      this.scrollToBottom();
    }
  }

  /**
   * 渲染用户列表
   */
  renderUserList() {
    const userListElement = this.iframeDocument.querySelector(".user-list");
    if (!userListElement) return;

    userListElement.innerHTML = "";

    // 按字母排序
    const sortedUsers = [...this.userList].sort();

    sortedUsers.forEach((username) => {
      const userItem = document.createElement("div");
      userItem.className = "user-item";

      // 如果是当前用户，添加特殊样式
      if (username === this.username) {
        userItem.classList.add("self");
      }

      userItem.innerHTML = `
        <span class="user-name">${username}</span>
      `;

      userListElement.appendChild(userItem);
    });

    // 更新用户数量
    const userCountElement = this.iframeDocument.querySelector(".user-count");
    if (userCountElement) {
      userCountElement.textContent = this.userList.length;
    }
  }

  /**
   * 显示登录成功界面
   */
  showLoginSuccess() {
    // 获取容器元素
    const loadingContainer =
      this.iframeDocument.querySelector(".loading-container");
    const loginContainer =
      this.iframeDocument.querySelector(".login-container");
    const chatContainer = this.iframeDocument.querySelector(".chat-container");

    if (loadingContainer && loginContainer && chatContainer) {
      // 隐藏加载和登录界面，显示聊天界面
      loadingContainer.style.display = "none";
      loginContainer.style.display = "none";
      chatContainer.style.display = "flex";

      // 设置欢迎信息
      const welcomeMessage =
        this.iframeDocument.querySelector(".welcome-message");
      if (welcomeMessage) {
        welcomeMessage.textContent = `欢迎，${this.username}！`;
      }

      // 确保消息列表是干净的
      const messageList = this.iframeDocument.querySelector(".message-list");
      if (messageList) {
        messageList.innerHTML = "";
      }

      // 显示系统消息
      this.displaySystemMessage("您已成功加入聊天室");

      // 初始化UI，这里会请求历史消息和初始化滚动加载
      this.initMessageList();

      // 聚焦到输入框
      const messageInput = this.iframeDocument.getElementById("message-input");
      if (messageInput) {
        messageInput.focus();
      }

      // 确保消息显示区域滚动到底部
      this.scrollToBottom();

      console.log("登录成功，显示聊天界面");
    } else {
      console.error("找不到容器元素");
    }
  }

  /**
   * 初始化消息列表
   */
  initMessageList() {
    console.log("初始化消息列表...");

    // 确保历史消息处理标志重置
    this.historyProcessed = false;

    // 请求历史消息
    this.requestHistoryMessages();

    // 初始化滚动加载功能
    this.initScrollLoadMore();

    // 设置简单的超时保护
    setTimeout(() => {
      if (!this.connected) {
        console.log("连接状态异常，不检查历史消息");
        return;
      }

      if (this.messageHistory.length === 0) {
        console.log("历史消息为空，显示开始聊天提示");

        // 清除任何可能存在的系统消息
        this.clearSystemMessages();

        // 显示开始聊天提示
        this.displaySystemMessage("开始聊天吧");
      }
    }, 6000); // 6秒后检查
  }

  /**
   * 添加消息到历史记录
   */
  addToMessageHistory(message) {
    // 检查消息是否已经存在于历史记录中
    const exists = this.messageHistory.some((m) => m.id === message.id);
    if (!exists) {
      console.log("添加新消息到历史记录");
      this.messageHistory.push(message);

      // 如果历史记录超过最大数量，删除最旧的消息
      while (this.messageHistory.length > this.maxHistoryMessages) {
        this.messageHistory.shift();
      }
    }
  }

  /**
   * 处理历史消息响应
   */
  handleHistoryResponse(data) {
    try {
      if (!Array.isArray(data.messages)) {
        console.warn("接收到的历史消息格式不正确", data);
        return;
      }

      // 如果没有历史消息，显示提示
      if (data.messages.length === 0) {
        console.log("接收到空的历史消息列表");
        this.clearSystemMessages();
        this.displaySystemMessage("没有历史消息");
        return;
      }

      // 清空现有消息显示
      const messageList = this.iframeDocument.querySelector(".message-list");
      if (!messageList) return;

      // 首先保留"您已成功加入聊天室"的系统消息
      const successMessage = Array.from(
        messageList.querySelectorAll(".message-container-item.system")
      ).find((el) => el.textContent.includes("成功加入聊天室"));

      // 清空消息列表
      messageList.innerHTML = "";

      // 如果有成功消息，先添加回去
      if (successMessage) {
        messageList.appendChild(successMessage);
      }

      // 获取历史消息并按最新排序(降序)
      const messages = [...data.messages];

      // 显示初始消息（最新的pageSize条）
      const initialMessages = messages.slice(0, this.pageSize);
      console.log("显示历史消息:", initialMessages.length, "条");

      // 显示这些消息
      let displayedCount = 0;
      // 服务器返回的是倒序（最新的在前），直接反向遍历数组显示消息
      for (let i = initialMessages.length - 1; i >= 0; i--) {
        const message = initialMessages[i];
        if (message.type === "message") {
          this.displayMessage(message);
          displayedCount++;
        }
      }

      // 更新加载状态
      this.currentPage = 1;
      this.allMessagesLoaded = messages.length <= this.pageSize;

      // 如果有更多历史消息可以加载，显示加载提示
      if (!this.allMessagesLoaded) {
        this.displayLoadMoreMessages();
      }

      // 显示系统消息，仅当确实有消息时才显示
      if (displayedCount > 0) {
        this.displaySystemMessage(`已加载 ${displayedCount} 条历史消息`);
      } else {
        this.displaySystemMessage("没有历史消息");
      }

      // 确保滚动到底部
      this.scrollToBottom();
    } catch (error) {
      console.error("处理历史消息时发生错误:", error);
      this.clearSystemMessages();
      this.displaySystemMessage("历史消息加载失败");
    }
  }

  /**
   * 清除系统消息
   */
  clearSystemMessages() {
    const messageList = this.iframeDocument.querySelector(".message-list");
    if (messageList) {
      const systemMessages = messageList.querySelectorAll(
        ".message-container-item.system"
      );
      systemMessages.forEach((msg) => {
        // 保留"您已成功加入聊天室"消息
        if (!msg.textContent.includes("成功加入聊天室")) {
          msg.remove();
        }
      });
    }
  }

  /**
   * 显示连接错误
   */
  showConnectionError(message) {
    // 获取容器元素
    const loadingContainer =
      this.iframeDocument.querySelector(".loading-container");
    const loginContainer =
      this.iframeDocument.querySelector(".login-container");

    // 隐藏加载状态，显示登录界面
    if (loadingContainer && loginContainer) {
      loadingContainer.style.display = "none";
      loginContainer.style.display = "flex";
    }

    // 显示错误消息
    const errorMessage = this.iframeDocument.querySelector(".error-message");
    if (errorMessage) {
      errorMessage.textContent = `连接错误: ${message}`;
      errorMessage.style.display = "block";

      // 3秒后隐藏错误消息
      setTimeout(() => {
        errorMessage.style.display = "none";
      }, 3000);
    }
  }

  /**
   * 转义HTML特殊字符
   */
  escapeHtml(html) {
    const div = document.createElement("div");
    div.textContent = html;
    return div.innerHTML;
  }

  /**
   * 获取iframe内容
   */
  getIframeContent() {
    // 初始显示加载界面，在脚本逻辑中再决定显示登录界面还是聊天界面
    return `
      <!DOCTYPE html>
      <html lang="zh">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>聊天室</title>
        <!-- MQTT 客户端 -->
        <script src="https://unpkg.com/mqtt/dist/mqtt.min.js"></script>
        <!-- Font Awesome 图标 -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <!-- Emoji Mart -->
        <link rel="stylesheet" href="https://unpkg.com/emoji-mart@latest/css/emoji-mart.css">
        <script type="module" src="https://unpkg.com/emoji-mart@latest/dist/browser.js"></script>
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
            position: relative;
          }
          .header {
            background-color: #3b82f6;
            color: white;
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
          .header-buttons {
            display: flex;
            align-items: center;
          }
          .settings-btn, .close-btn {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            color: white;
            cursor: pointer;
            transition: all 0.2s;
            border-radius: 50%;
            margin-left: 10px;
          }
          .settings-btn:hover, .close-btn:hover {
            background-color: rgba(255,255,255,0.2);
          }
          
          /* 设置面板 */
          .settings-panel {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
          }
          
          .settings-panel-content {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            width: 90%;
            max-width: 400px;
            overflow: hidden;
          }
          
          .settings-header {
            padding: 15px;
            background-color: #f9fafb;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .settings-header h3 {
            margin: 0;
            font-size: 18px;
            color: #1f2937;
          }
          
          .settings-close-btn {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            color: #6b7280;
            cursor: pointer;
            border-radius: 50%;
            transition: all 0.2s;
          }
          
          .settings-close-btn:hover {
            background-color: #e5e7eb;
          }
          
          .settings-body {
            padding: 15px;
          }
          
          .setting-item {
            padding: 10px 0;
            display: flex;
            flex-direction: column;
            border-bottom: 1px solid #e5e7eb;
            position: relative;
            padding-right: 60px;
          }
          
          .setting-item:last-child {
            border-bottom: none;
          }
          
          .setting-label {
            font-weight: 500;
            color: #1f2937;
            margin-bottom: 5px;
          }
          
          .setting-desc {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 5px;
          }
          
          /* 开关样式 */
          .switch {
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 46px;
            height: 24px;
          }
          
          .switch input {
            opacity: 0;
            width: 0;
            height: 0;
          }
          
          .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #e5e7eb;
            transition: .4s;
            border-radius: 34px;
          }
          
          .slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
          }
          
          input:checked + .slider {
            background-color: #3b82f6;
          }
          
          input:checked + .slider:before {
            transform: translateX(22px);
          }
          
          /* 用户名修改样式 */
          .username-change-form {
            display: flex;
            margin-top: 8px;
            margin-bottom: 8px;
          }
          
          .new-username-input {
            flex: 1;
            padding: 8px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-size: 14px;
            margin-right: 8px;
          }
          
          .change-username-btn {
            padding: 8px 16px;
            background-color: #3b82f6;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s;
          }
          
          .change-username-btn:hover {
            background-color: #2563eb;
          }
          
          .username-error-message {
            font-size: 13px;
            color: #ef4444;
            margin-top: 4px;
            display: none;
          }
          
          /* 加载动画容器 */
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex: 1;
            background-color: #f8f9fa;
          }
          
          /* 加载动画 */
          .loading-spinner {
            width: 50px;
            height: 50px;
            border: 5px solid #e5e7eb;
            border-radius: 50%;
            border-top-color: #3b82f6;
            animation: spinner 1s linear infinite;
            margin-bottom: 20px;
          }
          
          @keyframes spinner {
            to {
              transform: rotate(360deg);
            }
          }
          
          .loading-text {
            color: #4b5563;
            font-size: 16px;
            font-weight: 500;
          }
          
          /* 登录容器 */
          .login-container {
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex: 1;
            padding: 20px;
          }
          .login-card {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 30px;
            width: 100%;
            max-width: 320px;
            text-align: center;
          }
          .login-title {
            font-size: 24px;
            margin-bottom: 20px;
            color: #3b82f6;
          }
          .login-form input {
            width: 100%;
            padding: 10px;
            margin-bottom: 15px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
          }
          .login-form button {
            width: 100%;
            padding: 10px;
            background-color: #3b82f6;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          .login-form button:hover {
            background-color: #2563eb;
          }
          .error-message {
            color: #ef4444;
            margin-top: 10px;
            display: none;
          }
          
          /* 聊天容器 */
          .chat-container {
            display: none;
            flex: 1;
            flex-direction: row;
            overflow: hidden;
          }
          
          /* 消息区域 */
          .chat-main {
            flex: 1;
            display: flex;
            flex-direction: column;
            border-right: 1px solid #e5e7eb;
          }
          .welcome-bar {
            padding: 10px 15px;
            background-color: #f3f4f6;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .welcome-message {
            font-weight: 500;
            color: #4b5563;
          }
          .message-container {
            flex: 1;
            overflow-y: auto;
            padding: 15px;
            background-color: white;
          }
          .message-list {
            display: flex;
            flex-direction: column;
          }
          .message-container-item {
            max-width: 80%;
            margin-bottom: 15px;
            align-self: flex-start;
            display: flex;
            flex-direction: column;
          }
          .message-container-item.self {
            align-self: flex-end;
            align-items: flex-end;
          }
          .message-container-item.system {
            align-self: center;
            max-width: 100%;
          }
          .message-item {
            padding: 10px;
            border-radius: 8px;
            background-color: #f3f4f6;
            margin: 4px 0;
          }
          .message-container-item.self .message-item {
            background-color: #dbeafe;
          }
          .message-item.system {
            background-color: #f8fafc;
            color: #64748b;
            font-style: italic;
            font-size: 14px;
            text-align: center;
            padding: 5px 10px;
          }
          .message-username {
            font-weight: 500;
            color: #4b5563;
            font-size: 14px;
            margin-bottom: 2px;
          }
          .message-content {
            word-break: break-word;
            white-space: pre-wrap; /* 保留换行符和空格 */
          }
          .message-time {
            font-size: 12px;
            color: #9ca3af;
            margin-top: 2px;
            cursor: help;
          }
          
          /* 加载更多指示器 */
          .load-more-indicator {
            text-align: center;
            padding: 10px;
            color: #6b7280;
            font-size: 12px;
            background-color: #f9fafb;
            border-radius: 4px;
            margin: 5px 0;
            cursor: pointer;
            border: 1px dashed #e5e7eb;
          }
          
          /* 输入区域 */
          .message-input-container {
            padding: 10px 15px;
            background-color: #f9fafb;
            border-top: 1px solid #e5e7eb;
            position: relative; /* 添加相对定位以便绝对定位表情选择器 */
          }
          .message-form {
            display: flex;
            align-items: flex-start; /* 改为顶部对齐 */
          }
          #emoji-button { /* 表情按钮样式 */
            padding: 8px 10px;
            font-size: 18px;
            background: none;
            border: none;
            cursor: pointer;
            color: #6b7280;
            align-self: center; /* 垂直居中 */
            margin-right: 5px;
            transition: color 0.2s;
          }
          #emoji-button:hover {
            color: #3b82f6;
          }
          .message-form textarea {
            flex: 1;
            padding: 10px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            margin-right: 10px;
            font-size: 14px;
            min-height: 38px; /* 初始高度 */
            max-height: 150px; /* 最大高度约为6行 */
            resize: none; /* 禁止用户手动调整大小 */
            overflow-y: auto; /* 超出高度限制显示滚动条 */
            line-height: 1.5;
          }
          .message-form button {
            padding: 10px 20px;
            background-color: #3b82f6;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.2s;
            align-self: flex-start; /* 确保按钮位置固定在顶部 */
          }
          .message-form button:hover {
            background-color: #2563eb;
          }
          
          /* 表情选择器容器 */
          #emoji-picker-container {
            position: absolute;
            bottom: 60px; /* 调整位置，使其在输入框上方 */
            left: 10px;
            z-index: 100;
            display: none;
          }
          
          /* 用户列表区域 */
          .chat-sidebar {
            width: 180px;
            display: flex;
            flex-direction: column;
            background-color: #f9fafb;
          }
          .user-list-header {
            padding: 10px 15px;
            background-color: #f3f4f6;
            border-bottom: 1px solid #e5e7eb;
            font-weight: 500;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .user-count {
            background-color: #e5e7eb;
            border-radius: 10px;
            padding: 2px 8px;
            font-size: 12px;
            color: #4b5563;
          }
          .user-list-container {
            flex: 1;
            overflow-y: auto;
            padding: 10px;
          }
          .user-list {
            display: flex;
            flex-direction: column;
          }
          .user-item {
            display: flex;
            align-items: center;
            padding: 8px 12px;
            border-radius: 4px;
            margin-bottom: 5px;
            transition: background-color 0.2s;
          }
          .user-item:hover {
            background-color: #f3f4f6;
          }
          .user-item.self {
            background-color: #e5e7eb;
          }
          .user-name {
            color: #4b5563;
            font-weight: 500;
          }
          .user-item.self .user-name {
            color: #3b82f6;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="title">聊天室</div>
            <div class="header-buttons">
              <div class="settings-btn" title="打开设置">
                <i class="fas fa-cog"></i>
              </div>
              <div class="close-btn">
                <i class="fas fa-times"></i>
              </div>
            </div>
          </div>
          
          <!-- 加载动画 -->
          <div class="loading-container">
            <div class="loading-spinner"></div>
            <div class="loading-text">正在连接聊天服务器...</div>
          </div>
          
          <!-- 登录页面 -->
          <div class="login-container">
            <div class="login-card">
              <div class="login-title">加入聊天</div>
              <form id="login-form" class="login-form">
                <input type="text" id="username-input" placeholder="请输入你的昵称" required />
                <button type="submit">加入聊天室</button>
              </form>
              <div class="error-message"></div>
            </div>
          </div>
          
          <!-- 聊天页面 -->
          <div class="chat-container">
            <!-- 聊天主区域 -->
            <div class="chat-main">
              <div class="welcome-bar">
                <div class="welcome-message">欢迎来到聊天室！</div>
              </div>
              
              <div class="message-container">
                <div class="message-list">
                  <!-- 消息将动态插入这里 -->
                </div>
              </div>
              
              <div class="message-input-container">
                <form id="message-form" class="message-form">
                  <button type="button" id="emoji-button" title="选择表情">😀</button>
                  <textarea id="message-input" placeholder="输入消息..." rows="1"></textarea>
                  <button type="submit">发送</button>
                </form>
                <!-- 表情选择器将插入这里 -->
                <div id="emoji-picker-container"></div>
              </div>
            </div>
            
            <!-- 用户列表侧边栏 -->
            <div class="chat-sidebar">
              <div class="user-list-header">
                <span>在线用户</span>
                <span class="user-count">0</span>
              </div>
              
              <div class="user-list-container">
                <div class="user-list">
                  <!-- 用户列表将动态插入这里 -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * 请求历史消息
   */
  requestHistoryMessages() {
    // 如果已经处理过历史消息，不再重复请求
    if (this.historyProcessed) {
      console.log("历史消息已处理，跳过重复请求");
      return;
    }

    // 设置标志，避免重复请求
    this.historyProcessed = true;

    // 直接从服务器API获取历史消息
    console.log("从服务器请求历史消息...");

    try {
      // 清空可能存在的系统消息
      this.clearSystemMessages();

      // 先显示一条加载提示
      this.displaySystemMessage("正在加载历史消息...");

      // 从服务器获取持久化的历史记录
      fetch("/api/chat/history?direct=true")
        .then((response) => {
          if (!response.ok) {
            throw new Error("获取历史消息失败");
          }
          return response.json();
        })
        .then((data) => {
          // 清除加载消息
          this.clearSystemMessages();

          if (
            data.success &&
            Array.isArray(data.messages) &&
            data.messages.length > 0
          ) {
            console.log(`从服务器获取到${data.messages.length}条历史消息`);

            // 构造历史消息响应格式
            const historyResponse = {
              type: "history_response",
              username: "server",
              messages: data.messages,
              timestamp: new Date().getTime(),
              count: data.messages.length,
            };

            // 处理历史消息
            this.handleHistoryResponse(historyResponse);
          } else {
            console.log("服务器没有历史消息记录");
            // 直接显示没有历史消息
            this.displaySystemMessage("没有历史消息");
          }
        })
        .catch((error) => {
          console.error("获取服务器历史消息失败:", error);
          // 清除加载消息
          this.clearSystemMessages();
          this.displaySystemMessage("获取历史消息失败");
        });
    } catch (error) {
      console.error("请求历史消息失败:", error);
      // 清除加载消息
      this.clearSystemMessages();
      this.displaySystemMessage("请求历史消息失败");
    }
  }

  /**
   * 响应历史消息请求
   */
  respondToHistoryRequest() {
    // 此方法已不再需要，保留空方法以保持兼容性
    return;
  }

  /**
   * 初始化滚动加载更多功能
   */
  initScrollLoadMore() {
    const messageContainer =
      this.iframeDocument.querySelector(".message-container");
    if (!messageContainer) return;

    // 移除之前的滚动事件监听器（如果有）
    if (this.scrollHandler) {
      messageContainer.removeEventListener("scroll", this.scrollHandler);
    }

    // 创建新的滚动事件监听器
    this.scrollHandler = () => {
      // 如果已经在加载，或者所有消息都已加载，则不处理
      if (this.isLoadingMoreMessages || this.allMessagesLoaded) return;

      // 当滚动到顶部附近时（小于50px），加载更多消息
      if (messageContainer.scrollTop < 50) {
        this.loadMoreMessages();
      }
    };

    // 添加滚动事件监听
    messageContainer.addEventListener("scroll", this.scrollHandler);
  }

  /**
   * 加载更多历史消息
   */
  loadMoreMessages() {
    if (this.isLoadingMoreMessages || this.allMessagesLoaded) return;

    this.isLoadingMoreMessages = true;

    // 显示加载中状态
    const loadingIndicator = this.iframeDocument.querySelector(
      ".load-more-indicator"
    );
    if (loadingIndicator) {
      loadingIndicator.textContent = "正在加载历史消息...";
      // 添加加载样式
      loadingIndicator.style.backgroundColor = "#eef2ff";
      loadingIndicator.style.color = "#4f46e5";
    }

    // 增加页码
    this.currentPage++;

    // 从服务器获取更多历史消息
    const pageSize = this.pageSize;
    fetch(
      `/api/chat/history?page=${this.currentPage}&pageSize=${pageSize}&direct=true`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("获取更多历史消息失败");
        }
        return response.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.messages)) {
          // 检查是否已加载所有消息
          if (data.messages.length === 0) {
            this.allMessagesLoaded = true;

            // 更新加载指示器
            if (loadingIndicator) {
              loadingIndicator.textContent = "已加载全部历史消息";
              loadingIndicator.style.backgroundColor = "#f0fdf4";
              loadingIndicator.style.color = "#15803d";

              // 几秒后删除指示器
              setTimeout(() => {
                loadingIndicator.remove();
              }, 2000);
            }

            this.isLoadingMoreMessages = false;
            return;
          }

          // 记住滚动位置
          const messageList =
            this.iframeDocument.querySelector(".message-list");
          const firstMessage = messageList.firstChild;
          const originalHeight = firstMessage ? firstMessage.offsetTop : 0;

          // 在顶部添加消息
          // 服务器返回的是倒序（最新的在前），正向遍历数组（从索引0开始）
          // 这样最老的消息会先被添加到顶部，确保显示顺序正确
          for (let i = 0; i < data.messages.length; i++) {
            const message = data.messages[i];
            if (message.type === "message") {
              this.prependMessage(message);
            }
          }

          // 恢复滚动位置
          const messageContainer =
            this.iframeDocument.querySelector(".message-container");
          if (messageContainer && firstMessage) {
            const newHeight = firstMessage.offsetTop;
            const scrollOffset = newHeight - originalHeight;
            messageContainer.scrollTop += scrollOffset;
          }

          // 检查是否还有更多消息
          this.allMessagesLoaded = data.messages.length < pageSize;

          // 更新加载指示器
          if (loadingIndicator) {
            if (this.allMessagesLoaded) {
              loadingIndicator.textContent = "已加载全部历史消息";
              loadingIndicator.style.backgroundColor = "#f0fdf4";
              loadingIndicator.style.color = "#15803d";

              // 几秒后删除指示器
              setTimeout(() => {
                loadingIndicator.remove();
              }, 2000);
            } else {
              loadingIndicator.textContent = "点击或上滑加载更多";
              loadingIndicator.style.backgroundColor = "";
              loadingIndicator.style.color = "";
            }
          }
        } else {
          // 处理错误情况
          if (loadingIndicator) {
            loadingIndicator.textContent = "加载失败，点击重试";
            loadingIndicator.style.backgroundColor = "#fee2e2";
            loadingIndicator.style.color = "#b91c1c";
          }
        }

        this.isLoadingMoreMessages = false;
      })
      .catch((error) => {
        console.error("加载更多历史消息失败:", error);
        // 更新加载指示器显示错误
        if (loadingIndicator) {
          loadingIndicator.textContent = "加载失败，点击重试";
          loadingIndicator.style.backgroundColor = "#fee2e2";
          loadingIndicator.style.color = "#b91c1c";
        }
        this.isLoadingMoreMessages = false;
      });
  }

  /**
   * 在消息列表顶部添加消息
   */
  prependMessage(data) {
    const messageList = this.iframeDocument.querySelector(".message-list");
    if (!messageList) return;

    const messageContainer = document.createElement("div");
    messageContainer.className = "message-container-item";

    if (data.username === this.username) {
      messageContainer.classList.add("self");
    }

    // 格式化时间戳
    const date = new Date(data.timestamp);
    const timeStr = `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;

    // 格式化完整日期时间，包括星期几
    const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
    const fullDateStr = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date
      .getDate()
      .toString()
      .padStart(2, "0")} ${timeStr} 星期${weekDays[date.getDay()]}`;

    // 根据设置决定显示的时间格式
    const displayTimeStr = this.settings.showFullTime ? fullDateStr : timeStr;

    messageContainer.innerHTML = `
      <div class="message-username">${data.username}</div>
      <div class="message-item">
        <div class="message-content">${this.escapeHtml(data.content)}</div>
      </div>
      <div class="message-time" title="${fullDateStr}">${displayTimeStr}</div>
    `;

    // 获取加载提示元素
    const loadMoreIndicator = messageList.querySelector(".load-more-indicator");

    // 在加载提示后面插入消息（如果存在加载提示）
    if (loadMoreIndicator) {
      messageList.insertBefore(messageContainer, loadMoreIndicator.nextSibling);
    } else {
      // 否则在列表顶部插入
      messageList.insertBefore(messageContainer, messageList.firstChild);
    }
  }

  /**
   * 显示"加载更多消息"提示
   */
  displayLoadMoreMessages() {
    const messageList = this.iframeDocument.querySelector(".message-list");
    if (!messageList) return;

    // 检查是否已存在加载提示
    if (this.iframeDocument.querySelector(".load-more-indicator")) return;

    console.log("显示加载更多消息指示器");

    // 创建加载提示元素
    const loadMoreElement = document.createElement("div");
    loadMoreElement.className = "load-more-indicator";
    loadMoreElement.textContent = "点击或上滑加载更多";

    // 添加点击事件
    loadMoreElement.addEventListener("click", () => {
      if (!this.isLoadingMoreMessages && !this.allMessagesLoaded) {
        this.loadMoreMessages();
      }
    });

    // 添加到消息列表顶部
    messageList.insertBefore(loadMoreElement, messageList.firstChild);
  }

  /**
   * 创建弹窗
   */
  createModal() {
    // 检查是否已存在弹窗
    if (document.getElementById("chat-room-modal")) {
      document.getElementById("chat-room-modal").remove();
    }

    // 重置相关状态变量
    this.historyProcessed = false;
    this.allMessagesLoaded = false;
    this.currentPage = 1;

    // 加载用户设置
    this.loadSettings();

    // 创建弹窗容器
    const modal = document.createElement("div");
    modal.id = "chat-room-modal";
    modal.className =
      "fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75";

    // 点击背景关闭弹窗
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.disconnectMqtt();
        modal.remove();
      }
    });

    // 创建弹窗内容
    const modalContent = document.createElement("div");
    modalContent.className =
      "relative bg-white rounded-lg shadow-xl w-full max-w-4xl h-full md:h-4/5 flex flex-col";
    modalContent.addEventListener("click", (e) => e.stopPropagation());

    // 创建iframe
    const iframe = document.createElement("iframe");
    iframe.id = "chat-room-iframe";
    iframe.className = "w-full h-full flex-grow border-none";
    iframe.srcdoc = this.getIframeContent();

    // 添加到DOM
    modalContent.appendChild(iframe);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // 设置iframe加载完成后的事件
    iframe.onload = () => {
      const iframeWindow = iframe.contentWindow;

      // 保存对iframe内部元素的引用
      this.iframeDocument = iframeWindow.document;
      this.iframeWindow = iframeWindow; // 保存对 window 的引用

      // 获取各个容器元素
      const loadingContainer =
        this.iframeDocument.querySelector(".loading-container");
      const loginContainer =
        this.iframeDocument.querySelector(".login-container");
      const chatContainer =
        this.iframeDocument.querySelector(".chat-container");
      const errorMessage = this.iframeDocument.querySelector(".error-message");
      const messageInput = this.iframeDocument.getElementById("message-input"); // 统一获取 messageInput
      const messageForm = this.iframeDocument.getElementById("message-form"); // 统一获取 messageForm

      // 添加设置按钮点击事件
      const settingsBtn = this.iframeDocument.querySelector(".settings-btn");
      if (settingsBtn) {
        settingsBtn.addEventListener("click", () => {
          this.showSettingsPanel();
        });
      }

      // 设置登录表单事件
      const loginForm = this.iframeDocument.getElementById("login-form");
      if (loginForm) {
        // 填充保存的用户名
        const savedUsername = this.getSavedUsername();
        const usernameInput =
          this.iframeDocument.getElementById("username-input");
        if (usernameInput && savedUsername) {
          usernameInput.value = savedUsername;
        }

        // 预先获取在线用户列表，检查用户名是否可用
        this.preConnectForUserList();

        // 设置一个计时器检查用户名状态
        setTimeout(() => {
          if (loadingContainer) {
            // 已保存的用户名检查逻辑
            if (savedUsername) {
              console.log("检查已保存的用户名是否可用:", savedUsername);

              // 检查用户名是否已存在
              if (this.userList.includes(savedUsername)) {
                console.log("用户名已存在，需要重新输入");
                // 显示错误消息
                if (errorMessage) {
                  errorMessage.textContent = "用户名已被使用，请选择其他名称";
                  errorMessage.style.display = "block";
                }

                // 从加载界面切换到登录界面
                loadingContainer.style.display = "none";
                loginContainer.style.display = "flex";
              } else {
                console.log("用户名可用，自动登录");
                // 用户名可用，直接登录
                this.username = savedUsername;
                this.connectMqtt();

                // 从加载界面直接切换到聊天界面
                loadingContainer.style.display = "none";
                chatContainer.style.display = "flex";
              }
            } else {
              // 没有保存的用户名，显示登录界面
              console.log("没有保存的用户名，显示登录界面");
              loadingContainer.style.display = "none";
              loginContainer.style.display = "flex";
            }
          }
        }, 1000); // 给一定时间让预连接获取用户列表

        loginForm.addEventListener("submit", (e) => {
          e.preventDefault();
          const usernameInput =
            this.iframeDocument.getElementById("username-input");
          const errorMessage =
            this.iframeDocument.querySelector(".error-message");

          if (usernameInput && usernameInput.value.trim()) {
            const newUsername = usernameInput.value.trim();

            // 检查用户名是否已存在
            if (this.userList.includes(newUsername)) {
              if (errorMessage) {
                errorMessage.textContent = "用户名已被使用，请选择其他名称";
                errorMessage.style.display = "block";
              }
              return;
            }

            // 显示加载状态
            loginContainer.style.display = "none";
            loadingContainer.style.display = "flex";

            // 保存用户名到本地存储
            this.saveUsernameToStorage(newUsername);
            this.username = newUsername;
            this.connectMqtt();
          }
        });
      }

      // 设置消息表单事件
      if (messageForm) {
        messageForm.addEventListener("submit", (e) => {
          e.preventDefault();
          if (messageInput && messageInput.value.trim() && this.connected) {
            this.sendMessage(messageInput.value.trim());
            messageInput.value = "";
            // 重置文本域高度
            this.autoResizeTextarea(messageInput);
          }
        });
      }

      // 设置文本域自适应高度和shift+enter事件
      if (messageInput) {
        // 自动调整高度
        messageInput.addEventListener("input", () => {
          this.autoResizeTextarea(messageInput);
        });

        // 处理shift+enter换行
        messageInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            if (e.shiftKey) {
              // shift+enter, 不提交表单，允许换行
              // 不需要做任何事，默认行为会插入换行符
            } else {
              // 普通enter键，提交表单
              e.preventDefault();
              if (messageInput.value.trim() && this.connected) {
                this.sendMessage(messageInput.value.trim());
                messageInput.value = "";
                // 重置文本域高度
                this.autoResizeTextarea(messageInput);
              }
            }
          }
        });

        // 初始调整高度
        this.autoResizeTextarea(messageInput);
      }

      // 关闭按钮事件
      const closeBtn = this.iframeDocument.querySelector(".close-btn");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => {
          this.disconnectMqtt();
          modal.remove();
        });
      }

      // ---- 新增：表情按钮和选择器逻辑 ----
      const emojiButton = this.iframeDocument.getElementById("emoji-button");
      const emojiPickerContainer = this.iframeDocument.getElementById(
        "emoji-picker-container"
      );
      // const messageInput = this.iframeDocument.getElementById("message-input"); // 已在上面获取
      let pickerInstance = null; // 用于存储表情选择器实例

      if (emojiButton && emojiPickerContainer && messageInput) {
        emojiButton.addEventListener("click", (event) => {
          event.stopPropagation(); // 阻止事件冒泡到全局点击事件

          if (emojiPickerContainer.style.display === "block") {
            emojiPickerContainer.style.display = "none";
          } else {
            // 检查 EmojiMart 是否已加载
            if (typeof this.iframeWindow.EmojiMart === "undefined") {
              console.error("EmojiMart 库未加载");
              // 可以在这里添加加载提示或重试逻辑
              return;
            }

            // 如果选择器尚未初始化，则创建它
            if (!pickerInstance) {
              pickerInstance = new this.iframeWindow.EmojiMart.Picker({
                data: async () => {
                  // 使用异步 data 加载表情数据
                  const response = await fetch(
                    "https://cdn.jsdelivr.net/npm/@emoji-mart/data/sets/14/native.json"
                  );
                  return response.json();
                },
                locale: "zh", // 设置中文
                theme: "light", // 主题
                previewPosition: "none", // 不显示预览
                searchPosition: "none", // 不显示搜索框 (可选)
                onEmojiSelect: (emoji) => {
                  this.insertTextAtCursor(messageInput, emoji.native);
                  emojiPickerContainer.style.display = "none"; // 选择后关闭选择器
                  messageInput.focus(); // 将焦点移回输入框
                  this.autoResizeTextarea(messageInput); // 插入表情后重新计算高度
                },
              });
              emojiPickerContainer.appendChild(pickerInstance);
            }
            emojiPickerContainer.style.display = "block";
          }
        });

        // 点击页面其他地方关闭表情选择器
        this.iframeDocument.addEventListener("click", (event) => {
          if (
            emojiPickerContainer.style.display === "block" &&
            !emojiPickerContainer.contains(event.target)
          ) {
            emojiPickerContainer.style.display = "none";
          }
        });
      }
      // ---- 新增结束 ----
    };

    // 监听ESC键关闭
    const escHandler = (e) => {
      if (e.key === "Escape") {
        const modal = document.getElementById("chat-room-modal");
        if (modal) {
          this.disconnectMqtt();
          modal.remove();
        }
        document.removeEventListener("keydown", escHandler);
      }
    };

    document.addEventListener("keydown", escHandler);
  }

  /**
   * 预连接获取用户列表
   */
  preConnectForUserList() {
    // 创建临时连接获取用户列表
    const { host, port, path, username, password } = this.mqttConfig;
    const tempClientId = "temp_" + Math.random().toString(16).substr(2, 8);
    const connectUrl = `ws://${host}:${port}${path}`;

    // 先清空用户列表，避免旧数据干扰
    this.userList = [];

    console.log("预连接获取用户列表...");

    try {
      if (typeof mqtt === "undefined") {
        // 如果mqtt库未加载，先加载mqtt库
        const script = document.createElement("script");
        script.src = "https://unpkg.com/mqtt/dist/mqtt.min.js";
        document.head.appendChild(script);

        script.onload = () => {
          this.createTempConnection(
            connectUrl,
            tempClientId,
            username,
            password
          );
        };
      } else {
        this.createTempConnection(connectUrl, tempClientId, username, password);
      }
    } catch (error) {
      console.error("预连接失败:", error);
    }
  }

  /**
   * 创建临时连接获取用户列表
   */
  createTempConnection(connectUrl, clientId, username, password) {
    const tempClient = mqtt.connect(connectUrl, {
      clientId,
      username,
      password,
      clean: true,
      connectTimeout: 10000, // 增加连接超时时间
    });

    let connectionTimeout;
    let responseReceived = false;

    // 设置连接超时处理
    connectionTimeout = setTimeout(() => {
      if (!responseReceived) {
        console.log("预连接获取用户列表超时");
        try {
          tempClient.end();
        } catch (e) {
          console.error("关闭临时连接失败:", e);
        }
      }
    }, 8000);

    tempClient.on("connect", () => {
      console.log("预连接成功，获取用户列表...");
      // 订阅用户列表主题
      tempClient.subscribe(this.usersTopic, () => {
        // 请求当前用户列表
        const message = {
          type: "user_list_request",
          username: "temp_user",
          timestamp: new Date().getTime(),
        };

        // 多发几次请求，提高成功率
        tempClient.publish(this.usersTopic, JSON.stringify(message));

        // 500ms后再发一次
        setTimeout(() => {
          tempClient.publish(this.usersTopic, JSON.stringify(message));
        }, 500);

        // 5秒后断开连接
        setTimeout(() => {
          clearTimeout(connectionTimeout);
          console.log("预连接完成，断开连接");
          tempClient.end();
        }, 5000);
      });
    });

    tempClient.on("message", (topic, message) => {
      if (topic === this.usersTopic) {
        try {
          responseReceived = true;
          const data = JSON.parse(message.toString());

          if (data.type === "user_list") {
            // 更新用户列表
            if (Array.isArray(data.users)) {
              data.users.forEach((user) => {
                if (!this.userList.includes(user)) {
                  this.userList.push(user);
                }
              });
              console.log("预连接获取到用户列表:", this.userList);
            }
          } else if (data.type === "user_status" && data.status === "online") {
            // 添加新上线用户
            if (!this.userList.includes(data.username)) {
              this.userList.push(data.username);
            }
          }
        } catch (e) {
          console.error("解析消息失败:", e);
        }
      }
    });

    tempClient.on("error", (err) => {
      console.error("预连接MQTT错误:", err);
      clearTimeout(connectionTimeout);
    });
  }

  /**
   * 加载用户设置
   */
  loadSettings() {
    try {
      const savedSettings = localStorage.getItem(this.storageSettingsKey);
      if (savedSettings) {
        this.settings = JSON.parse(savedSettings);
      }
    } catch (error) {
      console.error("加载设置失败:", error);
    }
  }

  /**
   * 保存用户设置
   */
  saveSettings() {
    try {
      localStorage.setItem(
        this.storageSettingsKey,
        JSON.stringify(this.settings)
      );
    } catch (error) {
      console.error("保存设置失败:", error);
    }
  }

  /**
   * 切换时间显示模式
   */
  toggleTimeDisplay() {
    this.settings.showFullTime = !this.settings.showFullTime;
    this.saveSettings();
    this.updateAllMessageTimes();

    // 更新设置面板中的开关状态
    const timeFormatSwitch = this.iframeDocument.querySelector(
      "#setting-time-format"
    );
    if (timeFormatSwitch) {
      timeFormatSwitch.checked = this.settings.showFullTime;
    }
  }

  /**
   * 显示设置面板
   */
  showSettingsPanel() {
    // 检查是否已存在设置面板
    let settingsPanel = this.iframeDocument.querySelector(".settings-panel");

    if (settingsPanel) {
      // 如果已存在，则显示
      settingsPanel.style.display = "flex";
      return;
    }

    // 创建设置面板
    settingsPanel = document.createElement("div");
    settingsPanel.className = "settings-panel";

    // 设置面板内容
    settingsPanel.innerHTML = `
      <div class="settings-panel-content">
        <div class="settings-header">
          <h3>聊天设置</h3>
          <div class="settings-close-btn">
            <i class="fas fa-times"></i>
          </div>
        </div>
        <div class="settings-body">
          <div class="setting-item">
            <div class="setting-label">显示完整时间</div>
            <div class="setting-desc">显示年-月-日 时:分:秒 星期几</div>
            <label class="switch">
              <input type="checkbox" id="setting-time-format" ${
                this.settings.showFullTime ? "checked" : ""
              }>
              <span class="slider"></span>
            </label>
          </div>
          <div class="setting-item username-setting">
            <div class="setting-label">修改用户名</div>
            <div class="setting-desc">修改您在聊天室中显示的名称</div>
            <div class="username-change-form">
              <input type="text" id="new-username-input" class="new-username-input" placeholder="输入新用户名" value="${
                this.username
              }">
              <button id="change-username-btn" class="change-username-btn">修改</button>
            </div>
            <div class="username-error-message"></div>
          </div>
        </div>
      </div>
    `;

    // 添加到容器
    const container = this.iframeDocument.querySelector(".container");
    container.appendChild(settingsPanel);

    // 添加关闭按钮事件
    const closeBtn = settingsPanel.querySelector(".settings-close-btn");
    closeBtn.addEventListener("click", () => {
      settingsPanel.style.display = "none";
    });

    // 点击面板外部关闭
    settingsPanel.addEventListener("click", (e) => {
      if (e.target === settingsPanel) {
        settingsPanel.style.display = "none";
      }
    });

    // 添加开关事件
    const timeFormatSwitch = settingsPanel.querySelector(
      "#setting-time-format"
    );
    timeFormatSwitch.addEventListener("change", () => {
      this.settings.showFullTime = timeFormatSwitch.checked;
      this.saveSettings();
      this.updateAllMessageTimes();
    });

    // 添加修改用户名按钮事件
    const changeUsernameBtn = settingsPanel.querySelector(
      "#change-username-btn"
    );
    changeUsernameBtn.addEventListener("click", () => {
      this.handleUsernameChange();
    });

    // 添加输入框回车事件
    const newUsernameInput = settingsPanel.querySelector("#new-username-input");
    newUsernameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.handleUsernameChange();
      }
    });
  }

  /**
   * 处理用户名修改
   */
  handleUsernameChange() {
    const newUsernameInput = this.iframeDocument.querySelector(
      "#new-username-input"
    );
    const errorMessage = this.iframeDocument.querySelector(
      ".username-error-message"
    );

    if (!newUsernameInput || !errorMessage) return;

    const newUsername = newUsernameInput.value.trim();

    // 清除之前的错误信息
    errorMessage.textContent = "";
    errorMessage.style.display = "none";

    // 检查是否输入为空
    if (!newUsername) {
      errorMessage.textContent = "用户名不能为空";
      errorMessage.style.display = "block";
      return;
    }

    // 检查是否与当前用户名相同
    if (newUsername === this.username) {
      errorMessage.textContent = "新用户名与当前用户名相同";
      errorMessage.style.display = "block";
      return;
    }

    // 检查是否与其他在线用户名冲突
    if (this.userList.includes(newUsername)) {
      errorMessage.textContent = "该用户名已被使用，请选择其他名称";
      errorMessage.style.display = "block";
      return;
    }

    // 保存旧用户名
    const oldUsername = this.username;

    // 更新用户名
    this.username = newUsername;

    // 保存到本地存储
    this.saveUsernameToStorage(newUsername);

    // 发送用户下线消息
    this.publishUserStatus("offline", oldUsername);

    // 发送用户上线消息
    this.publishUserStatus("online");

    // 更新用户列表
    const index = this.userList.indexOf(oldUsername);
    if (index !== -1) {
      this.userList[index] = newUsername;
      this.renderUserList();
    }

    // 更新欢迎信息
    const welcomeMessage =
      this.iframeDocument.querySelector(".welcome-message");
    if (welcomeMessage) {
      welcomeMessage.textContent = `欢迎，${newUsername}！`;
    }

    // 显示成功消息
    errorMessage.textContent = "用户名修改成功！";
    errorMessage.style.display = "block";
    errorMessage.style.color = "#10b981"; // 绿色

    // 显示系统消息
    this.displaySystemMessage(
      `您已将用户名从 "${oldUsername}" 修改为 "${newUsername}"`
    );

    // 关闭设置面板
    setTimeout(() => {
      this.closeSettingsPanel();
    }, 1500);
  }

  /**
   * 关闭设置面板
   */
  closeSettingsPanel() {
    const settingsPanel = this.iframeDocument.querySelector(".settings-panel");
    if (settingsPanel) {
      settingsPanel.style.display = "none";
    }
  }

  /**
   * 更新所有消息的时间显示
   */
  updateAllMessageTimes() {
    const messageTimeElements =
      this.iframeDocument.querySelectorAll(".message-time");

    messageTimeElements.forEach((element) => {
      const fullTimeStr = element.getAttribute("title");
      if (this.settings.showFullTime) {
        element.textContent = fullTimeStr;
      } else {
        // 提取原始的短时间格式 (HH:MM:SS)
        const shortTimeMatch = fullTimeStr.match(/\d{2}:\d{2}:\d{2}/);
        if (shortTimeMatch) {
          element.textContent = shortTimeMatch[0];
        }
      }
    });
  }

  /**
   * 自动调整文本域高度
   */
  autoResizeTextarea(textarea) {
    if (!textarea) return;

    // 重置高度，以便正确计算内容高度
    textarea.style.height = "auto";

    // 计算新高度（内容高度 + 边框）
    const newHeight = Math.min(150, Math.max(38, textarea.scrollHeight));
    textarea.style.height = newHeight + "px";
  }

  /**
   * 在文本域光标处插入文本
   */
  insertTextAtCursor(textarea, text) {
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const originalValue = textarea.value;

    // 插入文本
    textarea.value =
      originalValue.substring(0, start) + text + originalValue.substring(end);

    // 更新光标位置
    textarea.selectionStart = textarea.selectionEnd = start + text.length;

    // 触发 input 事件，以便 autoResizeTextarea 生效
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    textarea.focus(); // 确保输入框获得焦点
  }
}

// 注册聊天室组件
window.ChatRoom = ChatRoom;
