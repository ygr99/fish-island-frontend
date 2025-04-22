import React, { useState, useEffect, useRef } from 'react';
import { Layout, Typography, Input, Button, Select, Space, List, Tooltip, message, Card, Spin, Dropdown, Menu } from 'antd';
import { SendOutlined, RobotOutlined, SettingOutlined, LoadingOutlined, StopOutlined, DeleteOutlined, HistoryOutlined, PlusOutlined } from '@ant-design/icons';
import './index.less';
import ModelSettings from './components/ModelSettings';
import MessageItem from './components/MessageItem';
import { Message, ModelConfig } from './services/openaiService';
import OpenAIService from './services/openaiService';
import dayjs from 'dayjs';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

// 默认集成的AI模型列表
const DEFAULT_MODELS = [
  // DeepSeek 模型
  { key: 'deepseek-chat', name: 'DeepSeek V3', provider: 'DeepSeek', icon: '🔍', modelType: 'deepseek-chat', apiEndpoint: 'https://api.deepseek.com', openaiCompatible: true },
  { key: 'deepseek-reasoner', name: 'DeepSeek R1', provider: 'DeepSeek', icon: '💬', modelType: 'deepseek-reasoner', apiEndpoint: 'https://api.deepseek.com', openaiCompatible: true },

  // 硅基流动
  { key: 'deepseek-ai/DeepSeek-V3', name: '硅基流动 DeepSeek V3', provider: 'Siliconflow', icon: '👁️', modelType: 'deepseek-ai/DeepSeek-V3', apiEndpoint: 'https://api.siliconflow.cn', openaiCompatible: true },
  { key: 'deepseek-ai/DeepSeek-R1', name: '硅基流动 DeepSeek R1', provider: 'Siliconflow', icon: '✨', modelType: 'deepseek-ai/DeepSeek-R1', apiEndpoint: 'https://api.siliconflow.cn', openaiCompatible: true },

  // 阿里模型
  { key: 'qwen-turbo', name: '通义千问Turbo', provider: 'Alibaba', icon: '⚡', modelType: 'qwen-turbo', openaiCompatible: true, apiEndpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/' },
  { key: 'qwen-plus', name: '通义千问Plus', provider: 'Alibaba', icon: '➕', modelType: 'qwen-plus', openaiCompatible: true, apiEndpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/' },
  { key: 'qwen-max', name: '通义千问Max', provider: 'Alibaba', icon: '🔍', modelType: 'qwen-max', openaiCompatible: true, apiEndpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/' },
];

// 对话会话接口
interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: number;
  updatedAt: number;
}

const AIAgent: React.FC = () => {
  // 状态管理
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState<string>('deepseek-chat');
  const [models, setModels] = useState<ModelConfig[]>(DEFAULT_MODELS);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // 当前服务实例
  const openaiServiceRef = useRef<OpenAIService | null>(null);

  // 引用
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<any>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 监听消息变化，自动滚动
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 从本地存储加载数据
  useEffect(() => {
    // 加载保存的对话历史
    const savedConversations = localStorage.getItem('ai-agent-conversations');
    if (savedConversations) {
      try {
        const parsedConversations = JSON.parse(savedConversations);
        setConversations(parsedConversations);

        // 如果有当前会话ID，加载该会话
        const currentId = localStorage.getItem('ai-agent-current-conversation');
        if (currentId) {
          setCurrentConversationId(currentId);
          const currentConversation = parsedConversations.find((c: Conversation) => c.id === currentId);
          if (currentConversation) {
            setMessages(currentConversation.messages);
            setCurrentModel(currentConversation.model);
          }
        }
      } catch (e) {
        console.error('Failed to parse saved conversations', e);
      }
    }

    // 加载保存的模型
    const savedModels = localStorage.getItem('ai-agent-models');
    if (savedModels) {
      try {
        setModels(JSON.parse(savedModels));
      } catch (e) {
        console.error('Failed to parse saved models', e);
      }
    }

    // 如果没有加载会话，则加载当前模型
    if (!currentConversationId) {
      const savedCurrentModel = localStorage.getItem('ai-agent-current-model');
      if (savedCurrentModel) {
        setCurrentModel(savedCurrentModel);
      }
    }
  }, []);

  // 保存对话会话到本地存储
  useEffect(() => {
    // 如果当前会话已经存在，更新它
    if (currentConversationId && messages.length > 0) {
      const updatedConversations = conversations.map(conversation => {
        if (conversation.id === currentConversationId) {
          return {
            ...conversation,
            messages,
            model: currentModel,
            updatedAt: Date.now() // 仅在消息变化时更新时间戳
          };
        }
        return conversation;
      });

      setConversations(updatedConversations);
      localStorage.setItem('ai-agent-conversations', JSON.stringify(updatedConversations));
    }
  }, [messages, currentModel, currentConversationId]);

  // 保存会话列表到本地存储
  useEffect(() => {
    localStorage.setItem('ai-agent-conversations', JSON.stringify(conversations));
  }, [conversations]);

  // 保存当前会话ID到本地存储
  useEffect(() => {
    if (currentConversationId) {
      localStorage.setItem('ai-agent-current-conversation', currentConversationId);
    }
  }, [currentConversationId]);

  // 保存模型到本地存储
  useEffect(() => {
    localStorage.setItem('ai-agent-models', JSON.stringify(models));
  }, [models]);

  // 保存当前模型到本地存储
  useEffect(() => {
    localStorage.setItem('ai-agent-current-model', currentModel);
  }, [currentModel]);

  // 创建新会话
  const createNewConversation = () => {
    const newId = Date.now().toString();
    const newConversation: Conversation = {
      id: newId,
      title: `新对话 ${conversations.length + 1}`,
      messages: [],
      model: currentModel,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    setConversations([...conversations, newConversation]);
    setCurrentConversationId(newId);
    setMessages([]);
  };

  // 切换会话
  const switchConversation = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setCurrentConversationId(conversationId);
      setMessages(conversation.messages);
      setCurrentModel(conversation.model);
      // 不更新updatedAt时间戳，避免对话被置顶
    }
  };

  // 处理发送消息
  const handleSendMessage = async () => {
    if (!inputText.trim() || loading) return;

    // 获取当前选择的模型信息
    const modelInfo = models.find(m => m.key === currentModel);
    if (!modelInfo) {
      message.error('所选模型不存在');
      return;
    }

    // 检查是否设置了API密钥
    if (!modelInfo.accessKey) {
      message.error('请先在设置中配置API密钥');
      setSettingsVisible(true);
      return;
    }

    // 如果没有当前会话，创建一个新会话
    if (!currentConversationId || conversations.length === 0) {
      createNewConversation();
    }

    // 创建用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: Date.now(),
    };

    // 创建助手消息占位符
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: Date.now() + 1,
      model: currentModel,
    };

    // 添加消息
    const newMessages = [...messages, userMessage, assistantMessage];
    setMessages(newMessages);

    // 清空输入框
    setInputText('');
    setLoading(true);

    // 更新会话标题（如果是第一条消息）
    if (messages.length === 0) {
      const titleText = inputText.length > 20 ? `${inputText.substring(0, 20)}...` : inputText;
      const updatedConversations = conversations.map(conversation => {
        if (conversation.id === currentConversationId) {
          return {
            ...conversation,
            title: titleText,
            messages: newMessages,
            // 保留创建时间用于排序，仅更新消息
          };
        }
        return conversation;
      });
      setConversations(updatedConversations);
    }

    // 创建OpenAI服务实例
    const openaiService = new OpenAIService(modelInfo, messages);
    openaiServiceRef.current = openaiService;

    try {
      // 发送消息
      await openaiService.sendMessage(
        inputText,
        false,
        {
          onMessage: (content) => {
            // 更新消息内容（流式响应）
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage && lastMessage.role === 'assistant') {
                lastMessage.content += content;
              }
              return newMessages;
            });
            // 强制更新DOM，确保流式输出实时显示
            setTimeout(() => {
              if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
              }
            }, 0);
          },
          onReasoningProcess: (content) => {
            // 更新思考过程内容（流式响应）
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage && lastMessage.role === 'assistant') {
                // 如果已有thinking属性则追加，否则初始化
                lastMessage.thinking = (lastMessage.thinking || '') + content;
                // 将推理过程保存到reasoning_process
                lastMessage.reasoning_process = (lastMessage.reasoning_process || '') + content;
                // 创建一个新对象以触发React重新渲染
                newMessages[newMessages.length - 1] = { ...lastMessage };
              }
              return [...newMessages]; // 确保返回新数组以触发重新渲染
            });
            // 强制更新DOM，确保流式输出实时显示
            setTimeout(() => {
              if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
              }
            }, 0);
          },
          onError: (error) => {
            // 将错误信息添加到助手消息中，而不是弹窗
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage && lastMessage.role === 'assistant') {
                // 如果助手消息为空，添加错误信息
                if (!lastMessage.content) {
                  // 添加错误信息标识，用特殊格式标记
                  lastMessage.content = `[错误] 请求失败：${error}`;
                  // 添加错误类型标记，用于UI渲染时特殊处理
                  lastMessage.error = true;
                  lastMessage.errorMessage = String(error);
                }
              }
              return newMessages;
            });

            // 设置状态为非加载
            setLoading(false);
          },
          onComplete: () => {
            setLoading(false);
            openaiServiceRef.current = null;
            if (textAreaRef.current) {
              textAreaRef.current.focus();
            }
          },
        }
      );
    } catch (error: any) {
      console.error('发送消息失败', error);
      message.error(`发送消息失败: ${error.message}`);
      setLoading(false);
      openaiServiceRef.current = null;
    }
  };

  // 取消当前请求
  const handleCancelRequest = () => {
    if (openaiServiceRef.current) {
      openaiServiceRef.current.cancel();
      openaiServiceRef.current = null;
      setLoading(false);
      message.info('已取消请求');
    }
  };

  // 处理输入框键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 回车键发送，Shift+回车换行
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 处理清空对话
  const handleClearConversation = () => {
    if (currentConversationId) {
      const updatedConversations = conversations.map(conversation => {
        if (conversation.id === currentConversationId) {
          return {
            ...conversation,
            messages: [],
            // 不更新updatedAt，避免对话被置顶
          };
        }
        return conversation;
      });
      setConversations(updatedConversations);
    }
    setMessages([]);
  };

  // 删除当前会话
  const handleDeleteConversation = (id: string) => {
    const updatedConversations = conversations.filter(c => c.id !== id);
    setConversations(updatedConversations);

    // 如果删除的是当前会话，切换到第一个会话或创建新会话
    if (id === currentConversationId) {
      if (updatedConversations.length > 0) {
        switchConversation(updatedConversations[0].id);
      } else {
        setCurrentConversationId(null);
        setMessages([]);
      }
    }
  };

  // 添加自定义模型
  const handleAddModel = (model: ModelConfig) => {
    setModels((prev) => [...prev, model]);
    message.success(`成功添加模型: ${model.name}`);
  };

  // 更新模型配置
  const handleUpdateModel = (model: ModelConfig) => {
    setModels((prev) =>
      prev.map((m) => (m.key === model.key ? model : m))
    );
    message.success(`成功更新模型: ${model.name}`);
  };

  // 删除模型
  const handleDeleteModel = (modelKey: string) => {
    setModels((prev) => prev.filter((m) => m.key !== modelKey));

    // 如果删除当前选中的模型，则切换到第一个模型
    if (modelKey === currentModel && models.length > 1) {
      const nextModel = models.find(m => m.key !== modelKey);
      if (nextModel) {
        setCurrentModel(nextModel.key);
      }
    }

    message.success('已删除模型');
  };

  // 构建对话历史菜单
  const historyMenu = (
    <Menu>
      {conversations.length === 0 ? (
        <Menu.Item key="empty" disabled>
          暂无对话历史
        </Menu.Item>
      ) : (
        conversations
          .sort((a, b) => b.createdAt - a.createdAt) // 按创建时间而非更新时间排序
          .map(conversation => (
            <Menu.Item
              key={conversation.id}
              onClick={() => switchConversation(conversation.id)}
              style={{
                padding: '10px 16px'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%'
              }}>
                <div style={{ flex: 1, overflow: 'hidden', marginRight: '8px' }}>
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {conversation.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(0, 0, 0, 0.45)', marginTop: '4px' }}>
                    创建于: {dayjs(conversation.createdAt).format('YYYY-MM-DD HH:mm')}
                  </div>
                </div>
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  style={{ flexShrink: 0, lineHeight: 1 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConversation(conversation.id);
                  }}
                />
              </div>
            </Menu.Item>
          ))
      )}
    </Menu>
  );

  return (
    <Layout className="ai-agent-container">
      <Header className="ai-agent-header">
        <div className="header-left">
          <RobotOutlined className="header-icon" />
          <Title level={4} className="header-title">AI智能体</Title>
        </div>
        <div className="header-right">
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={createNewConversation}
            >
              新建对话
            </Button>
            <Dropdown overlay={historyMenu} placement="bottomRight" trigger={['click']}>
              <Button icon={<HistoryOutlined />} type="text">
                对话历史
              </Button>
            </Dropdown>

            <Select
              value={currentModel}
              onChange={setCurrentModel}
              style={{ width: 180 }}
              dropdownMatchSelectWidth={false}
              disabled={loading}
              optionLabelProp="label"
              optionFilterProp="label"
              showSearch
              options={models.map((model) => ({
                value: model.key,
                label: `${model.icon} ${model.name}`,
                children: (
                  <Space>
                    <span>{model.icon}</span>
                    <span>{model.name}</span>
                    <Text type="secondary" style={{ fontSize: '12px' }}>({model.provider})</Text>
                  </Space>
                )
              }))}
            />
            <Tooltip title="模型设置">
              <Button
                icon={<SettingOutlined />}
                onClick={() => setSettingsVisible(true)}
                type="text"
                disabled={loading}
              />
            </Tooltip>
          </Space>
        </div>
      </Header>

      <Content className="ai-agent-content">
        <div className="messages-container" ref={messageContainerRef}>
          {messages.length === 0 ? (
            <div className="empty-state">
              <RobotOutlined className="empty-icon" />
              <Text className="empty-title">开始与AI智能体对话</Text>
              <Text className="empty-subtitle">
                您可以询问任何问题，AI将会尽力回答
              </Text>
              <Text className="empty-notice" type="secondary" style={{ marginTop: '10px' }}>
                本AI智能体基于OpenAI库实现，支持各种大语言模型，提供流畅稳定的体验
              </Text>
            </div>
          ) : (
            <div className="messages-wrapper">
              <div className="messages-header">
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleClearConversation}
                  disabled={loading || messages.length === 0}
                >
                  清空对话
                </Button>
              </div>
              {messages.map((message, index) => (
                <MessageItem
                  key={`${message.id}-${index}-${message.content.length}`}
                  message={message}
                  models={models}
                />
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <Card className="input-card">
            <div className="input-options">
              {loading && (
                <Button
                  danger
                  type="primary"
                  icon={<StopOutlined />}
                  onClick={handleCancelRequest}
                >
                  停止生成
                </Button>
              )}
            </div>

            <div className="textarea-container">
              <TextArea
                ref={textAreaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入您的问题，按回车发送，Shift+回车换行..."
                autoSize={{ minRows: 1, maxRows: 6 }}
                disabled={loading}
              />
              <Button
                type="primary"
                icon={loading ? <LoadingOutlined /> : <SendOutlined />}
                onClick={handleSendMessage}
                disabled={!inputText.trim() || loading}
                className="send-button"
              />
            </div>
            <Text type="secondary" className="input-hint">
              提示: 使用 回车键 快捷发送消息，Shift+回车 换行
            </Text>
          </Card>
        </div>
      </Content>

      <ModelSettings
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        models={models}
        onAddModel={handleAddModel}
        onUpdateModel={handleUpdateModel}
        onDeleteModel={handleDeleteModel}
      />
    </Layout>
  );
};

export default AIAgent; 