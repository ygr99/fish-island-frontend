import React from 'react';
import styles from './MessageContent.less';

interface MessageContentProps {
  content: string;
}

const MessageContent: React.FC<MessageContentProps> = ({ content }) => {
  // 检查是否是图片消息
  const isImageMessage = content.startsWith('[img]') && content.endsWith('[/img]');
  
  if (isImageMessage) {
    const imageUrl = content.slice(5, -6); // 移除 [img] 和 [/img] 标签
    return (
      <div className={styles.imageContainer}>
        <img src={imageUrl} alt="表情包" className={styles.messageImage} />
      </div>
    );
  }

  return <div className={styles.textContent}>{content}</div>;
};

export default MessageContent; 