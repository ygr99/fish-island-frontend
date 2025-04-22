import React, { useState, useEffect } from 'react';
import { 
  Drawer, 
  Form, 
  Input, 
  Button, 
  Select, 
  Space, 
  Alert, 
  Typography, 
  Divider, 
  Tabs,
  message,
  Tooltip,
  Tag,
  Table,
  Modal,
  Row,
  Col,
  Card
} from 'antd';
import { RobotOutlined, SettingOutlined, InfoCircleOutlined, ApiOutlined, FormOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';  // 导入history用于路由导航

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// 模型配置接口
interface ModelConfig {
  key: string;
  name: string;
  provider: string;
  icon: string;
  accessKey?: string;
  apiEndpoint?: string;
  modelType?: string;
  openaiCompatible?: boolean;
}

// 模板变量接口
interface TemplateVariable {
  key: string;
  description: string;
  value: string;
}

// 获取本地存储的模型配置
const getLocalModels = (): ModelConfig[] => {
  try {
    const storedModels = localStorage.getItem('ai-agent-models');
    if (storedModels) {
      return JSON.parse(storedModels);
    }
  } catch (e) {
    console.error('解析AI模型配置失败:', e);
  }
  return [];
};

// 判断模型是否已完成配置
const isModelConfigured = (modelKey: string): boolean => {
  const models = getLocalModels();
  const model = models.find(m => m.key === modelKey);
  return !!(model && model.accessKey);
};

interface AITemplateSettingsProps {
  visible: boolean;
  onClose: () => void;
  settings: {
    modelKey: string;
    prompt: string;
    template: string;
    variables: TemplateVariable[];
  };
  onSave: (settings: any) => void;
}

// 示例提示词
const PROMPT_EXAMPLES = [
  {
    title: '示例1: 基础优化',
    content: '你是一个专业的工作周报助手，请帮我优化以下周报内容，使其更加专业和有条理。保持原有的数据准确性，但可以优化表述方式和结构。'
  },
  {
    title: '示例2: 详细优化',
    content: `你是一个专业的工作周报助手，请根据以下内容生成一份专业的周报：
1. 针对本周工作内容，请提炼重点，按重要性排序，并使用专业术语改写
2. 在工作亮点部分，强调成果和影响，使用数据支持（如有）
3. 对于下周计划，请确保条理清晰，有明确的时间节点
4. 问题与建议部分，应提供具体、可行的解决方案`
  }
];

// 示例周报模板
const TEMPLATE_EXAMPLES = [
  {
    title: '标准周报模板',
    content: `
### 本周工作总结
-
### 工作亮点
- 
### 下周工作计划
- 
### 问题与建议
- `
  },
];

// 简化文本区域样式
const textAreaStyle = {
  fontFamily: 'monospace',
  fontSize: '14px'
};

const AITemplateSettings: React.FC<AITemplateSettingsProps> = ({
  visible,
  onClose,
  settings,
  onSave
}) => {
  const [form] = Form.useForm();
  const [variableForm] = Form.useForm();
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [currentTab, setCurrentTab] = useState('model');
  const [modelConfigured, setModelConfigured] = useState(false);
  const [isVariableModalVisible, setIsVariableModalVisible] = useState(false);
  const [editingVariable, setEditingVariable] = useState<TemplateVariable | null>(null);
  const [variables, setVariables] = useState<TemplateVariable[]>([]);
  
  // 初始化加载模型列表
  useEffect(() => {
    const localModels = getLocalModels();
    setModels(localModels);
    
    // 检查当前选择的模型是否已配置
    if (settings.modelKey) {
      setModelConfigured(isModelConfigured(settings.modelKey));
    }
  }, [settings.modelKey, visible]);
  
  // 抽屉打开时，重置表单
  useEffect(() => {
    if (visible) {
      // console.log('设置表单值:', settings);
      form.setFieldsValue({
        modelKey: settings.modelKey,
        prompt: settings.prompt,
        template: settings.template,
      });
      setVariables(settings.variables || []);
    }
  }, [visible, form, settings]);

  // 打开AI模型设置页面
  const openModelSettings = () => {
    // 使用 history 导航到 AI 智能体页面
    message.info('正在跳转到AI智能体设置页面...');
    history.push('/utils/ai-agent');
    onClose();
  };
  
  // 模型选择变化
  const handleModelChange = (value: string) => {
    setModelConfigured(isModelConfigured(value));
  };
  
  // 打开变量编辑对话框
  const showVariableModal = (variable?: TemplateVariable) => {
    if (variable) {
      setEditingVariable(variable);
      variableForm.setFieldsValue(variable);
    } else {
      setEditingVariable(null);
      variableForm.resetFields();
    }
    setIsVariableModalVisible(true);
  };
  
  // 保存变量
  const handleSaveVariable = async () => {
    try {
      const values = await variableForm.validateFields();
      
      if (editingVariable) {
        // 更新现有变量
        const updated = variables.map(v => 
          v.key === editingVariable.key ? values : v
        );
        setVariables(updated);
      } else {
        // 添加新变量
        // 检查key是否重复
        if (variables.some(v => v.key === values.key)) {
          message.error(`变量 ${values.key} 已存在`);
          return;
        }
        setVariables([...variables, values]);
      }
      
      setIsVariableModalVisible(false);
      message.success(`${editingVariable ? '更新' : '添加'}变量成功`);
    } catch (error) {
      console.error('变量表单验证失败:', error);
    }
  };
  
  // 删除变量
  const deleteVariable = (key: string) => {
    const updated = variables.filter(v => v.key !== key);
    setVariables(updated);
    message.success('删除变量成功');
  };
  
  // 表单提交处理
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // 保存设置
      onSave({
        modelKey: values.modelKey,
        prompt: values.prompt,
        template: values.template,
        variables: variables,
      });
      
      message.success('AI模板设置已保存');
      onClose();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 使用示例提示词
  const usePromptExample = (content: string) => {
    form.setFieldsValue({ prompt: content });
    message.success('已应用示例提示词');
  };

  // 使用示例模板
  const useTemplateExample = (content: string) => {
    form.setFieldsValue({ template: content });
    message.success('已应用示例模板');
  };

  // 变量表格列配置
  const columns = [
    {
      title: '变量名',
      dataIndex: 'key',
      key: 'key',
      render: (text: string) => `{${text}}`,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '默认值',
      dataIndex: 'value',
      key: 'value',
      render: (text: string) => text || '(空)',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: TemplateVariable) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => showVariableModal(record)}
          />
          <Button 
            type="text" 
            danger
            icon={<DeleteOutlined />} 
            onClick={() => deleteVariable(record.key)}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <RobotOutlined style={{ marginRight: 8 }} />
            <span>周报AI模板设置</span>
          </div>
        }
        width={700}
        placement="right"
        onClose={onClose}
        open={visible}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={onClose}>取消</Button>
              <Button type="primary" onClick={handleSubmit}>
                保存设置
              </Button>
            </Space>
          </div>
        }
      >
        <Tabs activeKey={currentTab} onChange={setCurrentTab}>
          <TabPane 
            tab={
              <span>
                <RobotOutlined />
                AI模型
              </span>
            } 
            key="model"
          >
            <Form 
              form={form} 
              layout="vertical"
              initialValues={{
                modelKey: settings.modelKey,
                prompt: settings.prompt,
                template: settings.template,
              }}
            >
              <Form.Item
                name="modelKey"
                label="选择AI模型"
                rules={[{ required: true, message: '请选择AI模型' }]}
                tooltip="选择用于生成周报的AI模型，确保已设置API密钥"
              >
                <Select 
                  placeholder="请选择AI模型" 
                  onChange={handleModelChange}
                  optionLabelProp="label"
                  dropdownMatchSelectWidth={false}
                  style={{ width: '100%' }}
                >
                  {models.map(model => (
                    <Option 
                      key={model.key} 
                      value={model.key}
                      label={`${model.icon} ${model.name}`}
                    >
                      <Space>
                        <span>{model.icon}</span>
                        <span>{model.name}</span>
                        <Text type="secondary" style={{ fontSize: '12px' }}>({model.provider})</Text>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              {!modelConfigured && (
                <Alert
                  message="模型配置不完整"
                  description={
                    <div>
                      <p>所选模型尚未配置API密钥，请前往AI智能体设置密钥。</p>
                      <Button type="primary" onClick={openModelSettings}>
                        前往设置
                      </Button>
                    </div>
                  }
                  type="warning"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}
              
              {models.length === 0 && (
                <Alert
                  message="未找到AI模型"
                  description={
                    <div>
                      <p>系统中未配置任何AI模型，请前往AI智能体添加和配置模型。</p>
                      <Button type="primary" onClick={openModelSettings}>
                        前往设置
                      </Button>
                    </div>
                  }
                  type="error"
                  showIcon
                />
              )}
            </Form>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <FormOutlined />
                AI提示词
              </span>
            } 
            key="prompt"
          >
            <Form 
              form={form} 
              layout="vertical"
              initialValues={{
                modelKey: settings.modelKey,
                prompt: settings.prompt,
                template: settings.template,
              }}
            >
              <Alert
                message="提示词说明"
                description="设置给AI的提示词，告诉AI如何处理周报模板。提示词应该清晰说明AI需要做什么。"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              
              <Form.Item
                name="prompt"
                label="AI提示词"
                rules={[{ required: true, message: '请输入AI提示词' }]}
                tooltip="设置生成周报时给AI的指令"
              >
                <TextArea 
                  rows={10} 
                  placeholder="请输入AI提示词，告诉AI如何处理周报模板" 
                  style={textAreaStyle}
                  autoSize={{ minRows: 10, maxRows: 20 }}
                />
              </Form.Item>
              
              <div style={{ marginBottom: 16 }}>
                <Divider orientation="left">提示词示例</Divider>
                {PROMPT_EXAMPLES.map((example, index) => (
                  <Card 
                    key={index} 
                    size="small" 
                    style={{ marginBottom: index < PROMPT_EXAMPLES.length - 1 ? 16 : 0 }}
                    extra={
                      <Button 
                        type="link" 
                        size="small" 
                        onClick={() => usePromptExample(example.content)}
                      >
                        应用此示例
                      </Button>
                    }
                  >
                    <Text strong>{example.title}</Text>
                    <Paragraph style={{ color: '#666', whiteSpace: 'pre-wrap' }}>
                      {example.content}
                    </Paragraph>
                  </Card>
                ))}
              </div>
            </Form>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <FormOutlined />
                周报模板
              </span>
            } 
            key="template"
          >
            <Form 
              form={form} 
              layout="vertical"
              initialValues={{
                modelKey: settings.modelKey,
                prompt: settings.prompt,
                template: settings.template,
              }}
            >
              <Alert
                message="模板说明"
                description="您可以设置周报的基本模板，使用 {变量名} 作为占位符，系统会自动替换为对应内容。"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              
              <Form.Item
                name="template"
                label="周报模板"
                tooltip="设置周报的基本模板结构，使用 {变量名} 作为占位符"
                rules={[{ required: true, message: '请输入周报模板' }]}
              >
                <TextArea 
                  rows={10} 
                  placeholder="请输入周报模板，使用 {变量名} 格式引用变量" 
                  style={textAreaStyle}
                  autoSize={{ minRows: 10, maxRows: 20 }}
                />
              </Form.Item>
              
              <div style={{ marginBottom: 16 }}>
                <Divider orientation="left">模板示例</Divider>
                {TEMPLATE_EXAMPLES.map((example, index) => (
                  <Card 
                    key={index} 
                    size="small" 
                    style={{ marginBottom: index < TEMPLATE_EXAMPLES.length - 1 ? 16 : 0 }}
                    extra={
                      <Button 
                        type="link" 
                        size="small" 
                        onClick={() => useTemplateExample(example.content)}
                      >
                        应用此模板
                      </Button>
                    }
                  >
                    <Text strong>{example.title}</Text>
                    <Paragraph style={{ color: '#666', whiteSpace: 'pre-wrap' }}>
                      {example.content}
                    </Paragraph>
                  </Card>
                ))}
              </div>

              <Divider orientation="left">变量管理</Divider>
              
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">
                  在模板中使用 {'{变量名}'} 格式引用变量，系统会自动替换为对应内容
                </Text>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => showVariableModal()}
                >
                  添加变量
                </Button>
              </div>
              
              <Table 
                dataSource={variables} 
                columns={columns} 
                rowKey="key"
                pagination={false}
                size="small"
              />
            </Form>
          </TabPane>
        </Tabs>
      </Drawer>
      
      {/* 变量编辑对话框 */}
      <Modal
        title={`${editingVariable ? '编辑' : '添加'}变量`}
        open={isVariableModalVisible}
        onCancel={() => setIsVariableModalVisible(false)}
        onOk={handleSaveVariable}
      >
        <Form
          form={variableForm}
          layout="vertical"
        >
          <Form.Item
            name="key"
            label="变量名"
            rules={[
              { required: true, message: '请输入变量名' },
              { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '变量名只能包含字母、数字和下划线，且必须以字母开头' }
            ]}
            tooltip="变量名只能包含字母、数字和下划线，且必须以字母开头"
          >
            <Input 
              placeholder="请输入变量名，如 userName" 
              disabled={!!editingVariable}
            />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入变量描述' }]}
          >
            <Input placeholder="请输入变量描述，如 用户姓名" />
          </Form.Item>
          
          <Form.Item
            name="value"
            label="默认值"
          >
            <Input placeholder="请输入变量默认值（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AITemplateSettings; 