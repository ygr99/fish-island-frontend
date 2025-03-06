import {useState, useEffect, SetStateAction} from "react"
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
  Calendar,
  Badge,
  Card,
} from "antd"
import {PlusOutlined, CalendarOutlined, CheckOutlined, DeleteOutlined} from "@ant-design/icons"
import dayjs from "dayjs"
import "dayjs/locale/zh-cn"
import locale from "antd/es/date-picker/locale/zh_CN"
import {getTodoUsingPost, saveTodoUsingPost} from "@/services/backend/todoController";

const {Header, Content} = Layout
const {Title, Text} = Typography
const {TextArea} = Input
const {Option} = Select

// 优先级对应的颜色和emoji
const priorityConfig: any = {
  high: {color: "red", emoji: "🔥", text: "高"},
  medium: {color: "orange", emoji: "⚡", text: "中"},
  low: {color: "blue", emoji: "🌱", text: "低"},
}

// 任务状态
const taskStatus: any = {
  pending: {text: "待完成", color: "processing", icon: "⚡️"},
  completed: {text: "已完成", color: "success", icon: "✅"},
}

interface Task {
  id: number;
  title: string;
  description?: string;
  date: string;
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

export default function TodoList() {
  // 状态管理
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedDate, setSelectedDate] = useState(dayjs())
  const [form] = Form.useForm()
  const [viewMode, setViewMode] = useState("list") // 'list' 或 'calendar'
  const isMobile = useWindowSize();

  // 加载任务数据
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true)
        const response = await getTodoUsingPost()
        if (response.data) {
          // 确保数据是数组
          const tasksData = Array.isArray(JSON.parse(response.data)) ? JSON.parse(response.data) : []
          // 验证每个任务的数据结构
          const validTasks = tasksData.filter((task: { id: any; title: any; date: any; priority: string; status: string }) =>
            task &&
            typeof task.id === 'number' &&
            typeof task.title === 'string' &&
            typeof task.date === 'string' &&
            ['high', 'medium', 'low'].includes(task.priority) &&
            ['pending', 'completed'].includes(task.status)
          ) as Task[]

          // 只有当远程数据有效时才更新
          if (validTasks.length > 0) {
            setTasks(validTasks)
            localStorage.setItem("todoTasks", JSON.stringify(validTasks))
          } else {
            // 如果远程数据无效，尝试从本地加载
            const savedTasks = localStorage.getItem("todoTasks")
            if (savedTasks) {
              try {
                const parsedTasks = JSON.parse(savedTasks)
                const localValidTasks = Array.isArray(parsedTasks) ? parsedTasks.filter(task =>
                  task &&
                  typeof task.id === 'number' &&
                  typeof task.title === 'string' &&
                  typeof task.date === 'string' &&
                  ['high', 'medium', 'low'].includes(task.priority) &&
                  ['pending', 'completed'].includes(task.status)
                ) as Task[] : []
                if (localValidTasks.length > 0) {
                  setTasks(localValidTasks)
                }
              } catch (error) {
                console.error('解析本地存储数据失败:', error)
                setTasks([])
              }
            }
          }
        }
      } catch (error) {
        console.error('加载任务失败:', error)
        // 如果远程加载失败，尝试从本地存储加载
        const savedTasks = localStorage.getItem("todoTasks")
        if (savedTasks) {
          try {
            const parsedTasks = JSON.parse(savedTasks)
            const validTasks = Array.isArray(parsedTasks) ? parsedTasks.filter(task =>
              task &&
              typeof task.id === 'number' &&
              typeof task.title === 'string' &&
              typeof task.date === 'string' &&
              ['high', 'medium', 'low'].includes(task.priority) &&
              ['pending', 'completed'].includes(task.status)
            ) as Task[] : []
            if (validTasks.length > 0) {
              setTasks(validTasks)
            }
          } catch (error) {
            console.error('解析本地存储数据失败:', error)
            setTasks([])
          }
        }
      } finally {
        setLoading(false)
      }
    }
    loadTasks()
  }, [])

  // 保存任务到远程和本地存储
  useEffect(() => {
    const saveTasks = async () => {
      try {
        await saveTodoUsingPost({
          todoData: tasks
        })
        localStorage.setItem("todoTasks", JSON.stringify(tasks))
      } catch (error) {
        console.error('保存任务失败:', error)
        // 这里可以添加错误提示
      }
    }
    if (tasks.length > 0) {
      saveTasks()
    }
  }, [tasks])

  // 打开添加任务模态框
  const showModal = () => {
    form.resetFields()
    form.setFieldsValue({date: dayjs()})
    setIsModalVisible(true)
  }

  // 添加新任务
  const handleAddTask = (values: {
    title: string;
    description: string;
    date: { format: (arg0: string) => string };
    priority: 'high' | 'medium' | 'low'
  }) => {
    const newTask: Task = {
      id: Date.now(),
      title: values.title,
      description: values.description,
      date: values.date.format("YYYY-MM-DD"),
      priority: values.priority,
      status: "pending",
    }
    setTasks([...tasks, newTask])
    setIsModalVisible(false)
  }

  // 完成任务
  const completeTask = (taskId: number) => {
    setTasks(tasks.map((task) =>
      task.id === taskId ? {...task, status: "completed" as const} : task
    ))
  }

  // 删除任务
  const deleteTask = (taskId: any) => {
    setTasks(tasks.filter((task: { id: any }) => task.id !== taskId))
  }

  // 按日期筛选任务
  const filteredTasks = tasks.filter(
    (task: {
      date: string | number | dayjs.Dayjs | Date | null | undefined
    }) => dayjs(task.date).format("YYYY-MM-DD") === selectedDate.format("YYYY-MM-DD"),
  )

  // 日历数据处理
  const getListData = (value: { format: (arg0: string) => any }) => {
    const dateStr = value.format("YYYY-MM-DD")
    return tasks.filter((task: { date: any }) => task.date === dateStr)
  }

  // 日历单元格渲染
  const dateCellRender = (value: any) => {
    const listData = getListData(value)
    return (
      <ul className="events" style={{listStyle: "none", padding: 0, margin: 0}}>
        {listData.map((item: any) => (
          <li key={item.id}>
            <Badge
              color={priorityConfig[item.priority].color}
              status={item.status === "completed" ? "success" : "processing"}
              text={item.title.length > 6 ? `${item.title.substring(0, 6)}...` : item.title}
            />
          </li>
        ))}
      </ul>
    )
  }

  // 日历选择日期
  const onCalendarSelect = (date: SetStateAction<dayjs.Dayjs>) => {
    setSelectedDate(date)
    setViewMode("list")
  }

  return (
    <Layout style={{minHeight: "100vh", background: "#f5f5f5"}}>
      <Header style={{
        background: "#fff", 
        padding: "0 20px", 
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        height: isMobile ? "auto" : "64px"
      }}>
        <div style={{
          display: "flex", 
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between", 
          alignItems: isMobile ? "stretch" : "center",
          padding: isMobile ? "12px 0" : "0",
          gap: isMobile ? "12px" : "0"
        }}>
          <Title level={4} style={{margin: 0, fontSize: isMobile ? "18px" : "20px"}}>
            <span>🔊:今天也要加油鸭💪</span>
          </Title>
          <Space 
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              width: isMobile ? "100%" : "auto"
            }}
          >
            <Button
              type={viewMode === "list" ? "primary" : "default"}
              icon={<CalendarOutlined/>}
              onClick={() => setViewMode("list")}
              style={{
                flex: isMobile ? "1" : "none",
                minWidth: isMobile ? "0" : "auto"
              }}
            >
              列表视图
            </Button>
            <Button
              type={viewMode === "calendar" ? "primary" : "default"}
              icon={<CalendarOutlined/>}
              onClick={() => setViewMode("calendar")}
              style={{
                flex: isMobile ? "1" : "none",
                minWidth: isMobile ? "0" : "auto"
              }}
            >
              日历视图
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined/>} 
              onClick={showModal}
              style={{
                flex: isMobile ? "1" : "none",
                minWidth: isMobile ? "0" : "auto"
              }}
            >
              添加任务
            </Button>
          </Space>
        </div>
      </Header>

      <Content style={{padding: isMobile ? "12px" : "24px"}}>
        {viewMode === "list" ? (
          <Card>
            <div style={{
              display: "flex", 
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "space-between", 
              alignItems: isMobile ? "flex-start" : "center",
              gap: isMobile ? "12px" : "0",
              marginBottom: 20
            }}>
              <Title level={4} style={{margin: 0, fontSize: isMobile ? "18px" : "20px"}}>
                <CalendarOutlined/> {selectedDate.format("YYYY年MM月DD日")} 的任务
              </Title>
              <DatePicker 
                value={selectedDate} 
                onChange={setSelectedDate} 
                locale={locale} 
                allowClear={false}
                style={{ width: isMobile ? "100%" : "auto" }}
              />
            </div>

            <Divider/>

            {filteredTasks.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={filteredTasks}
                renderItem={(task: any) => (
                  <List.Item
                    key={task.id}
                    actions={[
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
                          icon={<CheckOutlined/>}
                          onClick={() => completeTask(task.id)}
                          key="complete"
                        >
                          完成
                        </Button>
                      ) : null,
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined/>}
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
                          flexDirection: isMobile ? "column" : "row",
                          gap: isMobile ? "8px" : "12px",
                          alignItems: isMobile ? "flex-start" : "center",
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
                          </div>
                          <div style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                            marginTop: isMobile ? "4px" : 0
                          }}>
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
                        </div>
                      }
                      description={
                        task.description && (
                          <div style={{
                            marginTop: "8px",
                            fontSize: isMobile ? "12px" : "14px",
                            lineHeight: "1.6",
                            color: task.status === "completed" ? "#8c8c8c" : "#666",
                            wordBreak: "break-all"
                          }}>
                            {task.description}
                          </div>
                        )
                      }
                    />
                    {isMobile && <div style={{ width: "100%", height: "1px" }} />}
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                description={
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ marginBottom: '8px', color: '#8c8c8c' }}>今天都没有待办任务喔～</p>
                    <Button type="primary" onClick={showModal}>
                      <PlusOutlined /> 添加下任务吧
                    </Button>
                  </div>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ margin: '40px 0' }}
              />
            )}
          </Card>
        ) : (
          <Card>
            <Calendar locale={locale} dateCellRender={dateCellRender} onSelect={onCalendarSelect}/>
          </Card>
        )}
      </Content>

      {/* 添加任务模态框 */}
      <Modal
        title={
          <>
            <PlusOutlined/> 添加新任务
          </>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddTask}
          initialValues={{priority: "medium", date: dayjs()}}
        >
          <Form.Item name="title" label="任务标题" rules={[{required: true, message: "请输入任务标题"}]}>
            <Input placeholder="请输入任务标题" maxLength={50}/>
          </Form.Item>

          <Form.Item name="description" label="任务描述">
            <TextArea placeholder="请输入任务描述（选填）" autoSize={{minRows: 3, maxRows: 6}} maxLength={200}/>
          </Form.Item>

          <Form.Item name="date" label="开始日期" rules={[{required: true, message: "请选择开始日期"}]}>
            <DatePicker style={{width: "100%"}} locale={locale} allowClear={false}/>
          </Form.Item>

          <Form.Item name="priority" label="优先级" rules={[{required: true, message: "请选择优先级"}]}>
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

          <Form.Item style={{marginBottom: 0, textAlign: "right"}}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                添加
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  )
}

