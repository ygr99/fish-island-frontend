import React from 'react';
import { Avatar, Typography, Collapse, Spin, Alert } from 'antd';
import { UserOutlined, RobotOutlined, BulbOutlined, LoadingOutlined, WarningOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import MarkdownRenderer from './MarkdownRenderer';

const { Text, Paragraph } = Typography;
const { Panel } = Collapse;

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  model?: string;
  thinking?: string;
  reasoning_process?: string;
  error?: boolean;
  errorMessage?: string;
}

interface ModelConfig {
  key: string;
  name: string;
  provider: string;
  icon: string;
  accessKey?: string;
  apiEndpoint?: string;
}

interface MessageItemProps {
  message: Message;
  models: ModelConfig[];
}

// 使用React.memo优化性能，当消息内容没有变化时不会重新渲染
const MessageItem: React.FC<MessageItemProps> = React.memo(({ message, models }) => {
  // 获取模型信息
  const getModelInfo = () => {
    if (message.model) {
      const model = models.find(m => m.key === message.model);
      if (model) {
        return `${model.icon} ${model.name}`;
      }
    }
    return null;
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
  };

  // 判断是否为用户消息
  const isUser = message.role === 'user';
  
  // 判断AI是否正在思考（消息为空时）
  const isThinking = !isUser && message.content === '';
  
  // 判断是否有思考或推理过程
  const hasThinking = !!(message.thinking || message.reasoning_process);
  
  // 获取思考/推理内容，优先使用reasoning_process
  const getThinkingContent = () => {
    return message.reasoning_process || message.thinking || '';
  };

  // 判断是否正在推理中（内容为空但有推理过程）
  const isReasoning = !isUser && message.content === '' && hasThinking;

  // 判断是否为错误消息
  const isError = !isUser && message.error === true;

  // 自定义加载图标
  const loadingIcon = <LoadingOutlined style={{ fontSize: 24, color: '#1890ff' }} spin />;

  // 判断内容是否包含Markdown语法
  const containsMarkdown = (content: string): boolean => {
    // 至少需要满足多个模式才认为是Markdown
    let matchCount = 0;
    
    const markdownPatterns = [
      /^#{1,6}\s.+$/m,                // 标题，必须有内容
      /(`{1,3})[\s\S]*?\1/,           // 代码块或行内代码
      /\[.+?\]\(.+?\)/,               // 链接
      /!\[.+?\]\(.+?\)/,              // 图片
      /^(\s*[-*+]\s+)(?!\[[x ]\]).*$/m, // 无序列表（非任务列表）
      /^\s*\d+\.\s+.+$/m,             // 有序列表
      /^\s*([-*+])\s+\[[x ]\].+$/m,   // 任务列表
      /^\|.+\|.+\|$/m,                // 表格
      /^>.+$/m,                       // 引用块
      /^-{3,}$/m,                     // 水平线
      /\*\*.+?\*\*/,                  // 粗体
      /\*.+?\*/,                      // 斜体
      /~~.+?~~/,                      // 删除线
      /^```[\s\S]+?```$/m             // 多行代码块
    ];
    
    // 计算匹配数量
    markdownPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        matchCount++;
      }
    });

    // 如果包含三个或以上的Markdown格式，或者包含代码块，则认为是Markdown
    if (matchCount >= 2) {
      return true;
    }
    
    // 特殊处理：如果包含代码块，一定是Markdown
    const codeBlockRegex = /```[\s\S]+?```/;
    if (codeBlockRegex.test(content)) {
      return true;
    }
    
    return false;
  };

  return (
    <div className={`message-item ${isUser ? 'user-message' : 'ai-message'}`}>
      <div className="message-container" style={{ justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
        {!isUser && (
          <Avatar 
            className="message-avatar"
            icon={<RobotOutlined />} 
            style={{ backgroundColor: '#52c41a' }}
          />
        )}
        
        <div className="message-bubble" style={{ 
          marginLeft: isUser ? 'auto' : '8px',
          marginRight: isUser ? '8px' : 'auto',
          background: isUser ? 'linear-gradient(145deg, #5e9cea, #4881d6)' : '#f5f5f5',
          color: isUser ? 'white' : 'rgba(0, 0, 0, 0.85)',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          maxWidth: '80%'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '6px'
          }}>
            <Text strong style={{ color: isUser ? 'white' : 'rgba(0, 0, 0, 0.85)' }}>
              {isUser ? '用户' : '助手'}
              {!isUser && getModelInfo() && (
                <Text style={{ marginLeft: 8, fontSize: 12, color: 'rgba(0, 0, 0, 0.45)' }}>
                  ({getModelInfo()})
                </Text>
              )}
            </Text>
            
            <Text className="message-time" style={{ 
              color: isUser ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.45)',
              marginLeft: '12px',
              fontSize: '11px'
            }}>
              {formatTime(message.timestamp)}
            </Text>
          </div>
          
          {isThinking && !hasThinking ? (
            // 纯等待状态，没有思考过程
            <div className="thinking-animation">
              <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0' }}>
                <Spin indicator={loadingIcon} />
                <Text style={{ marginLeft: 12, color: 'rgba(0, 0, 0, 0.65)' }}>
                  AI正在思考中
                </Text>
              </div>
              <div className="typing-animation">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          ) : isReasoning ? (
            // 正在推理中，显示实时推理过程
            <div className="thinking-process">
              <div className="thinking-process-header">
                <BulbOutlined className="bulb-icon" />
                <Text className="thinking-title">思考过程：</Text>
                <Spin indicator={<LoadingOutlined style={{ fontSize: 14, marginLeft: '8px' }} spin />} />
              </div>
              <div className="message-thinking">
                {getThinkingContent()}
              </div>
            </div>
          ) : isError ? (
            // 错误消息显示
            <Alert
              message="请求错误"
              description={
                <div className="error-message">
                  <div className="error-title">
                    <WarningOutlined style={{ color: '#ff4d4f', marginRight: '8px' }} /> 
                    服务器返回错误:
                  </div>
                  <div className="error-content">
                    {message.errorMessage || message.content.replace('[错误] 请求失败：', '')}
                  </div>
                  <div className="error-hint">
                    常见错误原因: API密钥不正确、服务器连接问题、模型不可用或请求参数错误
                  </div>
                </div>
              }
              type="error"
              showIcon={false}
              className="error-alert"
              style={{ borderRadius: '8px' }}
            />
          ) : (
            // 内容已有，显示响应内容
            <div className="message-content" style={{ color: isUser ? 'white' : 'rgba(0, 0, 0, 0.85)' }}>
              {!isUser && containsMarkdown(message.content) ? (
                <MarkdownRenderer content={message.content} />
              ) : (
                <Paragraph style={{ color: isUser ? 'white' : 'rgba(0, 0, 0, 0.85)' }}>
                  {message.content}
                </Paragraph>
              )}
            </div>
          )}
          
          {/* 思考过程完成且有内容时，在折叠面板中显示 */}
          {message.content && hasThinking && !isUser && (
            <Collapse 
              ghost 
              className="thinking-collapse"
              expandIcon={({ isActive }) => 
                <BulbOutlined 
                  style={{ 
                    color: isActive ? '#faad14' : 'rgba(0, 0, 0, 0.45)',
                    fontSize: 16
                  }} 
                />
              }
            >
              <Panel 
                header={<Text type="secondary">思考过程</Text>} 
                key="thinking"
              >
                <div className="message-thinking">
                  {containsMarkdown(getThinkingContent()) ? (
                    <MarkdownRenderer content={getThinkingContent()} />
                  ) : (
                    getThinkingContent()
                  )}
                </div>
              </Panel>
            </Collapse>
          )}
        </div>
        
        {isUser && (
          <Avatar 
            className="message-avatar"
            icon={<UserOutlined />} 
            style={{ backgroundColor: '#1890ff' }}
          />
        )}
      </div>
    </div>
  );
});

export default MessageItem; 