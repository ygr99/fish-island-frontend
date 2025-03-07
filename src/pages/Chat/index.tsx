import React, {useState, useRef, useEffect} from 'react';
import {Input, Button, Avatar, Tooltip, message, Popover} from 'antd';
import {SendOutlined, CrownFilled, MenuFoldOutlined, MenuUnfoldOutlined, SmileOutlined} from '@ant-design/icons';
import styles from './index.less';
import {useModel} from "@@/exports";
import {BACKEND_HOST_WS} from "@/constants";

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

// 添加当前用户类型定义
const ChatRoom: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isUserListCollapsed, setIsUserListCollapsed] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const {initialState} = useModel('@@initialState');
  const {currentUser} = initialState || {};
  const [messageApi, contextHolder] = message.useMessage();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const maxReconnectAttempts = 5;
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // 模拟在线用户数据
  const onlineUsers: User[] = [
    {
      id: 'admin',
      name: '管理员',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      level: 99,
      isAdmin: true,
      status: '在线'
    },
    {
      id: '1',
      name: '摸鱼达人',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
      level: 5,
      isAdmin: false,
      status: '摸鱼中'
    },
    {
      id: '2',
      name: '快乐星球',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
      level: 15,
      isAdmin: false,
      status: '忙碌'
    },
  ];

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

    const socket = new WebSocket(BACKEND_HOST_WS + token);

    socket.onopen = () => {
      console.log('WebSocket连接成功');
      setReconnectAttempts(0); // 重置重连次数
      messageApi.success('连接成功！');
    };

    socket.onclose = () => {
      console.log('WebSocket连接关闭');
      setWs(null);

      // 如果重连次数未超过最大值，尝试重连
      if (reconnectAttempts < maxReconnectAttempts) {
        const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
        reconnectTimeoutRef.current = setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          connectWebSocket();
        }, timeout);
      } else {
        messageApi.error('连接失败，请刷新页面重试');
      }
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('收到服务器消息:', data);
      if (data.type === 'chat') {
        console.log('处理聊天消息:', data.message);
        // 检查消息是否来自其他用户
        const message = data.message;
        if (message.sender.id !== String(currentUser?.id)) {
          setMessages(prev => [...prev, message]);
        }
      } else if (data.type === 'message') {
        console.log('处理普通消息:', data.data);
        const newMessage = data.data;
        // 检查消息是否来自其他用户
        if (newMessage.sender.id !== String(currentUser?.id)) {
          setMessages(prev => [...prev, newMessage]);
        }
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
    // 初始欢迎消息
    const welcomeMessage: Message = {
      id: '1',
      content: '欢迎来到摸鱼聊天室！🎉 这里是一个充满快乐的地方~',
      sender: {
        id: 'admin',
        name: '摸鱼小助手',
        avatar: 'https://img1.baidu.com/it/u=2985996956,1440216669&fm=253&fmt=auto&app=120&f=GIF?w=285&h=285',
        level: 99,
        isAdmin: true,
      },
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);

    // 建立WebSocket连接
    const cleanup = connectWebSocket();

    return () => {
      if (cleanup) cleanup();
    };
  }, [currentUser?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) {
      message.warning('请输入消息内容');
      return;
    }

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      messageApi.error('网络连接已断开，请等待重连');
      return;
    }

    if (!currentUser?.id) {
      messageApi.error('请先登录！');
      return;
    }

    const newMessage: Message = {
      id: `${Date.now()}`,
      content: inputValue,
      sender: {
        id: String(currentUser.id),
        name: currentUser.userName || '游客',
        avatar: currentUser.userAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=visitor',
        level: 1,
        isAdmin: currentUser.userRole === 'admin',
      },
      timestamp: new Date(),
    };

    // 先添加到本地消息列表
    setMessages(prev => [...prev, newMessage]);

    // 发送消息到服务器
    const messageData = {
      type: 2,
      data: {
        type: 'chat',
        content: {
          message: newMessage
        }
      }
    };
    console.log('发送到服务器的数据:', messageData);
    ws.send(JSON.stringify(messageData));

    setInputValue('');
  };

  const getLevelEmoji = (level: number) => {
    if (level >= 99) return '👑';
    if (level >= 50) return '🌟';
    if (level >= 30) return '💎';
    if (level >= 20) return '🌙';
    if (level >= 10) return '⭐';
    return '🌱';
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

  return (
    <div className={`${styles.chatRoom} ${isUserListCollapsed ? styles.collapsed : ''}`}>
      {contextHolder}
      <div className={styles.messageContainer}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.messageItem} ${
              currentUser?.id && String(msg.sender.id) === String(currentUser.id) ? styles.self : ''
            }`}
          >
            <div className={styles.messageHeader}>
              <div className={styles.avatar}>
                <Tooltip title={`等级 ${msg.sender.level}`}>
                  <Avatar src={msg.sender.avatar} size={32}/>
                </Tooltip>
              </div>
              <div className={styles.senderInfo}>
                <span className={styles.senderName}>
                  {msg.sender.name}
                  {msg.sender.isAdmin && (
                    <CrownFilled className={styles.adminIcon}/>
                  )}
                  <span className={styles.levelBadge}>
                    {getLevelEmoji(msg.sender.level)} {msg.sender.level}
                  </span>
                </span>

              </div>
            </div>
            <div className={styles.messageContent}>{msg.content}</div>
            <span className={styles.timestamp}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
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
            <Avatar src={user.avatar} size={28}/>
            <div className={styles.userInfo}>
              <div className={styles.userName}>
                {user.name}
                {user.isAdmin && <CrownFilled className={styles.adminIcon}/>}
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
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPressEnter={handleSend}
          placeholder="输入消息..."
          maxLength={200}
        />
        <span className={styles.inputCounter}>
          {inputValue.length}/200
        </span>
        <Button
          type="text"
          icon={<SendOutlined/>}
          onClick={handleSend}
        >
          发送
        </Button>
      </div>
    </div>
  );
};

export default ChatRoom;
