import React, { useEffect, useState } from 'react';
import { Card } from 'antd';
import { BilibiliOutlined, VideoCameraOutlined, LinkOutlined } from '@ant-design/icons';
import styles from './index.less';

interface MessageContentProps {
  content: string;
}

interface BilibiliVideoInfo {
  title: string;
  description: string;
  icon: string;
  url: string;
}

const MessageContent: React.FC<MessageContentProps> = ({ content }) => {
  const [bilibiliVideos, setBilibiliVideos] = useState<Record<string, BilibiliVideoInfo>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  
  // URL匹配正则表达式
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // 截断文本到指定长度
  const truncateText = (text: string, maxLength: number = 20) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  // 从B站URL中提取BV号
  const extractBvid = (url: string): string | null => {
    const bvMatch = url.match(/BV\w+/);
    return bvMatch ? bvMatch[0] : null;
  };

  // 获取B站视频信息
  const fetchBilibiliMetadata = async (url: string) => {
    setLoading(prev => ({ ...prev, [url]: true }));
    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      const html = await response.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const title = doc.querySelector('title')?.textContent || 'Bilibili 视频';
      const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
                          doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
      const icon = doc.querySelector('link[rel="icon"]')?.getAttribute('href') ||
                   doc.querySelector('link[rel="shortcut icon"]')?.getAttribute('href') ||
                   'https://www.bilibili.com/favicon.ico';

      const metadata = { title, description, icon, url };
      setBilibiliVideos(prev => ({ ...prev, [url]: metadata }));
    } catch (error) {
      console.error('获取 Bilibili URL 元数据失败:', error);
      setBilibiliVideos(prev => ({
        ...prev,
        [url]: {
          title: 'Bilibili 视频',
          description: '这是一个 Bilibili 视频链接',
          icon: 'https://www.bilibili.com/favicon.ico',
          url
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [url]: false }));
    }
  };

  // 解析消息内容
  const parseContent = () => {
    const parts = content.split(urlRegex);
    
    return parts.map((part, index) => {
      // 检查是否是URL
      if (part.match(urlRegex)) {
        const url = part.trim();
        
        // 检查是否是B站链接
        if (url.includes('bilibili.com')) {
          if (!bilibiliVideos[url] && !loading[url]) {
            fetchBilibiliMetadata(url);
          }

          return (
            <Card
              key={index}
              className={styles.linkCard}
              size="small"
              hoverable
            >
              <div className={styles.linkContent}>
                <BilibiliOutlined className={styles.linkIcon} />
                <div className={styles.linkInfo}>
                  {bilibiliVideos[url] ? (
                    <>
                      <div className={styles.videoTitle}>{bilibiliVideos[url].title}</div>
                      <div className={styles.videoDescription}>
                        {truncateText(bilibiliVideos[url].description)}
                      </div>
                      <a href={url} target="_blank" rel="noopener noreferrer" className={styles.linkText}>
                        {url}
                      </a>
                    </>
                  ) : (
                    <a href={url} target="_blank" rel="noopener noreferrer" className={styles.linkText}>
                      {url}
                    </a>
                  )}
                </div>
              </div>
            </Card>
          );
        }
        
        // 检查是否是抖音链接
        if (url.includes('douyin.com')) {
          return (
            <Card
              key={index}
              className={styles.linkCard}
              size="small"
              hoverable
            >
              <div className={styles.linkContent}>
                <VideoCameraOutlined className={styles.linkIcon} />
                <a href={url} target="_blank" rel="noopener noreferrer" className={styles.linkText}>
                  {url}
                </a>
              </div>
            </Card>
          );
        }
        
        // 其他URL显示为普通链接
        return (
          <Card
            key={index}
            className={styles.linkCard}
            size="small"
            hoverable
          >
            <div className={styles.linkContent}>
              <LinkOutlined className={styles.linkIcon} />
              <a href={url} target="_blank" rel="noopener noreferrer" className={styles.linkText}>
                {url}
              </a>
            </div>
          </Card>
        );
      }
      
      // 非URL内容直接显示
      return <span key={index}>{part}</span>;
    });
  };

  return <div className={styles.messageContent}>{parseContent()}</div>;
};

export default MessageContent; 