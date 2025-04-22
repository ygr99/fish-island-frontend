import { useState, useEffect, useRef } from "react";
import {
  Layout,
  Typography,
  Button,
  List,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Empty,
  Tag,
  Space,
  Divider,
  Card,
  Checkbox,
  Tabs,
  Row,
  Col,
  Radio,
  Tooltip,
  Drawer,
  Descriptions,
  message,
  Spin
} from "antd";
import { PlusOutlined, CheckOutlined, DeleteOutlined, CalendarOutlined, RollbackOutlined, EyeOutlined, FilterOutlined, EditOutlined, SearchOutlined, SettingOutlined, RobotOutlined, CopyOutlined, DownloadOutlined, HistoryOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import locale from "antd/es/date-picker/locale/zh_CN";
import isoWeek from "dayjs/plugin/isoWeek";
import { getTodoUsingPost, saveTodoUsingPost } from "@/services/backend/todoController";

// 导入AI服务相关
import AITemplateSettings from "./components/AITemplateSettings";
// 导入OpenAI服务
import OpenAIService from "../AIAgent/services/openaiService";

dayjs.extend(isoWeek);

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Search } = Input;

// 优先级对应的颜色和emoji
const priorityConfig: any = {
  high: { color: "red", emoji: "🔥", text: "高" },
  medium: { color: "orange", emoji: "⚡", text: "中" },
  low: { color: "blue", emoji: "🌱", text: "低" },
};

// 工作状态
const taskStatus: any = {
  pending: { text: "待完成", color: "processing", icon: "⚡️" },
  completed: { text: "已完成", color: "success", icon: "✅" },
};

interface WeeklyTask {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed';
}

// 添加自定义 hook 用于监听窗口大小
const useWindowSize = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // 初始检查
    checkMobile();

    // 添加窗口大小变化监听
    window.addEventListener('resize', checkMobile);

    // 清理监听器
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

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

// 存储AI模板设置的键
const STORAGE_KEY_AI_TEMPLATE = 'weekly-ai-template';
// 存储生成的周报历史
const STORAGE_KEY_REPORT_HISTORY = 'weekly-report-history';

// 默认AI提示词
const DEFAULT_PROMPT = `你是一个专业的工作周报助手，请根据我提供的工作内容和周报模板帮我生成周报内容，内容要专业和有条理。保持原有的数据准确性，但可以优化表述方式和结构。`;

// 默认周报模板
const DEFAULT_TEMPLATE = `
## 本周工作总结
-
## 工作亮点
- 
## 下周工作计划
- 
## 问题与建议
- 
`;

// 周报历史记录接口
interface ReportHistory {
  id: string;
  content: string;
  date: string;
  title: string;
}

// 模板变量接口
interface TemplateVariable {
  key: string;
  description: string;
  value: string;
}

export default function WeeklyReport() {
  // 状态管理
  const [tasks, setTasks] = useState<WeeklyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [quickAddInput, setQuickAddInput] = useState("");
  const [selectedWeek, setSelectedWeek] = useState(dayjs());
  const [form] = Form.useForm();
  const isMobile = useWindowSize();
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "pending", "completed"
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState<WeeklyTask | null>(null);
  const [searchText, setSearchText] = useState("");
  
  // AI设置相关状态
  const [isAITemplateVisible, setIsAITemplateVisible] = useState(false);
  const [aiTemplateSettings, setAITemplateSettings] = useState<{
    modelKey: string;
    prompt: string;
    template: string;
    variables: TemplateVariable[];
  }>({
    modelKey: '', // AI模型的key
    prompt: DEFAULT_PROMPT, // AI提示词
    template: DEFAULT_TEMPLATE, // 周报模板
    variables: [
      { key: 'userName', description: '用户姓名', value: '我' },
      { key: 'startDate', description: '开始日期', value: '' },
      { key: 'endDate', description: '结束日期', value: '' },
      { key: 'currentWeek', description: '当前周日期范围', value: '' },
      { key: 'thisWeekTasks', description: '本周工作内容', value: '' }
    ],
  });
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  // 周报生成结果相关
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [generatedReport, setGeneratedReport] = useState('');
  const [reportHistory, setReportHistory] = useState<ReportHistory[]>([]);
  const [historyDrawerVisible, setHistoryDrawerVisible] = useState(false);
  
  // AI服务实例引用
  const aiServiceRef = useRef<OpenAIService | null>(null);
  
  // 加载AI模板设置
  useEffect(() => {
    const savedTemplate = localStorage.getItem(STORAGE_KEY_AI_TEMPLATE);
    if (savedTemplate) {
      try {
        const parsedTemplate = JSON.parse(savedTemplate);
        // 确保变量列表存在
        if (!parsedTemplate.variables) {
          parsedTemplate.variables = [
            { key: 'userName', description: '用户姓名', value: '我' },
            { key: 'startDate', description: '开始日期', value: '' },
            { key: 'endDate', description: '结束日期', value: '' },
            { key: 'currentWeek', description: '当前周日期范围', value: '' },
            { key: 'thisWeekTasks', description: '本周工作内容', value: '' }
          ];
        }
        setAITemplateSettings(parsedTemplate);
      } catch (error) {
        console.error('解析AI模板设置失败:', error);
      }
    }
  }, []);

  // 加载历史周报
  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEY_REPORT_HISTORY);
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        if (Array.isArray(parsedHistory)) {
          setReportHistory(parsedHistory);
        }
      } catch (error) {
        console.error('解析周报历史记录失败:', error);
      }
    }
  }, []);

  // 保存AI模板设置
  const saveAITemplateSettings = (settings: any) => {
    setAITemplateSettings(settings);
    localStorage.setItem(STORAGE_KEY_AI_TEMPLATE, JSON.stringify(settings));
  };
  
  // 打开AI模板设置弹窗
  const showAITemplateSettings = () => {
    setIsAITemplateVisible(true);
  };
  
  // 关闭AI模板设置弹窗
  const hideAITemplateSettings = () => {
    setIsAITemplateVisible(false);
  };

  // 取消AI生成
  const cancelAIGeneration = () => {
    if (aiServiceRef.current) {
      aiServiceRef.current.cancel();
      aiServiceRef.current = null;
    }
    setIsGeneratingReport(false);
  };

  // 生成周报
  const generateWeeklyReport = async () => {
    // 检查AI模型选择和API密钥
    if (!aiTemplateSettings.modelKey) {
      message.error('请先设置AI模型和模板');
      showAITemplateSettings();
      return;
    }
    
    // 检查是否存在AI密钥配置
    const models = getLocalModels();
    const model = models.find(m => m.key === aiTemplateSettings.modelKey);
    
    if (!model || !model.accessKey) {
      message.error('AI模型密钥未配置，请先完成配置');
      showAITemplateSettings();
      return;
    }
    
    // 确保提示词和模板都存在
    const prompt = aiTemplateSettings.prompt || DEFAULT_PROMPT;
    const template = aiTemplateSettings.template || DEFAULT_TEMPLATE;
    
    // 如果有正在进行的生成，先取消它
    cancelAIGeneration();
    
    try {
      
      // 获取本周工作内容
      const thisWeekTasksList = currentWeekTasks();
      
      // 检查是否有工作内容
      if (thisWeekTasksList.length === 0) {
        message.warning('本周没有工作内容，生成的周报可能不够详细');
        return;
      }

      setIsGeneratingReport(true);
      setReportModalVisible(true); // 提前显示模态框，显示加载状态
      setGeneratedReport(''); // 清空之前的内容
      

      let thisWeekTasksStr = thisWeekTasksList
        .map((task: WeeklyTask, index: number) => `${index + 1}. ${task.title}${task.status === 'completed' ? `(已完成) ` : ' (进行中)'} \n 详细内容：${task.description || '暂无'} \n 优先级：${task.priority}`)
        .join('\n');

      thisWeekTasksStr = `这是我本周的工作内容：\n${thisWeekTasksStr}`;
      
      // 更新变量的值
      const updatedVariables = aiTemplateSettings.variables.map(variable => {
        let value = variable.value;
        
        // 自动填充特定变量 TODO

        return { ...variable, value };
      });
      
      // 替换模板中的变量
      let reportContent = template;
      
      // 替换所有变量
      updatedVariables.forEach(variable => {
        const regex = new RegExp(`{${variable.key}}`, 'g');
        reportContent = reportContent.replace(regex, variable.value);
      });
      
      // 使用AI服务生成周报
      // 创建系统提示和用户消息
      const systemPrompt = prompt; // AI提示词作为系统消息
      const userContent = `以下是周报模板：\n${reportContent}`; 
      
      // 创建带有系统提示消息的AI服务实例
      // 格式化系统提示消息
      const formattedSystemPrompt = `\n
结果格式和排版按照我给的进行。
1、段落之间不要空行。
2、不要输出任何解释。
3、不要输出任何备注。
`
      const messagesWithSystemPrompt = [
        {
          id: Date.now().toString(),
          role: 'system' as const,
          content: systemPrompt + userContent + formattedSystemPrompt,
          timestamp: Date.now()
        }
      ];
      
      const aiService = new OpenAIService(model, messagesWithSystemPrompt);
      aiServiceRef.current = aiService;
      
      let generatedContent = '';

      // 发送用户消息到AI服务
      await aiService.sendMessage(
        thisWeekTasksStr, // 发送用户消息内容
        false, // 不使用联网搜索
        {
          // 处理流式响应
          onMessage: (content) => {
            generatedContent += content;
            setGeneratedReport(generatedContent);
          },
          // 处理错误
          onError: (error) => {
            message.error(typeof error === 'string' ? error : '生成周报时发生错误');
            console.error('AI生成周报错误:', error);
            setIsGeneratingReport(false);
          },
          // 处理完成
          onComplete: () => {
            // 清理AI服务引用
            aiServiceRef.current = null;
            
            const today = dayjs().format('YYYY-MM-DD HH:mm:ss');
            // 保存到历史记录
            const newHistory: ReportHistory = {
              id: Date.now().toString(),
              content: generatedContent,
              date: today,
              title: `周报 ${today}`
            };
            
            const updatedHistory = [newHistory, ...reportHistory].slice(0, 10); // 保留最新的10条记录
            setReportHistory(updatedHistory);
            localStorage.setItem(STORAGE_KEY_REPORT_HISTORY, JSON.stringify(updatedHistory));
            
            setIsGeneratingReport(false);
            message.success('周报生成完成');
          }
        }
      );
    } catch (error) {
      console.error('生成周报失败:', error);
      
      // 提供更明确的错误信息
      let errorMessage = '生成周报时发生错误';
      
      if (error instanceof Error) {
        errorMessage = `生成失败: ${error.message}`;
      }
      
      message.error(errorMessage);
      setIsGeneratingReport(false);
    }
  };
  
  // 查看历史周报
  const viewHistoryReport = (report: ReportHistory) => {
    if (!report || !report.content) {
      message.error('周报内容为空');
      return;
    }
    
    setGeneratedReport(report.content);
    setReportModalVisible(true);
    setHistoryDrawerVisible(false);
  };

  // 复制周报内容
  const copyReportToClipboard = () => {
    if (!generatedReport) {
      message.error('周报内容为空，无法复制');
      return;
    }
    
    if (navigator.clipboard && window.isSecureContext) {
      // 使用现代Clipboard API
      navigator.clipboard.writeText(generatedReport)
        .then(() => message.success('已复制到剪贴板'))
        .catch((err) => {
          console.error('复制失败:', err);
          message.error('复制失败，请手动复制');
        });
    } else {
      // 回退方案
      try {
        const textArea = document.createElement('textarea');
        textArea.value = generatedReport;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          message.success('已复制到剪贴板');
        } else {
          message.error('复制失败，请手动复制');
        }
      } catch (err) {
        console.error('复制失败:', err);
        message.error('复制失败，请手动复制');
      }
    }
  };
  
  // 导出周报为文本文件
  const exportReportAsText = () => {
    if (!generatedReport) {
      message.error('周报内容为空，无法导出');
      return;
    }
    
    try {
      // 创建Blob对象
      const blob = new Blob([generatedReport], { type: 'text/plain;charset=utf-8' });
      
      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // 设置文件名（格式：周报_YYYY-MM-DD.txt）
      const today = dayjs().format('YYYY-MM-DD');
      link.download = `周报_${today}.txt`;
      
      // 添加到文档并触发点击
      document.body.appendChild(link);
      link.click();
      
      // 清理
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      message.success('周报已导出为文本文件');
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败，请重试');
    }
  };

  // 获取AI模型配置的辅助函数
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

  // 加载工作数据
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const response = await getTodoUsingPost({ type: "weekly" });
        if (response.data) {
          // 确保数据是数组
          const tasksData = Array.isArray(JSON.parse(response.data)) ? JSON.parse(response.data) : [];
          // 验证每个工作的数据结构
          const validTasks = tasksData.filter((task: { 
            id: any; 
            title: any; 
            startDate: any;
            priority: string; 
            status: string 
          }) =>
            task &&
            typeof task.id === 'number' &&
            typeof task.title === 'string' &&
            typeof task.startDate === 'string' &&
            ['high', 'medium', 'low'].includes(task.priority) &&
            ['pending', 'completed'].includes(task.status)
          ) as WeeklyTask[];

          // 只有当远程数据有效时才更新
          if (validTasks.length > 0) {
            setTasks(validTasks);
            localStorage.setItem("weeklyTasks", JSON.stringify(validTasks));
          } else {
            // 如果远程数据无效，尝试从本地加载
            const savedTasks = localStorage.getItem("weeklyTasks");
            if (savedTasks) {
              try {
                const parsedTasks = JSON.parse(savedTasks);
                const localValidTasks = Array.isArray(parsedTasks) ? parsedTasks.filter(task =>
                  task &&
                  typeof task.id === 'number' &&
                  typeof task.title === 'string' &&
                  typeof task.startDate === 'string' &&
                  ['high', 'medium', 'low'].includes(task.priority) &&
                  ['pending', 'completed'].includes(task.status)
                ) as WeeklyTask[] : [];
                if (localValidTasks.length > 0) {
                  setTasks(localValidTasks);
                }
              } catch (error) {
                console.error('解析本地存储数据失败:', error);
                setTasks([]);
              }
            }
          }
        }
      } catch (error) {
        console.error('加载工作失败:', error);
        // 如果远程加载失败，尝试从本地存储加载
        const savedTasks = localStorage.getItem("weeklyTasks");
        if (savedTasks) {
          try {
            const parsedTasks = JSON.parse(savedTasks);
            const validTasks = Array.isArray(parsedTasks) ? parsedTasks.filter(task =>
              task &&
              typeof task.id === 'number' &&
              typeof task.title === 'string' &&
              typeof task.startDate === 'string' &&
              ['high', 'medium', 'low'].includes(task.priority) &&
              ['pending', 'completed'].includes(task.status)
            ) as WeeklyTask[] : [];
            if (validTasks.length > 0) {
              setTasks(validTasks);
            }
          } catch (error) {
            console.error('解析本地存储数据失败:', error);
            setTasks([]);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  // 保存工作到远程和本地存储
  useEffect(() => {
    const saveTasks = async () => {
      try {
        await saveTodoUsingPost({
          todoData: tasks.map(task => ({...task, type: "weekly"}))
        });
        localStorage.setItem("weeklyTasks", JSON.stringify(tasks));
      } catch (error) {
        console.error('保存工作失败:', error);
      }
    };
    if (tasks.length > 0) {
      saveTasks();
    }
  }, [tasks]);

  // 获取当前周的开始和结束日期
  const getCurrentWeekRange = () => {
    const startOfWeek = selectedWeek.startOf('week');
    const endOfWeek = selectedWeek.endOf('week');
    return {
      start: startOfWeek,
      end: endOfWeek,
      formatted: `${startOfWeek.format("MM月DD日")} - ${endOfWeek.format("MM月DD日")}`
    };
  };

  // 打开添加工作模态框
  const showModal = (task?: WeeklyTask) => {
    form.resetFields();
    
    if (task) {
      // 编辑模式
      setIsEditMode(true);
      form.setFieldsValue({
        title: task.title,
        description: task.description || "",
        startDateTime: task.startTime 
          ? dayjs(`${task.startDate} ${task.startTime}`, "YYYY-MM-DD HH:mm:ss") 
          : dayjs(task.startDate),
        endDateTime: task.endDate 
          ? dayjs(`${task.endDate} ${task.endTime || "23:59:59"}`, "YYYY-MM-DD HH:mm:ss")
          : undefined,
        priority: task.priority
      });
      setCurrentTask(task);
    } else {
      // 新增模式
      setIsEditMode(false);
      // 使用当前精确时间
      const now = dayjs();
      form.setFieldsValue({ 
        startDateTime: now,
        endDateTime: now.add(1, 'day'),
        priority: 'medium'
      });
      setCurrentTask(null);
    }
    
    setIsModalVisible(true);
  };

  // 处理工作表单提交（新增或编辑）
  const handleTaskFormSubmit = (values: {
    title: string;
    description: string;
    startDateTime: dayjs.Dayjs;
    endDateTime?: dayjs.Dayjs;
    priority: 'high' | 'medium' | 'low';
  }) => {
    if (isEditMode && currentTask) {
      // 更新工作
      const updatedTasks = tasks.map(task => 
        task.id === currentTask.id 
          ? {
              ...task,
              title: values.title,
              description: values.description,
              startDate: values.startDateTime.format("YYYY-MM-DD"),
              startTime: values.startDateTime.format("HH:mm:ss"),
              endDate: values.endDateTime ? values.endDateTime.format("YYYY-MM-DD") : undefined,
              endTime: values.endDateTime ? values.endDateTime.format("HH:mm:ss") : undefined,
              priority: values.priority,
            }
          : task
      );
      setTasks(updatedTasks);
      message.success("工作更新成功");
    } else {
      // 添加新工作
      const newTask: WeeklyTask = {
        id: Date.now(),
        title: values.title,
        description: values.description,
        startDate: values.startDateTime.format("YYYY-MM-DD"),
        startTime: values.startDateTime.format("HH:mm:ss"),
        endDate: values.endDateTime ? values.endDateTime.format("YYYY-MM-DD") : undefined,
        endTime: values.endDateTime ? values.endDateTime.format("HH:mm:ss") : undefined,
        priority: values.priority,
        status: "pending",
      };
      setTasks([...tasks, newTask]);
      message.success("工作添加成功");
    }
    
    setIsModalVisible(false);
  };

  // 搜索过滤工作
  const searchTasks = (taskList: WeeklyTask[]) => {
    if (!searchText) return taskList;
    
    const lowerSearchText = searchText.toLowerCase();
    return taskList.filter(task => {
      const titleMatch = task.title.toLowerCase().includes(lowerSearchText);
      const descMatch = task.description?.toLowerCase().includes(lowerSearchText);
      return titleMatch || descMatch;
    });
  };

  // 编辑工作
  const editTask = (task: WeeklyTask) => {
    showModal(task);
  };

  // 过滤当前周的工作
  const currentWeekTasks = () => {
    const { start, end } = getCurrentWeekRange();
    let filteredTasks = tasks.filter(task => {
      const taskDate = dayjs(task.startDate);
      return taskDate.isAfter(start) && taskDate.isBefore(end);
    });
    
    // 根据工作状态筛选
    if (statusFilter !== "all") {
      filteredTasks = filteredTasks.filter(task => task.status === statusFilter);
    }
    
    // 搜索过滤
    return searchTasks(filteredTasks);
  };

  // 快速添加工作
  const handleQuickAdd = () => {
    if (quickAddInput.trim() === "") return;
    
    // 使用当前精确时间
    const now = dayjs();
    const newTask: WeeklyTask = {
      id: Date.now(),
      title: quickAddInput.trim(),
      startDate: now.format("YYYY-MM-DD"),
      startTime: now.format("HH:mm:ss"),
      priority: "medium",
      status: "pending",
    };
    
    setTasks([...tasks, newTask]);
    setQuickAddInput("");
  };

  // 完成工作
  const completeTask = (taskId: number) => {
    setTasks(tasks.map((task) =>
      task.id === taskId ? { ...task, status: "completed" as const } : task
    ));
  };

  // 恢复工作为未完成
  const restoreTask = (taskId: number) => {
    setTasks(tasks.map((task) =>
      task.id === taskId ? { ...task, status: "pending" as const } : task
    ));
  };

  // 删除工作
  const deleteTask = (taskId: number) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  // 查看工作详情
  const viewTaskDetails = (task: WeeklyTask) => {
    setCurrentTask(task);
    setDetailsVisible(true);
  };

  // 关闭工作详情
  const closeTaskDetails = () => {
    setDetailsVisible(false);
    setCurrentTask(null);
  };

  // 渲染工作列表
  const renderTaskList = (taskList: WeeklyTask[], emptyText: string) => {
    if (taskList.length === 0) {
      return (
        <Empty
          description={
            <div style={{ textAlign: 'center' }}>
              <p style={{ marginBottom: '8px', color: '#8c8c8c' }}>{emptyText}</p>
              <Button type="primary" onClick={() => showModal()}>
                <PlusOutlined /> 添加工作
              </Button>
            </div>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ margin: '20px 0' }}
        />
      );
    }

    return (
      <List
        itemLayout="horizontal"
        dataSource={taskList}
        renderItem={(task) => renderTaskItem(task)}
      />
    );
  };

  // 渲染单个工作项
  const renderTaskItem = (task: WeeklyTask) => (
    <List.Item
      key={task.id}
      actions={[
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => viewTaskDetails(task)}
          key="view"
          style={{
            padding: "4px 12px",
            height: "32px",
            width: isMobile ? "100%" : "auto"
          }}
        >
          详情
        </Button>,
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => editTask(task)}
          key="edit"
          style={{
            padding: "4px 12px",
            height: "32px",
            width: isMobile ? "100%" : "auto"
          }}
        >
          编辑
        </Button>,
        task.status === "pending" ? (
          <Button
            style={{
              backgroundColor: "#52c41a",
              borderColor: "#52c41a",
              color: "#fff",
              boxShadow: "0 2px 4px rgba(111, 207, 151, 0.5)",
              borderRadius: "6px",
              padding: "4px 12px",
              height: "32px",
              marginBottom: isMobile ? "8px" : 0,
              width: isMobile ? "100%" : "auto"
            }}
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => completeTask(task.id)}
            key="complete"
          >
            完成
          </Button>
        ) : (
          <Button
            style={{
              backgroundColor: "#1890ff",
              borderColor: "#1890ff",
              color: "#fff",
              borderRadius: "6px",
              padding: "4px 12px",
              height: "32px",
              marginBottom: isMobile ? "8px" : 0,
              width: isMobile ? "100%" : "auto"
            }}
            type="primary"
            icon={<RollbackOutlined />}
            onClick={() => restoreTask(task.id)}
            key="restore"
          >
            恢复
          </Button>
        ),
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => deleteTask(task.id)}
          key="delete"
          style={{
            padding: "4px 12px",
            height: "32px",
            width: isMobile ? "100%" : "auto"
          }}
        >
          删除
        </Button>,
      ]}
      style={{
        background: "#fff",
        marginBottom: "12px",
        padding: isMobile ? "12px" : "16px",
        borderRadius: "8px",
        boxShadow: task.status === "completed"
          ? "0 2px 8px rgba(0,0,0,0.02)"
          : "0 2px 8px rgba(0,0,0,0.04)",
        opacity: task.status === "completed" ? 0.85 : 1,
        transition: "all 0.3s ease",
        border: task.status === "completed"
          ? "1px solid rgba(82, 196, 26, 0.1)"
          : "1px solid transparent",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "flex-start" : "center"
      }}
    >
      <List.Item.Meta
        style={{
          flex: 1,
          marginBottom: isMobile ? "12px" : 0,
          width: "100%"
        }}
        title={
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            width: "100%"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: isMobile ? "14px" : "16px",
              fontWeight: task.status === "completed" ? 400 : 500,
              color: task.status === "completed" ? "#8c8c8c" : "#333",
            }}>
              {task.status === "completed" ? (
                <span style={{
                  color: "#52c41a",
                  fontSize: isMobile ? "16px" : "18px"
                }}>
                  {taskStatus.completed.icon}
                </span>
              ) : (
                <span style={{ fontSize: isMobile ? "16px" : "18px" }}>
                  {priorityConfig[task.priority].emoji}
                </span>
              )}
              <span style={{ wordBreak: "break-all" }}>{task.title}</span>
              <Tag
                color={priorityConfig[task.priority].color}
                style={{
                  borderRadius: "4px",
                  padding: "0 8px",
                  height: "24px",
                  lineHeight: "22px",
                  opacity: task.status === "completed" ? 0.7 : 1,
                  fontSize: isMobile ? "12px" : "14px"
                }}
              >
                {priorityConfig[task.priority].text}优先级
              </Tag>
              <Tag
                color={taskStatus[task.status].color}
                style={{
                  borderRadius: "4px",
                  padding: "0 8px",
                  height: "24px",
                  lineHeight: "22px",
                  fontSize: isMobile ? "12px" : "14px"
                }}
              >
                {taskStatus[task.status].text}
              </Tag>
            </div>
            <span style={{ 
              color: "#8c8c8c", 
              fontSize: isMobile ? "12px" : "14px",
              marginLeft: "26px"
            }}>
              开始: {dayjs(task.startDate).format("YYYY-MM-DD")} {task.startTime || "00:00:00"}
              {task.endDate && ` | 截止: ${dayjs(task.endDate).format("YYYY-MM-DD")} ${task.endTime || "23:59:59"}`}
            </span>
          </div>
        }
        description={
          task.description && (
            <div style={{
              marginTop: "8px",
              fontSize: isMobile ? "12px" : "14px",
              lineHeight: "1.6",
              color: task.status === "completed" ? "#8c8c8c" : "#666",
              wordBreak: "break-all",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical"
            }}>
              {task.description}
            </div>
          )
        }
      />
      {isMobile && <div style={{ width: "100%", height: "1px" }} />}
    </List.Item>
  );

  // 删除历史周报
  const deleteHistoryReport = (id: string) => {
    const updatedHistory = reportHistory.filter(item => item.id !== id);
    setReportHistory(updatedHistory);
    localStorage.setItem(STORAGE_KEY_REPORT_HISTORY, JSON.stringify(updatedHistory));
    message.success('已删除历史周报');
  };

  // 处理Markdown转HTML的函数，增加错误处理
  const markdownToHtml = (text: string) => {
    if (!text) return '';
    
    try {
      // 首先确认输入是字符串类型
      const inputText = typeof text === 'string' ? text : String(text);
      
      return inputText
        .replace(/^# (.*$)/gim, '<h1 style="font-size: 24px; margin-bottom: 16px; color: #1677ff;">$1</h1>')
        .replace(/^## (.*$)/gim, '<h2 style="font-size: 20px; margin: 16px 0 8px; color: #333;">$1</h2>')
        .replace(/^### (.*$)/gim, '<h3 style="font-size: 18px; margin: 14px 0 6px; color: #333;">$1</h3>')
        .replace(/\n- (.*$)/gim, '<div style="margin: 4px 0;"><span style="display: inline-block; margin-right: 8px;">•</span>$1</div>')
        .replace(/\n([0-9]+)\. (.*$)/gim, '<div style="margin: 4px 0;"><span style="display: inline-block; margin-right: 8px; min-width: 16px;">$1.</span>$2</div>')
        .replace(/\n/gim, '<br/>');
    } catch (error) {
      console.error('Markdown转换错误:', error);
      // 如果转换失败，返回原始文本或安全的文本
      return typeof text === 'string' ? text : '无法显示内容';
    }
  };

  return (
    <div style={{ background: "#f5f5f5", padding: "24px" }}>
      <Card
        title={
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px"
          }}>
            <span>🚀 AI周报助手</span>
            <Space>
              <Button
                type="primary"
                icon={<RobotOutlined />}
                onClick={generateWeeklyReport}
                loading={isGeneratingReport}
              >
                生成周报
              </Button>
              <Button
                icon={<HistoryOutlined />}
                onClick={() => setHistoryDrawerVisible(true)}
                disabled={reportHistory.length === 0}
              >
                历史周报
              </Button>
              <Button
                icon={<SettingOutlined />}
                onClick={showAITemplateSettings}
              >
                AI设置
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showModal()}
              >
                添加工作内容
              </Button>
            </Space>
          </div>
        }
      >
        <div style={{
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: 16,
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? "12px" : "0"
        }}>
          <div>
            <CalendarOutlined /> 
            <Text strong style={{ marginLeft: 8 }}>当前周: {getCurrentWeekRange().formatted}</Text>
          </div>
          <DatePicker 
            picker="week" 
            value={selectedWeek}
            onChange={(date) => date && setSelectedWeek(date)}
            locale={locale}
          />
        </div>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} md={12}>
            <Input
              placeholder="输入待办事项按回车快速添加"
              value={quickAddInput}
              onChange={(e) => setQuickAddInput(e.target.value)}
              onPressEnter={handleQuickAdd}
              suffix={
                <Button
                  type="primary"
                  size="small"
                  onClick={handleQuickAdd}
                  disabled={quickAddInput.trim() === ""}
                >
                  添加
                </Button>
              }
            />
          </Col>
          <Col xs={24} md={12}>
            <Search
              placeholder="搜索工作"
              allowClear
              enterButton
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={(value) => setSearchText(value)}
              style={{ width: '100%' }}
            />
          </Col>
        </Row>

        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Space>
            <FilterOutlined />
            <Radio.Group 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              optionType="button"
              buttonStyle="solid"
              size="small"
            >
              <Radio.Button value="all">全部</Radio.Button>
              <Radio.Button value="pending">进行中</Radio.Button>
              <Radio.Button value="completed">已完成</Radio.Button>
            </Radio.Group>
          </Space>
        </div>

        <Tabs
          defaultActiveKey="currentWeek"
          items={[
            {
              key: 'currentWeek',
              label: '本周工作',
              children: renderTaskList(currentWeekTasks(), "本周暂无工作内容")
            }
          ]}
        />
      </Card>

      {/* 添加/编辑工作模态框 */}
      <Modal
        title={
          <>
            {isEditMode 
              ? <><EditOutlined /> 编辑工作</>
              : <><PlusOutlined /> 添加新工作</>
            }
          </>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleTaskFormSubmit}
          initialValues={{ 
            priority: "medium", 
            startDateTime: dayjs(),
            endDateTime: dayjs().add(1, 'day')
          }}
        >
          <Form.Item name="title" label="工作标题" rules={[{ required: true, message: "请输入工作标题" }]}>
            <Input placeholder="请输入工作标题" maxLength={50} />
          </Form.Item>

          <Form.Item name="description" label="工作描述">
            <TextArea placeholder="请输入工作描述（选填）" autoSize={{ minRows: 3, maxRows: 6 }} maxLength={200} />
          </Form.Item>

          <Form.Item 
            name="startDateTime" 
            label="开始时间" 
            rules={[{ required: true, message: "请选择开始时间" }]}
          >
            <DatePicker 
              style={{ width: "100%" }} 
              locale={locale} 
              showTime={{ format: 'HH:mm:ss' }}
              format="YYYY-MM-DD HH:mm:ss"
              allowClear={false} 
            />
          </Form.Item>

          <Form.Item 
            name="endDateTime" 
            label="截止时间"
          >
            <DatePicker 
              style={{ width: "100%" }} 
              locale={locale} 
              showTime={{ format: 'HH:mm:ss' }}
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>

          <Form.Item name="priority" label="优先级" rules={[{ required: true, message: "请选择优先级" }]}>
            <Select placeholder="请选择优先级">
              <Option value="high">
                <Space>
                  <span>{priorityConfig.high.emoji} 高优先级</span>
                  <Tag color={priorityConfig.high.color}>紧急</Tag>
                </Space>
              </Option>
              <Option value="medium">
                <Space>
                  <span>{priorityConfig.medium.emoji} 中优先级</span>
                  <Tag color={priorityConfig.medium.color}>重要</Tag>
                </Space>
              </Option>
              <Option value="low">
                <Space>
                  <span>{priorityConfig.low.emoji} 低优先级</span>
                  <Tag color={priorityConfig.low.color}>普通</Tag>
                </Space>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {isEditMode ? "更新" : "添加"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 工作详情抽屉 */}
      <Drawer
        title="工作详情"
        placement="right"
        onClose={closeTaskDetails}
        open={detailsVisible}
        width={isMobile ? "100%" : 500}
        extra={
          <Space>
            <Button type="primary" icon={<EditOutlined />} onClick={() => {
              closeTaskDetails();
              if (currentTask) {
                showModal(currentTask);
              }
            }}>
              编辑
            </Button>
          </Space>
        }
      >
        {currentTask && (
          <div>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="工作标题" labelStyle={{ fontWeight: 'bold' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>
                    {currentTask.status === "completed" 
                      ? taskStatus.completed.icon
                      : priorityConfig[currentTask.priority].emoji
                    }
                  </span>
                  {currentTask.title}
                </div>
              </Descriptions.Item>
              
              <Descriptions.Item label="优先级" labelStyle={{ fontWeight: 'bold' }}>
                <Tag color={priorityConfig[currentTask.priority].color}>
                  {priorityConfig[currentTask.priority].text}优先级
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="工作状态" labelStyle={{ fontWeight: 'bold' }}>
                <Tag color={taskStatus[currentTask.status].color}>
                  {taskStatus[currentTask.status].text}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="开始时间" labelStyle={{ fontWeight: 'bold' }}>
                {dayjs(currentTask.startDate).format("YYYY年MM月DD日")} {currentTask.startTime || "00:00:00"}
              </Descriptions.Item>
              
              {currentTask.endDate && (
                <Descriptions.Item label="截止时间" labelStyle={{ fontWeight: 'bold' }}>
                  {dayjs(currentTask.endDate).format("YYYY年MM月DD日")} {currentTask.endTime || "23:59:59"}
                </Descriptions.Item>
              )}
              
              {currentTask.description && (
                <Descriptions.Item label="工作描述" labelStyle={{ fontWeight: 'bold' }}>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{currentTask.description}</div>
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider />
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              {currentTask.status === "pending" ? (
                <Button 
                  type="primary" 
                  icon={<CheckOutlined />} 
                  onClick={() => {
                    completeTask(currentTask.id);
                    closeTaskDetails();
                  }}
                >
                  标记为已完成
                </Button>
              ) : (
                <Button 
                  type="primary" 
                  icon={<RollbackOutlined />} 
                  onClick={() => {
                    restoreTask(currentTask.id);
                    closeTaskDetails();
                  }}
                >
                  标记为进行中
                </Button>
              )}
              <Button 
                danger 
                icon={<DeleteOutlined />} 
                onClick={() => {
                  deleteTask(currentTask.id);
                  closeTaskDetails();
                }}
              >
                删除工作
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* AI模板设置抽屉 */}
      <AITemplateSettings
        visible={isAITemplateVisible}
        onClose={hideAITemplateSettings}
        settings={{
          modelKey: aiTemplateSettings.modelKey,
          prompt: aiTemplateSettings.prompt || DEFAULT_PROMPT,
          template: aiTemplateSettings.template || DEFAULT_TEMPLATE,
          variables: aiTemplateSettings.variables || []
        }}
        onSave={saveAITemplateSettings}
      />
      
      {/* 周报生成结果Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <RobotOutlined style={{ marginRight: 8 }} />
            <span>{isGeneratingReport ? 'AI正在生成周报...' : 'AI生成的周报'}</span>
          </div>
        }
        open={reportModalVisible}
        onCancel={() => {
          if (!isGeneratingReport) {
            setReportModalVisible(false)
          } else {
            Modal.confirm({
              title: '确认取消生成?',
              content: '周报正在生成中，取消将终止生成过程。',
              onOk: () => {
                cancelAIGeneration();
                setReportModalVisible(false);
                message.info('已取消生成');
              }
            });
          }
        }}
        footer={[
          <Button 
            key="close" 
            onClick={() => {
              if (!isGeneratingReport) {
                setReportModalVisible(false)
              } else {
                Modal.confirm({
                  title: '确认取消生成?',
                  content: '周报正在生成中，取消将终止生成过程。',
                  onOk: () => {
                    cancelAIGeneration();
                    setReportModalVisible(false);
                    message.info('已取消生成');
                  }
                });
              }
            }}
          >
            {isGeneratingReport ? '取消生成' : '关闭'}
          </Button>,
          // <Button 
          //   key="export" 
          //   icon={<DownloadOutlined />} 
          //   onClick={exportReportAsText}
          //   disabled={!generatedReport || isGeneratingReport}
          // >
          //   导出文本
          // </Button>,
          <Button 
            key="copy" 
            type="primary" 
            icon={<CopyOutlined />} 
            onClick={copyReportToClipboard}
            disabled={!generatedReport || isGeneratingReport}
          >
            复制内容
          </Button>
        ]}
        width={700}
        maskClosable={!isGeneratingReport}
        closable={!isGeneratingReport}
      >
        {generatedReport ? (
          <div 
            style={{ 
              whiteSpace: 'pre-wrap', 
              padding: '16px',
              borderRadius: '4px',
              border: '1px solid #e8e8e8',
              maxHeight: '60vh',
              overflow: 'auto',
              fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
            }}
            dangerouslySetInnerHTML={{ 
              __html: markdownToHtml(generatedReport)
            }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16 }}>AI正在思考并生成周报...</p>
            <p style={{ color: '#888', fontSize: '14px' }}>根据工作内容生成高质量周报，请耐心等待</p>
          </div>
        )}
      </Modal>
      
      {/* 历史周报抽屉 */}
      <Drawer
        title="历史周报"
        placement="right"
        onClose={() => setHistoryDrawerVisible(false)}
        open={historyDrawerVisible}
        width={400}
      >
        <List
          itemLayout="horizontal"
          dataSource={reportHistory}
          renderItem={item => (
            <List.Item
              actions={[
                <Button 
                  type="link" 
                  onClick={() => viewHistoryReport(item)}
                  key="view"
                >
                  查看
                </Button>,
                <Button 
                  type="link" 
                  danger
                  onClick={() => deleteHistoryReport(item.id)}
                  key="delete"
                >
                  删除
                </Button>
              ]}
            >
              <List.Item.Meta
                title={item.title}
                description={item.date}
              />
            </List.Item>
          )}
        />
      </Drawer>
    </div>
  );
} 