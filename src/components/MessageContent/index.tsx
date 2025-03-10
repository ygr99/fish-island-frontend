import React, {useState} from 'react';
import {Card, Image} from 'antd';
import {BilibiliOutlined, LinkOutlined} from '@ant-design/icons';
import styles from './index.less';

const DOUYIN_ICON = 'https://lf1-cdn-tos.bytegoofy.com/goofy/ies/douyin_web/public/favicon.ico';
const CODEFATHER_ICON = 'https://www.codefather.cn/favicon.ico';

interface MessageContentProps {
  content: string;
}

interface BilibiliVideoInfo {
  title: string;
  description: string;
  icon: string;
  url: string;
}

interface CodefatherPostInfo {
  title: string;
  url: string;
}

const MessageContent: React.FC<MessageContentProps> = ({content}) => {
  const [bilibiliVideos, setBilibiliVideos] = useState<Record<string, BilibiliVideoInfo>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [codefatherPosts, setCodefatherPosts] = useState<Record<string, CodefatherPostInfo>>({});
  // URL匹配正则表达式
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  // 图片标签匹配正则表达式
  const imgRegex = /\[img\](.*?)\[\/img\]/g;

  // 截断文本到指定长度
  const truncateText = (text: string, maxLength: number = 20) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  // 获取B站视频信息
  const fetchBilibiliMetadata = async (url: string) => {
    setLoading(prev => ({...prev, [url]: true}));
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

      const metadata = {title, description, icon, url};
      setBilibiliVideos(prev => ({...prev, [url]: metadata}));
    } catch (error) {
      console.error('获取 Bilibili URL 元数据失败:', error);
      setBilibiliVideos(prev => ({
        ...prev,
        [url]: {
          title: 'Bilibili',
          description: '解析功能暂时失效啦',
          icon: 'https://www.bilibili.com/favicon.ico',
          url
        }
      }));
    } finally {
      setLoading(prev => ({...prev, [url]: false}));
    }
  };

  const extractCodefatherId = (url: string): string | null => {
    const match = url.match(/post\/(\d+)/);
    return match ? match[1] : null;
  };

  const fetchCodefatherMetadata = async (url: string) => {
    setLoading(prev => ({...prev, [url]: true}));
    try {
      const postId = extractCodefatherId(url);
      if (!postId) return;

      const apiUrl = `https://api.codefather.cn/api/post/get/vo?id=${postId}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.code === 0) {
        setCodefatherPosts(prev => ({
          ...prev,
          [url]: {
            title: data.data.title,
            url
          }
        }));
      }
    } catch (error) {
      console.error('获取编程导航元数据失败:', error);
      setCodefatherPosts(prev => ({
        ...prev,
        [url]: {
          title: '编程导航文章',
          url
        }
      }));
    } finally {
      setLoading(prev => ({...prev, [url]: false}));
    }
  };

  // 解析消息内容
  const parseContent = () => {
    // 先处理图片标签
    const parts = content.split(imgRegex);
    const result = [];
    let index = 0;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i % 2 === 0) {
        // 非图片内容，继续处理URL
        if (part) {
          const urlParts = part.split(urlRegex);
          urlParts.forEach((urlPart, urlIndex) => {
            if (urlPart.match(urlRegex)) {
              // 处理URL
              result.push(renderUrl(urlPart, `${index}-${urlIndex}`));
            } else if (urlPart) {
              // 普通文本
              result.push(<span key={`${index}-${urlIndex}`}>{urlPart}</span>);
            }
          });
        }
      } else {
        // 图片内容
        result.push(
          <Image
            key={`img-${index}`}
            src={part}
            alt="emoticon"
            className={styles.messageImage}
            style={{ maxWidth: '200px', borderRadius: '8px' }}
            preview={true}
          />
        );
      }
      index++;
    }

    return result;
  };

  // 渲染URL内容
  const renderUrl = (url: string, key: string) => {
    // 检查是否是B站链接
    if (url.includes('bilibili.com')) {
      if (!bilibiliVideos[url] && !loading[url]) {
        fetchBilibiliMetadata(url);
      }

      return (
        <Card
          key={key}
          className={styles.linkCard}
          size="small"
          hoverable
        >
          <div className={styles.linkContent}>
            <BilibiliOutlined className={styles.linkIcon}/>
            <div className={styles.linkInfo}>
              {bilibiliVideos[url] ? (
                <>
                  <div className={styles.videoTitle}>
                    {bilibiliVideos[url].title === '出错啦! - bilibili.com'
                      ? 'Bilibili 视频(解析好像被墙了🥺)'
                      : bilibiliVideos[url].title}
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
          key={key}
          className={styles.linkCard}
          size="small"
          hoverable
        >
          <div className={styles.linkContent}>
            <img src={DOUYIN_ICON} alt="抖音" className={styles.linkIcon} style={{width: '16px', height: '16px'}}/>
            <a href={url} target="_blank" rel="noopener noreferrer" className={styles.linkText}>
              {url}
            </a>
          </div>
        </Card>
      );
    }

    // 检查是否是编程导航链接
    if (url.includes('codefather.cn/post/')) {
      if (!codefatherPosts[url] && !loading[url]) {
        fetchCodefatherMetadata(url);
      }

      return (
        <Card
          key={key}
          className={styles.linkCard}
          size="small"
          hoverable
        >
          <div className={styles.linkContent}>
            <img src={CODEFATHER_ICON} alt="编程导航" className={styles.linkIcon}
                 style={{width: '16px', height: '16px'}}/>
            <div className={styles.linkInfo}>
              {codefatherPosts[url] ? (
                <>
                  <div className={styles.videoTitle}>{codefatherPosts[url].title}</div>
                  <a href={url} target="_blank" rel="noopener noreferrer" className={styles.linkText}>
                    {truncateText(url, 30)}
                  </a>
                </>
              ) : (
                <a href={url} target="_blank" rel="noopener noreferrer" className={styles.linkText}>
                  {truncateText(url, 30)}
                </a>
              )}
            </div>
          </div>
        </Card>
      );
    }

    // 其他URL显示为普通链接
    return (
      <Card
        key={key}
        className={styles.linkCard}
        size="small"
        hoverable
      >
        <div className={styles.linkContent}>
          <LinkOutlined className={styles.linkIcon}/>
          <a href={url} target="_blank" rel="noopener noreferrer" className={styles.linkText}>
            {url}
          </a>
        </div>
      </Card>
    );
  };

  return <div className={styles.messageContent}>{parseContent()}</div>;
};

export default MessageContent;
