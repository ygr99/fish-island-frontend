import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Select, List, Space, Tabs, Typography, Divider, Popconfirm, message, Empty, Card } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, ApiOutlined, KeyOutlined, TagOutlined, AppstoreOutlined, LinkOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TabPane } = Tabs;
const { Text, Title } = Typography;

interface ModelConfig {
  key: string;
  name: string;
  provider: string;
  icon: string;
  accessKey?: string;
  apiEndpoint?: string;
  modelType?: string;
}

// 提供商接口
interface ProviderConfig {
  key: string;
  name: string;
  icon: string;
  endpoint: string;
  models: { value: string; label: string }[];
  apiKeyUrl?: string;
}

interface ModelSettingsProps {
  visible: boolean;
  onClose: () => void;
  models: ModelConfig[];
  onAddModel: (model: ModelConfig) => void;
  onUpdateModel: (model: ModelConfig) => void;
  onDeleteModel: (modelKey: string) => void;
}

const DEFAULT_ICONS = ['🤖', '🧠', '🔮', '📝', '💎', '👨‍💻', '🔍', '✨', '🧩', '🌈', '🚀', '🔬', '🌐', '🎯', '🦾', '🔆', '⚡', '🌟'];

// 默认提供商和模型配置
const DEFAULT_PROVIDERS: ProviderConfig[] = [
  {
    key: 'DeepSeek',
    name: 'DeepSeek',
    icon: '👨‍💻',
    endpoint: 'https://api.deepseek.com',
    models: [
      { value: 'deepseek-chat', label: 'DeepSeek V3' },
      { value: 'deepseek-reasoner', label: 'DeepSeek R1' },
    ],
    apiKeyUrl: 'https://platform.deepseek.com/api_keys'
  },
  {
    key: 'Siliconflow',
    name: '硅基流动',
    icon: '🤖',
    endpoint: 'https://api.siliconflow.cn',
    models: [
      { value: 'deepseek-ai/DeepSeek-V3', label: 'DeepSeek V3' },
      { value: 'deepseek-ai/DeepSeek-R1', label: 'DeepSeek R1' },
    ],
    apiKeyUrl: 'https://cloud.siliconflow.cn/account/ak'
  },
  {
    key: 'Alibaba',
    name: '阿里巴巴',
    icon: '🔍',
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/',
    models: [
      { value: 'qwen-turbo', label: '通义千问Turbo' },
      { value: 'qwen-max', label: '通义千问Max' },
      { value: 'qwen-plus', label: '通义千问Plus' },
    ],
    apiKeyUrl: 'https://bailian.console.aliyun.com/?tab=model#/api-key'
  }
];

const STORAGE_KEY_PROVIDERS = 'ai-agent-providers';

const ModelSettings: React.FC<ModelSettingsProps> = ({
  visible,
  onClose,
  models,
  onAddModel,
  onUpdateModel,
  onDeleteModel,
}) => {
  const [form] = Form.useForm();
  const [providerForm] = Form.useForm();
  const [modelTypeForm] = Form.useForm();
  
  const [editMode, setEditMode] = useState(false);
  const [currentModelKey, setCurrentModelKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('manage');
  
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [currentProvider, setCurrentProvider] = useState<string>('');
  const [providerOptions, setProviderOptions] = useState<{ value: string; label: string }[]>([]);
  const [modelOptions, setModelOptions] = useState<{ value: string; label: string }[]>([]);
  
  const [editProviderMode, setEditProviderMode] = useState(false);
  const [currentProviderKey, setCurrentProviderKey] = useState<string | null>(null);
  
  const [editModelTypeMode, setEditModelTypeMode] = useState(false);
  const [currentModelTypeKey, setCurrentModelTypeKey] = useState<string | null>(null);

  // 初始化加载提供商数据
  useEffect(() => {
    // 从本地存储加载自定义提供商列表
    const savedProviders = localStorage.getItem(STORAGE_KEY_PROVIDERS);
    if (savedProviders) {
      try {
        const parsedProviders = JSON.parse(savedProviders);
        setProviders(parsedProviders);
      } catch (e) {
        console.error('Failed to parse saved providers', e);
        setProviders(DEFAULT_PROVIDERS);
      }
    } else {
      // 首次使用，使用默认提供商列表
      setProviders(DEFAULT_PROVIDERS);
      localStorage.setItem(STORAGE_KEY_PROVIDERS, JSON.stringify(DEFAULT_PROVIDERS));
    }
  }, []);

  // 当模态窗口打开时重置标签页
  useEffect(() => {
    if (visible) {
      setActiveTab('manage');
    }
  }, [visible]);

  // 当提供商列表变化时，更新选项
  useEffect(() => {
    const options = providers.map(provider => ({
      value: provider.key,
      label: `${provider.icon} ${provider.name}`
    }));
    setProviderOptions(options);
    
    // 如果没有选择提供商，默认选择第一个
    if (!currentProvider && providers.length > 0) {
      setCurrentProvider(providers[0].key);
      updateModelOptions(providers[0].key);
    }
  }, [providers]);

  // 根据当前选择的提供商，更新模型选项
  const updateModelOptions = (providerKey: string) => {
    const provider = providers.find(p => p.key === providerKey);
    if (provider) {
      setModelOptions(provider.models);
    } else {
      setModelOptions([]);
    }
  };

  // 重置表单
  const resetForm = () => {
    form.resetFields();
    setEditMode(false);
    setCurrentModelKey(null);
    
    if (providers.length > 0) {
      setCurrentProvider(providers[0].key);
      updateModelOptions(providers[0].key);
    }
  };

  // 重置提供商表单
  const resetProviderForm = () => {
    providerForm.resetFields();
    setEditProviderMode(false);
    setCurrentProviderKey(null);
  };

  // 重置模型类型表单
  const resetModelTypeForm = () => {
    modelTypeForm.resetFields();
    setEditModelTypeMode(false);
    setCurrentModelTypeKey(null);
  };

  // 表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // 创建模型配置
      const modelConfig: ModelConfig = {
        key: editMode && currentModelKey ? currentModelKey : `model-${Date.now()}`,
        name: values.name,
        provider: values.provider,
        icon: values.icon,
        accessKey: values.accessKey,
        apiEndpoint: values.apiEndpoint,
        modelType: values.modelType,
      };

      // 添加或更新模型
      if (editMode && currentModelKey) {
        onUpdateModel(modelConfig);
      } else {
        onAddModel(modelConfig);
      }

      // 重置表单并切换到管理标签页
      resetForm();
      setActiveTab('manage');
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  // 提供商表单提交
  const handleProviderSubmit = async () => {
    try {
      const values = await providerForm.validateFields();
      
      // 创建提供商配置
      const providerConfig: ProviderConfig = {
        key: editProviderMode && currentProviderKey ? currentProviderKey : `provider-${Date.now()}`,
        name: values.name,
        icon: values.icon,
        endpoint: values.endpoint,
        apiKeyUrl: values.apiKeyUrl,
        models: editProviderMode && currentProviderKey 
          ? (providers.find(p => p.key === currentProviderKey)?.models || [])
          : [],
      };
      
      // 更新提供商列表
      if (editProviderMode && currentProviderKey) {
        setProviders(prev => prev.map(p => p.key === currentProviderKey ? providerConfig : p));
      } else {
        setProviders(prev => [...prev, providerConfig]);
      }
      
      // 保存到本地存储
      localStorage.setItem(STORAGE_KEY_PROVIDERS, JSON.stringify(
        editProviderMode && currentProviderKey
          ? providers.map(p => p.key === currentProviderKey ? providerConfig : p)
          : [...providers, providerConfig]
      ));
      
      // 重置表单
      resetProviderForm();
      message.success(`成功${editProviderMode ? '更新' : '添加'}提供商: ${values.name}`);
    } catch (error) {
      console.error('Provider form validation failed:', error);
    }
  };

  // 添加模型类型
  const handleAddModelType = async () => {
    try {
      const values = await modelTypeForm.validateFields();
      
      // 找到当前提供商
      const provider = providers.find(p => p.key === currentProvider);
      if (!provider) {
        message.error('请先选择提供商');
        return;
      }
      
      // 创建模型类型
      const modelType = {
        value: editModelTypeMode && currentModelTypeKey 
          ? currentModelTypeKey 
          : values.value,
        label: values.label,
      };
      
      // 更新提供商的模型列表
      const updatedProviders = providers.map(p => {
        if (p.key === currentProvider) {
          if (editModelTypeMode && currentModelTypeKey) {
            // 更新模式
            return {
              ...p,
              models: p.models.map(m => m.value === currentModelTypeKey ? modelType : m)
            };
          } else {
            // 添加模式
            return {
              ...p,
              models: [...p.models, modelType]
            };
          }
        }
        return p;
      });
      
      setProviders(updatedProviders);
      
      // 保存到本地存储
      localStorage.setItem(STORAGE_KEY_PROVIDERS, JSON.stringify(updatedProviders));
      
      // 重置表单
      resetModelTypeForm();
      updateModelOptions(currentProvider);
      message.success(`成功${editModelTypeMode ? '更新' : '添加'}模型类型: ${values.label}`);
    } catch (error) {
      console.error('Model type form validation failed:', error);
    }
  };

  // 删除提供商
  const handleDeleteProvider = (providerKey: string) => {
    // 检查是否有模型使用了这个提供商
    const usedInModels = models.some(model => model.provider === providerKey);
    if (usedInModels) {
      message.error('该提供商已被模型使用，无法删除');
      return;
    }
    
    // 从列表中移除提供商
    const updatedProviders = providers.filter(p => p.key !== providerKey);
    setProviders(updatedProviders);
    
    // 保存到本地存储
    localStorage.setItem(STORAGE_KEY_PROVIDERS, JSON.stringify(updatedProviders));
    
    message.success('已删除提供商');
    
    // 如果删除的是当前选中的提供商，则重新选择
    if (providerKey === currentProvider && updatedProviders.length > 0) {
      setCurrentProvider(updatedProviders[0].key);
      updateModelOptions(updatedProviders[0].key);
    }
  };

  // 编辑提供商
  const handleEditProvider = (provider: ProviderConfig) => {
    setEditProviderMode(true);
    setCurrentProviderKey(provider.key);
    
    providerForm.setFieldsValue({
      name: provider.name,
      icon: provider.icon,
      endpoint: provider.endpoint,
      apiKeyUrl: provider.apiKeyUrl || '',
    });
  };

  // 删除模型类型
  const handleDeleteModelType = (modelTypeValue: string) => {
    // 检查是否有模型使用了这个模型类型
    const usedInModels = models.some(model => model.modelType === modelTypeValue);
    if (usedInModels) {
      message.error('该模型类型已被使用，无法删除');
      return;
    }
    
    // 找到当前提供商
    const provider = providers.find(p => p.key === currentProvider);
    if (!provider) return;
    
    // 从列表中移除模型类型
    const updatedProviders = providers.map(p => {
      if (p.key === currentProvider) {
        return {
          ...p,
          models: p.models.filter(m => m.value !== modelTypeValue)
        };
      }
      return p;
    });
    
    setProviders(updatedProviders);
    
    // 保存到本地存储
    localStorage.setItem(STORAGE_KEY_PROVIDERS, JSON.stringify(updatedProviders));
    
    message.success('已删除模型类型');
    updateModelOptions(currentProvider);
  };

  // 编辑模型类型
  const handleEditModelType = (modelType: { value: string; label: string }) => {
    setEditModelTypeMode(true);
    setCurrentModelTypeKey(modelType.value);
    
    modelTypeForm.setFieldsValue({
      value: modelType.value,
      label: modelType.label,
    });
  };

  // 编辑模型
  const handleEdit = (model: ModelConfig) => {
    console.log(model)
    setEditMode(true);
    setCurrentModelKey(model.key);
    setActiveTab('add');
    setCurrentProvider(model.provider);
    
    // 更新模型选项
    updateModelOptions(model.provider);
    
    form.setFieldsValue({
      name: model.name,
      provider: model.provider,
      icon: model.icon,
      accessKey: model.accessKey || '',
      apiEndpoint: model.apiEndpoint || '',
      modelType: model.modelType || '',
    });
  };

  // 删除模型
  const handleDelete = (modelKey: string) => {
    onDeleteModel(modelKey);
  };

  // 标签页切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (key === 'add') {
      resetForm();
    }
  };

  // 提供商变化时处理
  const handleProviderChange = (value: string) => {
    setCurrentProvider(value);
    updateModelOptions(value);
    
    // 获取提供商的默认API端点
    const provider = providers.find(p => p.key === value);
    if (provider) {
      form.setFieldsValue({ 
        apiEndpoint: provider.endpoint,
        // 如果切换了提供商，则清空模型类型
        modelType: undefined
      });
    }
  };
  
  // 模型类型变化时，自动设置模型名称
  const handleModelTypeChange = (value: string) => {
    if (!value) return;
    
    // 查找选中的模型选项
    const selectedModel = modelOptions.find(option => option.value === value);
    if (selectedModel && !editMode) {
      // 如果是添加模式，自动设置模型名称
      const provider = providers.find(p => p.key === currentProvider);
      const providerText = provider ? `(${provider.name})` : '';
      form.setFieldsValue({ 
        name: `${selectedModel.label}${providerText}`
      });
    }
  };

  // 打开获取密钥的URL
  const openApiKeyUrl = (providerKey: string) => {
    const provider = providers.find(p => p.key === providerKey);
    if (provider && provider.apiKeyUrl) {
      window.open(provider.apiKeyUrl, '_blank');
    } else {
      message.info('该提供商未提供API密钥获取地址');
    }
  };

  return (
    <Modal
      title="AI模型设置"
      open={visible}
      onCancel={() => {
        resetForm();
        resetProviderForm();
        resetModelTypeForm();
        setActiveTab('manage');
        onClose();
      }}
      footer={null}
      width={700}
    >
      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <TabPane tab="管理模型" key="manage">
          <div style={{ minHeight: 300, maxHeight: 500, overflow: 'auto' }}>
            <List
              itemLayout="horizontal"
              dataSource={models}
              locale={{ emptyText: <Empty description="暂无模型，请点击'添加模型'按钮添加" /> }}
              renderItem={(model) => (
                <List.Item
                  actions={[
                    (() => {
                      const providerConfig = providers.find(p => p.key === model.provider);
                      return providerConfig?.apiKeyUrl ? (
                        <Button
                          key="getKey"
                          type="link"
                          onClick={() => openApiKeyUrl(model.provider)}
                        >
                          获取密钥
                        </Button>
                      ) : null;
                    })(),
                    <Button
                      key="edit"
                      icon={<EditOutlined />}
                      type="text"
                      onClick={() => handleEdit(model)}
                    />,
                    <Popconfirm
                      key="delete"
                      title="确定要删除此模型吗？"
                      onConfirm={() => handleDelete(model.key)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button
                        icon={<DeleteOutlined />}
                        type="text"
                        danger
                      />
                    </Popconfirm>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<div style={{ fontSize: 24 }}>{model.icon}</div>}
                    title={model.name}
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary">提供商: {model.provider}</Text>
                        {model.modelType && <Text type="secondary">模型类型: {model.modelType}</Text>}
                        {model.accessKey && <Text type="secondary">API密钥: ••••••••</Text>}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setActiveTab('add')}
            >
              添加模型
            </Button>
          </div>
        </TabPane>
        
        <TabPane tab="管理提供商" key="providers">
          <div style={{ minHeight: 300, maxHeight: 500, overflow: 'auto' }}>
            <List
              itemLayout="horizontal"
              dataSource={providers}
              locale={{ emptyText: <Empty description="暂无提供商，请点击'添加提供商'按钮添加" /> }}
              renderItem={(provider) => (
                <List.Item
                  actions={[
                    <Button
                      key="edit"
                      icon={<EditOutlined />}
                      type="text"
                      onClick={() => handleEditProvider(provider)}
                    />,
                    <Popconfirm
                      key="delete"
                      title="确定要删除此提供商吗？"
                      onConfirm={() => handleDeleteProvider(provider.key)}
                      okText="确定"
                      cancelText="取消"
                      disabled={models.some(model => model.provider === provider.key)}
                    >
                      <Button
                        icon={<DeleteOutlined />}
                        type="text"
                        danger
                        disabled={models.some(model => model.provider === provider.key)}
                      />
                    </Popconfirm>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<div style={{ fontSize: 24 }}>{provider.icon}</div>}
                    title={provider.name}
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary">API端点: {provider.endpoint}</Text>
                        {provider.apiKeyUrl && <Text type="secondary">API密钥获取: <a href={provider.apiKeyUrl} target="_blank" rel="noopener noreferrer">获取密钥</a></Text>}
                        <Text type="secondary">模型数量: {provider.models.length}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
          
          <Divider orientation="left">添加/编辑提供商</Divider>
          
          <Form
            form={providerForm}
            layout="vertical"
            initialValues={{
              icon: '🤖',
            }}
          >
            <Form.Item
              name="name"
              label="提供商名称"
              rules={[{ required: true, message: '请输入提供商名称' }]}
            >
              <Input placeholder="例如: DeekSeek" />
            </Form.Item>
            
            <Form.Item
              name="icon"
              label="图标"
              rules={[{ required: true, message: '请选择图标' }]}
            >
              <Select>
                {DEFAULT_ICONS.map((icon) => (
                  <Option key={icon} value={icon}>
                    <Space>
                      <span style={{ fontSize: 20 }}>{icon}</span>
                      <span>{icon}</span>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="endpoint"
              label="默认API端点"
              rules={[{ required: true, message: '请输入API端点URL' }]}
              tooltip="此提供商的默认API端点地址"
            >
              <Input
                prefix={<ApiOutlined />}
                placeholder="https://api.example.com"
              />
            </Form.Item>
            
            <Form.Item
              name="apiKeyUrl"
              label="API密钥获取地址"
              tooltip="用户可以从这个地址获取API密钥（选填）"
            >
              <Input
                prefix={<LinkOutlined />}
                placeholder="https://example.com/get-api-key"
              />
            </Form.Item>
            
            <Form.Item>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Space>
                  <Button onClick={resetProviderForm}>
                    取消
                  </Button>
                  <Button type="primary" onClick={handleProviderSubmit}>
                    {editProviderMode ? '更新提供商' : '添加提供商'}
                  </Button>
                </Space>
              </div>
            </Form.Item>
          </Form>
        </TabPane>
        
        <TabPane tab="管理模型类型" key="modelTypes">
          <div style={{ marginBottom: 16 }}>
            <Form.Item label="选择提供商">
              <Select
                value={currentProvider}
                onChange={setCurrentProvider}
                style={{ width: '100%' }}
                placeholder="请选择提供商"
                optionLabelProp="label"
              >
                {providers.map((provider) => (
                  <Option key={provider.key} value={provider.key} label={`${provider.icon} ${provider.name}`}>
                    <Space>
                      <span>{provider.icon}</span>
                      <span>{provider.name}</span>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          
          {currentProvider && (
            <>
              <div style={{ minHeight: 200, maxHeight: 300, overflow: 'auto' }}>
                <List
                  itemLayout="horizontal"
                  dataSource={providers.find(p => p.key === currentProvider)?.models || []}
                  locale={{ emptyText: <Empty description="该提供商暂无模型类型，请添加" /> }}
                  renderItem={(modelType) => (
                    <List.Item
                      actions={[
                        <Button
                          key="edit"
                          icon={<EditOutlined />}
                          type="text"
                          onClick={() => handleEditModelType(modelType)}
                        />,
                        <Popconfirm
                          key="delete"
                          title="确定要删除此模型类型吗？"
                          onConfirm={() => handleDeleteModelType(modelType.value)}
                          okText="确定"
                          cancelText="取消"
                          disabled={models.some(model => model.modelType === modelType.value)}
                        >
                          <Button
                            icon={<DeleteOutlined />}
                            type="text"
                            danger
                            disabled={models.some(model => model.modelType === modelType.value)}
                          />
                        </Popconfirm>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<TagOutlined style={{ fontSize: 18 }} />}
                        title={modelType.label}
                        description={<Text type="secondary">ID: {modelType.value}</Text>}
                      />
                    </List.Item>
                  )}
                />
              </div>
              
              <Divider orientation="left">添加/编辑模型类型</Divider>
              
              <Form
                form={modelTypeForm}
                layout="vertical"
              >
                <Form.Item
                  name="value"
                  label="模型ID"
                  rules={[{ required: true, message: '请输入模型ID' }]}
                  tooltip="模型的唯一标识符，用于API请求"
                >
                  <Input placeholder="例如: deepseek-chat" disabled={editModelTypeMode} />
                </Form.Item>
                
                <Form.Item
                  name="label"
                  label="显示名称"
                  rules={[{ required: true, message: '请输入显示名称' }]}
                  tooltip="模型的友好显示名称"
                >
                  <Input placeholder="例如: DeepSeek V3" />
                </Form.Item>
                
                <Form.Item>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Space>
                      <Button onClick={resetModelTypeForm}>
                        取消
                      </Button>
                      <Button type="primary" onClick={handleAddModelType} disabled={!currentProvider}>
                        {editModelTypeMode ? '更新模型类型' : '添加模型类型'}
                      </Button>
                    </Space>
                  </div>
                </Form.Item>
              </Form>
            </>
          )}
        </TabPane>
        
        <TabPane tab={editMode ? "编辑模型" : "添加模型"} key="add">
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              icon: '🤖',
              provider: providers.length > 0 ? providers[0].key : '',
            }}
          >
            <Form.Item
              name="provider"
              label="提供商"
              rules={[{ required: true, message: '请选择提供商' }]}
            >
              <Select 
                onChange={handleProviderChange}
                optionLabelProp="label"
              >
                {providers.map((provider) => (
                  <Option key={provider.key} value={provider.key} label={`${provider.icon} ${provider.name}`}>
                    <Space>
                      <span>{provider.icon}</span>
                      <span>{provider.name}</span>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="modelType"
              label="模型类型"
              rules={[{ required: true, message: '请选择模型类型' }]}
            >
              <Select 
                onChange={handleModelTypeChange}
                showSearch
                optionFilterProp="label"
                placeholder="选择模型类型"
              >
                {modelOptions.map((option) => (
                  <Option key={option.value} value={option.value} label={option.label}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="name"
              label="显示名称"
              rules={[{ required: true, message: '请输入模型名称' }]}
            >
              <Input placeholder="例如: DeepSeek V3" />
            </Form.Item>
            
            <Form.Item
              name="icon"
              label="图标"
              rules={[{ required: true, message: '请选择图标' }]}
            >
              <Select>
                {DEFAULT_ICONS.map((icon) => (
                  <Option key={icon} value={icon}>
                    <Space>
                      <span style={{ fontSize: 20 }}>{icon}</span>
                      <span>{icon}</span>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            <Divider orientation="left">API配置</Divider>
            
            <Form.Item
              name="accessKey"
              label="API密钥"
              rules={[{ required: true, message: '请输入API密钥' }]}
              tooltip="AI提供商的API访问密钥，将安全存储在本地"
            >
              <Input
                prefix={<KeyOutlined />}
                placeholder="输入您的API密钥"
              />
            </Form.Item>
            
            <Form.Item
              name="apiEndpoint"
              label="API端点"
              rules={[{ required: true, message: '请输入API端点URL' }]}
              tooltip="AI服务提供商的API端点地址"
            >
              <Input
                prefix={<ApiOutlined />}
                placeholder="https://api.example.com"
              />
            </Form.Item>
            
            <Form.Item>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Space>
                  <Button onClick={() => {
                    resetForm();
                    setActiveTab('manage');
                  }}>
                    取消
                  </Button>
                  <Button type="primary" onClick={handleSubmit}>
                    {editMode ? '更新' : '添加'}
                  </Button>
                </Space>
              </div>
            </Form.Item>
          </Form>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default ModelSettings; 