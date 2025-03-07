import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Avatar, Tooltip, message, Popover } from 'antd';
import { SendOutlined, CrownFilled, MenuFoldOutlined, MenuUnfoldOutlined, SmileOutlined } from '@ant-design/icons';
import styles from './index.less';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isUserListCollapsed, setIsUserListCollapsed] = useState(false);

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

  // 模拟当前用户
  const currentUser: User = {
    id: '1',
    name: '摸鱼达人',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    level: 5,
    isAdmin: false,
    status: '摸鱼中'
  };

  // 表情包数据
  const emojis = [
    '😊', '😂', '🤣', '❤️', '😍', '🥰', '😘', '😭', '😅', '😉',
    '🤔', '🤗', '🤫', '🤐', '😴', '🥱', '😪', '😇', '🥳', '😎',
    '🤓', '🧐', '🤠', '🤡', '🤑', '🤤', '😋', '😛', '😜', '😝',
    '🤪', '🤨', '🧐', '😤', '😠', '😡', '🤬', '😈', '👿', '👻',
    '💩', '🤡', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻',
  ];

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
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) {
      message.warning('请输入消息内容');
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: currentUser,
      timestamp: new Date(),
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
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
      <div className={styles.messageContainer}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.messageItem} ${
              msg.sender.id === currentUser.id ? styles.self : ''
            }`}
          >
            <div className={styles.messageHeader}>
              <div className={styles.avatar}>
                <Tooltip title={`等级 ${msg.sender.level}`}>
                  <Avatar src={msg.sender.avatar} size={32} />
                </Tooltip>
              </div>
              <div className={styles.senderInfo}>
                <span className={styles.senderName}>
                  {msg.sender.name}
                  {msg.sender.isAdmin && (
                    <CrownFilled className={styles.adminIcon} />
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
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.userList}>
        <div
          className={styles.collapseButton}
          onClick={() => setIsUserListCollapsed(!isUserListCollapsed)}
        >
          {isUserListCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
        <div className={styles.userListHeader}>
          在线成员 ({onlineUsers.length})
        </div>
        {onlineUsers.map(user => (
          <div key={user.id} className={styles.userItem}>
            <Avatar src={user.avatar} size={28} />
            <div className={styles.userInfo}>
              <div className={styles.userName}>
                {user.name}
                {user.isAdmin && <CrownFilled className={styles.adminIcon} />}
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
            icon={<SmileOutlined />}
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
          icon={<SendOutlined />}
          onClick={handleSend}
        >
          发送
        </Button>
      </div>
    </div>
  );
};

export default ChatRoom;
