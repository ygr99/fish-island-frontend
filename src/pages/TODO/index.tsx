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
import {PlusOutlined, CalendarOutlined, ClockCircleOutlined, CheckOutlined, DeleteOutlined} from "@ant-design/icons"
import dayjs from "dayjs"
import "dayjs/locale/zh-cn"
import locale from "antd/es/date-picker/locale/zh_CN"

const {Header, Content} = Layout
const {Title, Text} = Typography
const {TextArea} = Input
const {Option} = Select

// 优先级对应的颜色和emoji
const priorityConfig = {
  high: {color: "red", emoji: "🔥", text: "高"},
  medium: {color: "orange", emoji: "⚡", text: "中"},
  low: {color: "blue", emoji: "🌱", text: "低"},
}

// 任务状态
const taskStatus = {
  pending: {text: "待完成", color: "processing"},
  completed: {text: "已完成", color: "success"},
}

export default function TodoList() {
  // 状态管理
  const [tasks, setTasks] = useState(() => {
    // 从本地存储加载任务
    const savedTasks = localStorage.getItem("todoTasks")
    return savedTasks ? JSON.parse(savedTasks) : []
  })
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedDate, setSelectedDate] = useState(dayjs())
  const [form] = Form.useForm()
  const [viewMode, setViewMode] = useState("list") // 'list' 或 'calendar'

  // 保存任务到本地存储
  useEffect(() => {
    localStorage.setItem("todoTasks", JSON.stringify(tasks))
  }, [tasks])

  // 打开添加任务模态框
  const showModal = () => {
    form.resetFields()
    form.setFieldsValue({date: dayjs()})
    setIsModalVisible(true)
  }

  // 添加新任务
  const handleAddTask = (values: {
    title: any;
    description: any;
    date: { format: (arg0: string) => any };
    priority: any
  }) => {
    const newTask = {
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
  const completeTask = (taskId: any) => {
    setTasks(tasks.map((task: { id: any }) => (task.id === taskId ? {...task, status: "completed"} : task)))
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
      <Header style={{background: "#fff", padding: "0 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)"}}>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", height: "100%"}}>
          <Title level={4} style={{margin: 0}}>
            <span>🔊:今天也要加油鸭💪</span>
          </Title>
          <Space>
            <Button
              type={viewMode === "list" ? "primary" : "default"}
              icon={<CalendarOutlined/>}
              onClick={() => setViewMode("list")}
            >
              列表视图
            </Button>
            <Button
              type={viewMode === "calendar" ? "primary" : "default"}
              icon={<CalendarOutlined/>}
              onClick={() => setViewMode("calendar")}
            >
              日历视图
            </Button>
            <Button type="primary" icon={<PlusOutlined/>} onClick={showModal}>
              添加任务
            </Button>
          </Space>
        </div>
      </Header>

      <Content style={{padding: "24px"}}>
        {viewMode === "list" ? (
          <Card>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20}}>
              <Title level={4} style={{margin: 0}}>
                <CalendarOutlined/> {selectedDate.format("YYYY年MM月DD日")} 的任务
              </Title>
              <DatePicker value={selectedDate} onChange={setSelectedDate} locale={locale} allowClear={false}/>
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
                            backgroundColor: "#52c41a", // 柔和的浅绿色
                            borderColor: "#52c41a",
                            color: "#fff",
                            boxShadow: "0 2px 4px rgba(111, 207, 151, 0.5)", // 增加柔和的阴影
                          }}
                          type="primary"
                          icon={<CheckOutlined/>}
                          onClick={() => completeTask(task.id)}
                          key="complete" // Added key prop here
                        >
                          完成
                        </Button>
                      ) : null,
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined/>}
                        onClick={() => deleteTask(task.id)}
                        key="delete" // Added key prop here
                      >
                        删除
                      </Button>,
                    ]}
                    style={{
                      background: "#fff",
                      marginBottom: 8,
                      padding: "12px 24px",
                      borderRadius: 8,
                      opacity: task.status === "completed" ? 0.6 : 1,
                      textDecoration: task.status === "completed" ? "line-through" : "none",
                    }}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <span>
                            {priorityConfig[task.priority].emoji} {task.title}
                          </span>
                          <Tag color={priorityConfig[task.priority].color}>
                            {priorityConfig[task.priority].text}优先级
                          </Tag>
                          <Tag color={taskStatus[task.status].color}>{taskStatus[task.status].text}</Tag>
                        </Space>
                      }
                      description={
                        <div>
                          <div>
                            <ClockCircleOutlined/> 日期: {task.date}
                          </div>
                          {task.description && <div style={{marginTop: 8}}>{task.description}</div>}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="今天没有任务，休息一下吧 🎉" image={Empty.PRESENTED_IMAGE_SIMPLE}/>
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

