import React, { useState, useEffect } from 'react';
import { Card, Typography, Spin } from 'antd';
import { LinkOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface MessageContentProps {
  content: string;
}

interface UrlMetadata {
  title: string;
  description?: string;
  icon?: string;
  url: string;
}

const MessageContent: React.FC<MessageContentProps> = ({ content }) => {
  const [urls, setUrls] = useState<Array<{ url: string; isCard: boolean }>>([]);
  const [textParts, setTextParts] = useState<string[]>([]);
  const [urlMetadata, setUrlMetadata] = useState<{ [key: string]: UrlMetadata }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    // URL匹配正则表达式
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = content.match(urlRegex) || [];
    
    // 将文本分割成URL和非URL部分
    let lastIndex = 0;
    const parts: string[] = [];
    const urlObjects: Array<{ url: string; isCard: boolean }> = [];

    matches.forEach((url) => {
      const index = content.indexOf(url, lastIndex);
      if (index > lastIndex) {
        parts.push(content.slice(lastIndex, index));
      }
      parts.push(url);
      lastIndex = index + url.length;

      // 检查URL是否可以解析为卡片
      const isCard = url.includes('youtube.com') || url.includes('bilibili.com');
      urlObjects.push({ url, isCard });
      
      // 如果是卡片类型的URL，获取元数据
      if (isCard) {
        fetchUrlMetadata(url);
      }
    });

    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    setTextParts(parts);
    setUrls(urlObjects);
  }, [content]);

  const fetchUrlMetadata = async (url: string) => {
    setLoading(prev => ({ ...prev, [url]: true }));
    try {
      // 使用代理服务来获取网页内容
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      const html = await response.text();

      // 创建一个临时的 DOM 解析器
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // 获取标题
      const title = doc.querySelector('title')?.textContent || url;

      // 获取描述
      const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
                         doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || undefined;

      // 获取图标
      const icon = doc.querySelector('link[rel="icon"]')?.getAttribute('href') ||
                  doc.querySelector('link[rel="shortcut icon"]')?.getAttribute('href') ||
                  new URL('/favicon.ico', url).toString();

      const metadata: UrlMetadata = {
        title,
        description,
        icon,
        url
      };
      
      setUrlMetadata(prev => ({ ...prev, [url]: metadata }));
    } catch (error) {
      console.error('获取URL元数据失败:', error);
      // 如果获取失败，使用默认数据
      const metadata: UrlMetadata = {
        title: url.includes('youtube.com') ? 'YouTube视频' : 'Bilibili视频',
        description: '这是一个视频链接',
        icon: url.includes('youtube.com') 
          ? 'https://www.youtube.com/favicon.ico'
          : 'https://www.bilibili.com/favicon.ico',
        url
      };
      setUrlMetadata(prev => ({ ...prev, [url]: metadata }));
    } finally {
      setLoading(prev => ({ ...prev, [url]: false }));
    }
  };

  const renderUrlCard = (url: string) => {
    const metadata = urlMetadata[url];
    const isLoading = loading[url];

    if (isLoading) {
      return (
        <Card
          size="small"
          style={{ margin: '4px 0', maxWidth: '300px' }}
        >
          <Spin size="small" />
        </Card>
      );
    }

    return (
      <Card
        size="small"
        style={{ margin: '4px 0', maxWidth: '300px' }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {metadata?.icon && (
              <img 
                src={metadata.icon} 
                alt="favicon" 
                style={{ width: '16px', height: '16px' }}
                onError={(e) => {
                  // 如果图标加载失败，使用默认图标
                  const target = e.target as HTMLImageElement;
                  target.src = url.includes('youtube.com') 
                    ? 'https://www.youtube.com/favicon.ico'
                    : 'https://www.bilibili.com/favicon.ico';
                }}
              />
            )}
            <span style={{ 
              fontWeight: 'bold', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap',
              flex: 1
            }}>
              {metadata?.title || url}
            </span>
          </div>
        }
        extra={<LinkOutlined />}
      >
        {metadata?.description && (
          <div style={{ 
            fontSize: '12px', 
            color: '#666',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginBottom: '8px'
          }}>
            {metadata.description}
          </div>
        )}
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            display: 'block',
            fontSize: '12px',
            color: '#1890ff',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {url}
        </a>
      </Card>
    );
  };

  return (
    <div style={{ 
      maxWidth: '100%',
      wordBreak: 'break-word',
      overflow: 'hidden'
    }}>
      {textParts.map((part, index) => {
        const urlObject = urls.find(u => u.url === part);
        if (urlObject) {
          return urlObject.isCard ? (
            <div key={index} style={{ display: 'inline-block', width: '100%' }}>{renderUrlCard(part)}</div>
          ) : (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                color: '#1890ff',
                wordBreak: 'break-all',
                display: 'inline-block',
                maxWidth: '100%'
              }}
            >
              {part}
            </a>
          );
        }
        return (
          <Text 
            key={index}
            style={{
              display: 'inline',
              wordBreak: 'break-word'
            }}
          >
            {part}
          </Text>
        );
      })}
    </div>
  );
};

export default MessageContent; 