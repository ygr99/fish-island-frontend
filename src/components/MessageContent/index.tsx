import React, {useState} from 'react';
import {Card, Image, Button} from 'antd';
import {BilibiliOutlined, LinkOutlined, FileOutlined, DownloadOutlined} from '@ant-design/icons';
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
  // 文件标签匹配正则表达式
  const fileRegex = /\[file\](.*?)\[\/file\]/g;

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

  // 处理文件下载
  const handleFileDownload = (url: string) => {
    // 从URL中提取文件名
    const fileName = url.split('/').pop() || '未知文件';
    
    // 创建一个临时的a标签来触发下载
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 渲染文件
  const renderFile = (url: string, key: string) => {
    const fileName = url.split('/').pop() || '未知文件';
    const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
    
    // 获取文件图标
    const getFileIcon = (ext: string) => {
      // 可以根据文件类型返回不同的图标
      const iconMap: { [key: string]: React.ReactNode } = {
        pdf: <FileOutlined style={{ color: '#ff4d4f' }} />,
        doc: <FileOutlined style={{ color: '#1890ff' }} />,
        docx: <FileOutlined style={{ color: '#1890ff' }} />,
        xls: <FileOutlined style={{ color: '#52c41a' }} />,
        xlsx: <FileOutlined style={{ color: '#52c41a' }} />,
        txt: <FileOutlined style={{ color: '#722ed1' }} />,
        // 可以添加更多文件类型
      };
      return iconMap[ext] || <FileOutlined style={{ color: '#1890ff' }} />;
    };

    return (
      <div key={key} className={styles.fileContainer}>
        <Card className={styles.fileCard} size="small">
          <div className={styles.fileInfo}>
            <span className={styles.fileIcon}>
              {getFileIcon(fileExt)}
            </span>
            <span className={styles.fileName} title={fileName}>
              {fileName}
            </span>
          </div>
          <Button 
            type="link" 
            className={styles.downloadButton}
            onClick={() => handleFileDownload(url)}
          >
            <DownloadOutlined /> 下载文件
          </Button>
        </Card>
      </div>
    );
  };

  const parseContent = () => {
    let parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    // 处理图片标签
    while ((match = imgRegex.exec(content)) !== null) {
      // 添加图片前的文本
      if (match.index > lastIndex) {
        const textBeforeImg = content.slice(lastIndex, match.index);
        // 处理文本中的URL
        const urlParts = textBeforeImg.split(urlRegex);
        urlParts.forEach((urlPart, urlIndex) => {
          if (urlPart.match(urlRegex)) {
            parts.push(renderUrl(urlPart, `url-${match!.index}-${urlIndex}`));
          } else if (urlPart) {
            parts.push(<span key={`text-${match!.index}-${urlIndex}`}>{urlPart}</span>);
          }
        });
      }
      // 添加图片组件
      parts.push(
        <Image
          key={`img-${match.index}`}
          src={match[1]}
          alt="聊天图片"
          style={{maxWidth: '200px', borderRadius: '4px'}}
        />
      );
      lastIndex = match.index + match[0].length;
    }

    // 处理文件标签
    const remainingContent = content.slice(lastIndex);
    let fileLastIndex = 0;
    let fileMatch: RegExpExecArray | null;

    while ((fileMatch = fileRegex.exec(remainingContent)) !== null) {
      // 处理文件前的文本（包括URL解析）
      if (fileMatch.index > fileLastIndex) {
        const textBeforeFile = remainingContent.slice(fileLastIndex, fileMatch.index);
        // 处理文本中的URL
        const urlParts = textBeforeFile.split(urlRegex);
        urlParts.forEach((urlPart, urlIndex) => {
          if (urlPart.match(urlRegex)) {
            parts.push(renderUrl(urlPart, `url-file-${fileMatch!.index}-${urlIndex}`));
          } else if (urlPart) {
            parts.push(<span key={`text-file-${fileMatch!.index}-${urlIndex}`}>{urlPart}</span>);
          }
        });
      }
      // 添加文件组件
      parts.push(renderFile(fileMatch[1], `file-${fileMatch.index}`));
      fileLastIndex = fileMatch.index + fileMatch[0].length;
    }

    // 处理剩余文本中的URL
    if (fileLastIndex < remainingContent.length) {
      const finalText = remainingContent.slice(fileLastIndex);
      const urlParts = finalText.split(urlRegex);
      urlParts.forEach((urlPart, urlIndex) => {
        if (urlPart.match(urlRegex)) {
          parts.push(renderUrl(urlPart, `url-final-${urlIndex}`));
        } else if (urlPart) {
          parts.push(<span key={`text-final-${urlIndex}`}>{urlPart}</span>);
        }
      });
    }

    return parts;
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
