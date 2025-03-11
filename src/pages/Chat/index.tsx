import React, {useEffect, useRef, useState} from 'react';
import {Alert, Avatar, Button, Input, message, Popover, Spin, Tooltip, Popconfirm, Modal} from 'antd';
import COS from 'cos-js-sdk-v5';
import {
  CrownFilled,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PictureOutlined,
  SendOutlined,
  SmileOutlined,
  SoundOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import styles from './index.less';
import {useModel} from "@@/exports";
import {BACKEND_HOST_WS} from "@/constants";
import {getOnlineUserListUsingGet, listMessageVoByPageUsingPost} from "@/services/backend/chatController";
import MessageContent from '@/components/MessageContent';
import EmoticonPicker from '@/components/EmoticonPicker';
import {getCosCredentialUsingGet} from "@/services/backend/fileController";

interface Message {
  id: string;
  content: string;
  sender: User;
  timestamp: Date;
}

interface User {
  id: string;
  name: string;
  avatar: string;
  level: number;
  isAdmin: boolean;
  status?: string;
}

const ChatRoom: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const [isEmoticonPickerVisible, setIsEmoticonPickerVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [isUserListCollapsed, setIsUserListCollapsed] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const {initialState} = useModel('@@initialState');
  const {currentUser} = initialState || {};
  const [messageApi, contextHolder] = message.useMessage();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const maxReconnectAttempts = 5;
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const isManuallyClosedRef = useRef(false);

  // 分页相关状态
  const [current, setCurrent] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const pageSize = 10;
  // 添加已加载消息ID的集合
  const [loadedMessageIds] = useState<Set<string>>(new Set());

  const [announcement, setAnnouncement] = useState<string>('欢迎来到摸鱼聊天室！🎉 这里是一个充满快乐的地方~。致谢：感谢玄德大佬赞助的对象存储服务🌟');
  const [showAnnouncement, setShowAnnouncement] = useState<boolean>(true);

  const [isComponentMounted, setIsComponentMounted] = useState(true);

  const [uploading, setUploading] = useState(false);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);

  // 获取在线用户列表
  const fetchOnlineUsers = async () => {
    try {
      const response = await getOnlineUserListUsingGet();
      if (response.data) {
        const onlineUsersList = response.data.map(user => ({
          id: String(user.id),
          name: user.name || '未知用户',
          avatar: user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=visitor',
          level: user.level || 1,
          isAdmin: user.isAdmin || false,
          status: '在线'
        }));

        // 如果当前用户已登录且不在列表中，将其添加到列表
        if (currentUser?.id && !onlineUsersList.some(user => user.id === String(currentUser.id))) {
          onlineUsersList.push({
            id: String(currentUser.id),
            name: currentUser.userName || '未知用户',
            avatar: currentUser.userAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=visitor',
            level: 1,  // 默认等级为1
            isAdmin: currentUser.userRole === 'admin',
            status: '在线'
          });
        }

        setOnlineUsers(onlineUsersList);
      }
    } catch (error) {
      console.error('获取在线用户列表失败:', error);
      messageApi.error('获取在线用户列表失败');
    }
  };

  // 初始化时获取在线用户列表
  useEffect(() => {
    fetchOnlineUsers();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  };
  const loadHistoryMessages = async (page: number, isFirstLoad = false) => {
    if (!hasMore || loading) return;

    try {
      setLoading(true);
      const response = await listMessageVoByPageUsingPost({
        current: page,
        pageSize,
        roomId: -1,
        sortField: 'createTime',
        sortOrder: 'desc'  // 保持降序，最新的消息在前面
      });
      if (response.data?.records) {
        const historyMessages = response.data.records
          .map(record => ({
            id: String(record.messageWrapper?.message?.id),
            content: record.messageWrapper?.message?.content || '',
            sender: {
              id: String(record.userId),
              name: record.messageWrapper?.message?.sender?.name || '未知用户',
              avatar: record.messageWrapper?.message?.sender?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=visitor',
              level: record.messageWrapper?.message?.sender?.level || 1,
              isAdmin: record.messageWrapper?.message?.sender?.isAdmin || false,
            },
            timestamp: new Date(record.messageWrapper?.message?.timestamp || Date.now()),
          }))
          // 过滤掉已经加载过的消息
          .filter(msg => !loadedMessageIds.has(msg.id));

        // 将新消息的ID添加到已加载集合中
        historyMessages.forEach(msg => loadedMessageIds.add(msg.id));

        // 处理历史消息，确保正确的时间顺序（旧消息在上，新消息在下）
        if (isFirstLoad) {
          // 首次加载时，反转消息顺序，使最旧的消息在上面
          setMessages(historyMessages.reverse());
        } else {
          // 加载更多历史消息时，新的历史消息应该在当前消息的上面
          // 只有在有新消息时才更新状态
          if (historyMessages.length > 0) {
            setMessages(prev => [...historyMessages.reverse(), ...prev]);
          }
        }

        setTotal(response.data.total || 0);

        // 更新是否还有更多消息
        // 考虑实际加载的消息数量，而不是页码计算
        const currentTotal = loadedMessageIds.size;
        setHasMore(currentTotal < (response.data.total || 0));

        // 只有在成功加载新消息时才更新页码
        if (historyMessages.length > 0) {
          setCurrent(page);
        }

        // 如果是首次加载，将滚动条设置到底部
        if (isFirstLoad) {
          setTimeout(() => {
            scrollToBottom();
          }, 100);
        }
      }
    } catch (error) {
      messageApi.error('加载历史消息失败');
      console.error('加载历史消息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 检查是否在底部附近
  const checkIfNearBottom = () => {
    const container = messageContainerRef.current;
    if (!container) return;

    const threshold = 100; // 距离底部100px以内都认为是在底部
    const isNear = container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;
    setIsNearBottom(isNear);
  };

  // 监听滚动事件
  const handleScroll = () => {
    const container = messageContainerRef.current;
    if (!container || loading || !hasMore) return;

    // 检查是否在底部
    checkIfNearBottom();

    // 当滚动到顶部时加载更多
    if (container.scrollTop === 0) {
      // 更新当前页码，加载下一页
      const nextPage = current + 1;
      if (hasMore) {
        loadHistoryMessages(nextPage);
      }
    }
  };

  // 初始化时加载历史消息
  useEffect(() => {
    loadHistoryMessages(1, true);
  }, []);

  // 添加滚动监听
  useEffect(() => {
    const container = messageContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [loading, hasMore, current]);

  // 处理图片上传
  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      const res = await getCosCredentialUsingGet({
        fileName: file.name || `paste_${Date.now()}.png`
      });
      console.log('getKeyAndCredentials:', res);
      const data = res.data;
      const cos = new COS({
        SecretId: data?.response?.credentials?.tmpSecretId,
        SecretKey: data?.response?.credentials?.tmpSecretKey,
        SecurityToken: data?.response?.credentials?.sessionToken,
        StartTime: data?.response?.startTime,
        ExpiredTime: data?.response?.expiredTime,
      });

      // 使用 Promise 包装 COS 上传
      const url = await new Promise<string>((resolve, reject) => {
        cos.uploadFile({
          Bucket: data?.bucket as string,
          Region: data?.region as string,
          Key: data?.key as string,
          Body: file,
          onProgress: function (progressData) {
            console.log('上传进度：', progressData);
          }
        }, function (err, data) {
          if (err) {
            reject(err);
            return;
          }
          console.log('上传结束', data);
          const url = "https://" + data.Location;
          console.log("图片地址：", url);
          resolve(url);
        });
      });

      // 设置预览图片
      setPendingImageUrl(url);
      
    } catch (error) {
      messageApi.error(`上传失败：${error}`);
    } finally {
      setUploading(false);
    }
  };

  // 处理粘贴事件
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          await handleImageUpload(file);
        }
        break;
      }
    }
  };

  // 处理发送消息
  const handleSend = (customContent?: string) => {
    let content = customContent || inputValue;
    
    // 如果有待发送的图片，将其添加到消息内容中
    if (pendingImageUrl) {
      content = `[img]${pendingImageUrl}[/img]${content}`;
    }

    if (!content.trim() && !pendingImageUrl) {
      message.warning('请输入消息内容');
      return;
    }

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return;
    }

    if (!currentUser?.id) {
      messageApi.error('请先登录！');
      return;
    }

    const newMessage: Message = {
      id: `${Date.now()}`,
      content: content,
      sender: {
        id: String(currentUser.id),
        name: currentUser.userName || '游客',
        avatar: currentUser.userAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=visitor',
        level: 1,
        isAdmin: currentUser.userRole === 'admin',
      },
      timestamp: new Date(),
    };

    // 发送消息到服务器
    const messageData = {
      type: 2,
      userId: -1,
      data: {
        type: 'chat',
        content: {
          message: newMessage
        }
      }
    };
    ws.send(JSON.stringify(messageData));

    // 更新消息列表
    setMessages(prev => [...prev, newMessage]);
    setTotal(prev => prev + 1);
    setHasMore(true);

    // 清空输入框和预览图片
    setInputValue('');
    setPendingImageUrl(null);
    
    // 滚动到底部
    setTimeout(scrollToBottom, 100);
  };

  // 移除待发送的图片
  const handleRemoveImage = () => {
    setPendingImageUrl(null);
  };

  // 表情包数据
  const emojis = [
    '😊', '😂', '🤣', '❤️', '😍', '🥰', '😘', '😭', '😅', '😉',
    '🤔', '🤗', '🤫', '🤐', '😴', '🥱', '😪', '😇', '🥳', '😎',
    '🤓', '🧐', '🤠', '🤡', '🤑', '🤤', '😋', '😛', '😜', '😝',
    '🤪', '🤨', '🧐', '😤', '😠', '😡', '🤬', '😈', '👿', '👻',
    '💩', '🤡', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻',
  ];

  // WebSocket连接函数
  const connectWebSocket = () => {
    const token = localStorage.getItem('tokenValue');
    if (!token || !currentUser?.id) {
      messageApi.error('请先登录！');
      return;
    }

    // 如果是手动关闭的，不要重新连接
    if (isManuallyClosedRef.current) {
      return;
    }

    const socket = new WebSocket(BACKEND_HOST_WS + token);

    socket.onopen = () => {
      socket.send(JSON.stringify({
        type: 1, // 登录连接
      }));
      console.log('WebSocket连接成功');
      setReconnectAttempts(0); // 重置重连次数
    };

    socket.onclose = () => {
      console.log('WebSocket连接关闭');
      setWs(null);

      // 只有在组件仍然挂载且非主动关闭的情况下才尝试重连
      if (isComponentMounted && !isManuallyClosedRef.current && reconnectAttempts < maxReconnectAttempts) {
        const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
        reconnectTimeoutRef.current = setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          connectWebSocket();
        }, timeout);
      }
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('收到服务器消息:', data);
      if (data.type === 'chat') {
        console.log('处理聊天消息:', data.data.message);
        // 检查消息是否来自其他用户
        const otherUserMessage = data.data.message;
        console.log('otherUserMessage:', otherUserMessage);
        console.log('senderId:', otherUserMessage.sender.id);
        console.log('currentId:', String(currentUser?.id));
        console.log('equals:', otherUserMessage.sender.id !== String(currentUser?.id));
        if (otherUserMessage.sender.id !== String(currentUser?.id)) {
          console.log("当前 messages 状态:", messages);
          console.log("消息进来啦")
          // 接收到的新消息添加到列表末尾
          setMessages(prev => {
            console.log("消息处理", prev);
            return [...prev, { ...otherUserMessage }]; // 创建新对象，避免 React 认为没变
          });

          console.log(messages.length);
          // 更新总消息数
          setTotal(prev => prev + 1);
          // 如果用户正在查看底部，则自动滚动到底部
          if (isNearBottom) {
            setTimeout(scrollToBottom, 100);
          }
        }
      } else if (data.type === 'userMessageRevoke') {
        console.log('处理消息撤回:', data.data);
        // 从消息列表中移除被撤回的消息
        setMessages(prev => prev.filter(msg => msg.id !== data.data));
        // 更新总消息数
        setTotal(prev => Math.max(0, prev - 1));
      } else if (data.type === 'userOnline') {
        console.log('处理用户上线消息:', data.data);
        setOnlineUsers(prev => [
          ...prev,
          ...data.data.filter((newUser: { id: string; }) => !prev.some(user => user.id === newUser.id))
        ]);

      } else if (data.type === 'userOffline') {
        console.log('处理用户下线消息:', data.data);
        // 过滤掉下线的用户
        setOnlineUsers(prev => prev.filter(user => user.id !== data.data));
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket错误:', error);
      messageApi.error('连接发生错误');
    };

    // 定期发送心跳消息
    const pingInterval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 4, // 心跳消息类型
        }));
      }
    }, 25000);

    setWs(socket);

    return () => {
      clearInterval(pingInterval);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      socket.close();
    };
  };

  useEffect(() => {
    setIsComponentMounted(true);
    isManuallyClosedRef.current = false;

    // 只有当用户已登录时才建立WebSocket连接
    if (currentUser?.id) {
      const cleanup = connectWebSocket();

      return () => {
        setIsComponentMounted(false);
        isManuallyClosedRef.current = true;  // 标记为手动关闭
        if (cleanup) cleanup();
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        if (ws) {
          ws.close();
        }
      };
    }
  }, [currentUser?.id]);

  const getLevelEmoji = (level: number) => {
    if (level >= 99) return '👑';
    if (level >= 50) return '🌟';
    if (level >= 30) return '💎';
    if (level >= 20) return '🌙';
    if (level >= 10) return '⭐';
    return '🌱';
  };

  // 新增管理员标识函数
  const getAdminTag = () => {
    // 随机选择一个摸鱼表情
    const fishEmojis = ['🐟', '🐠', '🐡', '🎣'];
    const randomFish = fishEmojis[Math.floor(Math.random() * fishEmojis.length)];
    return (
      <span className={styles.adminTag}>
        {randomFish}
        <span className={styles.adminText}>摸鱼官</span>
      </span>
    );
  };

  const handleEmojiClick = (emoji: string) => {
    setInputValue(prev => prev + emoji);
    setIsEmojiPickerVisible(false);
  };

  const emojiPickerContent = (
    <div className={styles.emojiPicker}>
      {emojis.map((emoji, index) => (
        <span
          key={index}
          className={styles.emojiItem}
          onClick={() => handleEmojiClick(emoji)}
        >
          {emoji}
        </span>
      ))}
    </div>
  );

  const handleEmoticonSelect = (url: string) => {
    // 将图片URL作为消息内容发送
    const imageMessage = `[img]${url}[/img]`;
    setInputValue(imageMessage);

    // 直接使用新的消息内容发送，而不是依赖 inputValue 的状态更新
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return;
    }

    if (!currentUser?.id) {
      messageApi.error('请先登录！');
      return;
    }

    const newMessage: Message = {
      id: `${Date.now()}`,
      content: imageMessage,
      sender: {
        id: String(currentUser.id),
        name: currentUser.userName || '游客',
        avatar: currentUser.userAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=visitor',
        level: 1,
        isAdmin: currentUser.userRole === 'admin',
      },
      timestamp: new Date(),
    };

    // 新发送的消息添加到列表末尾
    setMessages(prev => [...prev, newMessage]);
    // 更新总消息数和分页状态
    setTotal(prev => prev + 1);
    setHasMore(true);

    // 发送消息到服务器
    const messageData = {
      type: 2,
      userId: -1,
      data: {
        type: 'chat',
        content: {
          message: newMessage
        }
      }
    };
    ws.send(JSON.stringify(messageData));

    setInputValue('');
    setIsEmoticonPickerVisible(false);
    // 发送消息后滚动到底部
    setTimeout(scrollToBottom, 100);
  };

  // 添加撤回消息的处理函数
  const handleRevokeMessage = (messageId: string) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      messageApi.error('连接已断开，无法撤回消息');
      return;
    }

    const messageData = {
      type: 2,
      userId: -1,
      data: {
        type: 'userMessageRevoke',
        content:  messageId
      }
    };

    ws.send(JSON.stringify(messageData));

    messageApi.info('消息已撤回');
  };

  const UserInfoCard: React.FC<{ user: User }> = ({ user }) => {
    return (
      <div className={styles.userInfoCard}>
        <div className={styles.userInfoCardHeader}>
          <div className={styles.avatarWrapper}>
            <Avatar src={user.avatar} size={48} />
            <div className={styles.floatingFish}>🐟</div>
          </div>
          <div className={styles.userInfoCardTitle}>
            <div className={styles.userInfoCardNameRow}>
              <span className={styles.userInfoCardName}>{user.name}</span>
              <span className={styles.userInfoCardLevel}>
                <span className={styles.levelEmoji}>{getLevelEmoji(user.level)}</span>
                <span className={styles.levelText}>{user.level}</span>
              </span>
            </div>
            {user.isAdmin && (
              <div className={styles.userInfoCardAdminTag}>
                {getAdminTag()}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`${styles.chatRoom} ${isUserListCollapsed ? styles.collapsed : ''}`}>
      {contextHolder}
      {showAnnouncement && (
        <Alert
          message={
            <div className={styles.announcementContent}>
              <SoundOutlined className={styles.announcementIcon}/>
              <span>{announcement}</span>
            </div>
          }
          type="info"
          showIcon={false}
          closable
          onClose={() => setShowAnnouncement(false)}
          className={styles.announcement}
        />
      )}
      <div className={styles['floating-fish'] + ' ' + styles.fish1}>🐟</div>
      <div className={styles['floating-fish'] + ' ' + styles.fish2}>🐠</div>
      <div className={styles['floating-fish'] + ' ' + styles.fish3}>🐡</div>
      <div className={styles['floating-fish'] + ' ' + styles.bubble1}>💭</div>
      <div className={styles['floating-fish'] + ' ' + styles.bubble2}>💭</div>
      <div
        className={styles.messageContainer}
        ref={messageContainerRef}
        onScroll={handleScroll}
      >
        {loading && <div className={styles.loadingWrapper}><Spin/></div>}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.messageItem} ${
              currentUser?.id && String(msg.sender.id) === String(currentUser.id) ? styles.self : ''
            }`}
          >
            <div className={styles.messageHeader}>
              <div className={styles.avatar}>
                <Popover
                  content={<UserInfoCard user={msg.sender} />}
                  trigger="hover"
                  placement="top"
                >
                  <Avatar src={msg.sender.avatar} size={32}/>
                </Popover>
                {msg.sender.isAdmin && (
                  <div className={styles.adminTagWrapper}>
                    {getAdminTag()}
                  </div>
                )}
              </div>
              <div className={styles.senderInfo}>
                <span className={styles.senderName}>
                  {currentUser?.id && String(msg.sender.id) === String(currentUser.id) ? null : (
                    <>
                      {msg.sender.name}
                      <span className={styles.levelBadge}>
                        {getLevelEmoji(msg.sender.level)} {msg.sender.level}
                      </span>
                    </>
                  )}
                </span>
              </div>
            </div>
            <div className={styles.messageContent}>
              <MessageContent content={msg.content}/>
            </div>
            <div className={styles.messageFooter}>
              <span className={styles.timestamp}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
              {currentUser?.id && String(msg.sender.id) === String(currentUser.id) && (
                <Popconfirm
                  title={`确定要撤回这条消息吗`}
                  onConfirm={() => handleRevokeMessage(msg.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <span className={styles.revokeText}>撤回</span>
                </Popconfirm>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef}/>
      </div>

      <div className={styles.userList}>
        <div
          className={styles.collapseButton}
          onClick={() => setIsUserListCollapsed(!isUserListCollapsed)}
        >
          {isUserListCollapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
        </div>
        <div className={styles.userListHeader}>
          在线成员 ({onlineUsers.length})
        </div>
        {onlineUsers.map(user => (
          <div key={user.id} className={styles.userItem}>
            <div className={styles.avatarWrapper}>
              <Popover
                content={<UserInfoCard user={user} />}
                trigger="hover"
                placement="right"
              >
                <Avatar src={user.avatar} size={28}/>
              </Popover>
              {user.isAdmin && (
                <div className={styles.adminTagWrapper}>
                  {getAdminTag()}
                </div>
              )}
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>
                {user.name}
              </div>
              <div className={styles.userStatus}>{user.status}</div>
            </div>
            <span className={styles.levelBadge}>
              {getLevelEmoji(user.level)}
            </span>
          </div>
        ))}
      </div>

      <div className={styles.inputArea}>
        {pendingImageUrl && (
          <div className={styles.imagePreview}>
            <div className={styles.previewWrapper}>
              <img 
                src={pendingImageUrl} 
                alt="预览图片" 
                className={styles.previewImage}
                onClick={() => {
                  setPreviewImage(pendingImageUrl);
                  setIsPreviewVisible(true);
                }}
              />
              <Button 
                type="text" 
                icon={<DeleteOutlined />} 
                className={styles.removeImage}
                onClick={handleRemoveImage}
              />
            </div>
          </div>
        )}
        <div className={styles.inputRow}>
          <Popover
            content={emojiPickerContent}
            trigger="click"
            visible={isEmojiPickerVisible}
            onVisibleChange={setIsEmojiPickerVisible}
            placement="topLeft"
            overlayClassName={styles.emojiPopover}
          >
            <Button
              icon={<SmileOutlined/>}
              className={styles.emojiButton}
            />
          </Popover>
          <Popover
            content={<EmoticonPicker onSelect={handleEmoticonSelect}/>}
            trigger="click"
            visible={isEmoticonPickerVisible}
            onVisibleChange={setIsEmoticonPickerVisible}
            placement="topLeft"
            overlayClassName={styles.emoticonPopover}
          >
            <Button
              icon={<PictureOutlined/>}
              className={styles.emoticonButton}
            />
          </Popover>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={(e) => {
              // 检查是否是输入法组合键
              if (e.nativeEvent.isComposing) {
                return;
              }
              handleSend();
            }}
            onPaste={handlePaste}
            placeholder={uploading ? "正在上传图片..." : "输入消息或粘贴图片..."}
            maxLength={200}
            disabled={uploading}
          />
          <span className={styles.inputCounter}>
            {inputValue.length}/200
          </span>
          <Button
            type="text"
            icon={<SendOutlined/>}
            onClick={() => handleSend()}
            disabled={uploading}
          >
            发送
          </Button>
        </div>
      </div>

      <Modal
        visible={isPreviewVisible}
        footer={null}
        onCancel={() => setIsPreviewVisible(false)}
      >
        {previewImage && <img alt="预览" style={{ width: '100%' }} src={previewImage} />}
      </Modal>
    </div>
  );
};

export default ChatRoom;

