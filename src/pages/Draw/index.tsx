import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button, Card, Input, Tabs, Avatar, Badge, List, Typography, Space, Slider, Row, Col, Layout, Form } from "antd"
import {
  EditOutlined,
  DeleteOutlined,
  UndoOutlined,
  ClockCircleOutlined,
  CrownOutlined,
  SendOutlined,
  TeamOutlined,
} from "@ant-design/icons"
import { useModel } from '@umijs/max'
import { wsService } from '@/services/websocket'
import { message } from 'antd'

const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs
const { Header, Content, Footer } = Layout

// 游戏组件
function GameRoom({ roomId, playerName, onExit }: { roomId: string; playerName: string; onExit: () => void }) {
  const [currentWord, setCurrentWord] = useState<string>("苹果")
  const [timeLeft, setTimeLeft] = useState<number>(60)
  const [isDrawing, setIsDrawing] = useState<boolean>(false)
  const [guess, setGuess] = useState<string>("")
  const [messages, setMessages] = useState<Array<{ user: string; message: string; isCorrect?: boolean }>>([
    { user: "系统", message: "游戏开始！" },
  ])
  const [players, setPlayers] = useState<Array<{
    id: number;
    name: string;
    avatar: string;
    score: number;
    isDrawing: boolean;
  }>>([])
  const { initialState } = useModel('@@initialState')

  const currentUser = initialState?.currentUser

  const handleUserListUpdate = (data: any) => {
    setPlayers(data.data.map((user: any) => ({
      id: user.id,
      name: user.userName,
      avatar: user.userAvatar,
      score: user.score || 0,
      isDrawing: user.isDrawing || false
    })))
  }

  const handleUserJoin = (data: any) => {
    const newUser = data.data
    setPlayers(prev => [...prev, {
      id: newUser.id,
      name: newUser.userName,
      avatar: newUser.userAvatar,
      score: newUser.score || 0,
      isDrawing: newUser.isDrawing || false
    }])
    setMessages(prev => [...prev, { user: "系统", message: `${newUser.userName} 加入了房间` }])
  }

  const handleUserLeave = (data: any) => {
    const userId = data.data
    setPlayers(prev => prev.filter(player => player.id !== userId))
    const leavingUser = players.find(p => p.id === userId)
    if (leavingUser) {
      setMessages(prev => [...prev, { user: "系统", message: `${leavingUser.name} 离开了房间` }])
    }
  }
  useEffect(() => {
    // 添加用户列表更新处理器
    wsService.addMessageHandler('roomDrawUserList', handleUserListUpdate)
    wsService.addMessageHandler('roomDrawUserJoin', handleUserJoin)
    wsService.addMessageHandler('roomDrawUserLeave', handleUserLeave)

    return () => {
      wsService.removeMessageHandler('roomDrawUserList', handleUserListUpdate)
      wsService.removeMessageHandler('roomDrawUserJoin', handleUserJoin)
      wsService.removeMessageHandler('roomDrawUserLeave', handleUserLeave)
    }
  }, [roomId])


  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null)
  const [color, setColor] = useState<string>("#000000")
  const [brushSize, setBrushSize] = useState<number>(5)
  const [tool, setTool] = useState<"pencil" | "eraser">("pencil")

  // 初始化画布
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")

      // 获取画布的显示尺寸
      const displayWidth = canvas.offsetWidth
      const displayHeight = canvas.offsetHeight

      // 设置画布的实际尺寸为显示尺寸的2倍，以提高清晰度
      canvas.width = displayWidth * 2
      canvas.height = displayHeight * 2

      if (ctx) {
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        // 设置缩放比例
        ctx.scale(2, 2)
        setContext(ctx)
      }
    }

    // 倒计时
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // 绘画功能
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!context) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    // 计算鼠标在画布上的实际位置
    const x = (e.clientX - rect.left) * (canvas.width / (rect.width * 2))
    const y = (e.clientY - rect.top) * (canvas.height / (rect.height * 2))

    context.beginPath()
    context.moveTo(x, y)
    setIsDrawing(true)

    // 在开始绘画时设置画笔属性
    if (tool === "eraser") {
      context.strokeStyle = "#FFFFFF"
    } else {
      context.strokeStyle = color
    }
    context.lineWidth = brushSize
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    // 计算鼠标在画布上的实际位置
    const x = (e.clientX - rect.left) * (canvas.width / (rect.width * 2))
    const y = (e.clientY - rect.top) * (canvas.height / (rect.height * 2))

    context.lineTo(x, y)
    context.stroke()
  }

  const stopDrawing = () => {
    if (!context) return
    context.closePath()
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    if (!context || !canvasRef.current) return
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
  }

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!guess.trim()) return

    const isCorrect = guess === currentWord

    setMessages((prev) => [
      ...prev,
      {
        user: "你",
        message: guess,
        isCorrect,
      },
    ])

    if (isCorrect) {
      setMessages((prev) => [
        ...prev,
        {
          user: "系统",
          message: "恭喜你猜对了！🎉",
        },
      ])
    }

    setGuess("")
  }

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <Content style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: "24px" }}>
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              你画我猜 🎨
            </Title>
          </Col>
          <Col>
            <Space>
              <Text>房间号: {roomId}</Text>
              <Button type="primary" danger onClick={onExit}>
                退出房间
              </Button>
            </Space>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          {/* 上方画布区域 */}
          <Col span={24}>
            <Card
              title={
                <Row justify="space-between" align="middle">
                  <Col>
                    <Space>
                      <span>绘画区域</span>
                      <Badge
                        count={`提示词: ${players[0]?.isDrawing ? currentWord : "_ ".repeat(currentWord.length)}`}
                        style={{ backgroundColor: "#f0f0f0", color: "#000000" }}
                      />
                    </Space>
                  </Col>
                  <Col>
                    <Space>
                      <ClockCircleOutlined style={{ color: "#fa8c16" }} />
                      <Text strong style={{ color: "#fa8c16" }}>
                        {timeLeft}秒
                      </Text>
                    </Space>
                  </Col>
                </Row>
              }
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <Row gutter={8} align="middle">
                  <Col>
                    <Button
                      type={tool === "pencil" ? "primary" : "default"}
                      icon={<EditOutlined />}
                      onClick={() => setTool("pencil")}
                    >
                      画笔
                    </Button>
                  </Col>
                  <Col>
                    <Button
                      type={tool === "eraser" ? "primary" : "default"}
                      icon={<DeleteOutlined />}
                      onClick={() => setTool("eraser")}
                    >
                      橡皮
                    </Button>
                  </Col>
                  <Col>
                    <Button icon={<UndoOutlined />} onClick={clearCanvas}>
                      清空
                    </Button>
                  </Col>
                  <Col flex="auto">
                    <Row gutter={8} align="middle" justify="end">
                      <Col>
                        <Text>颜色:</Text>
                      </Col>
                      <Col>
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          style={{ width: "32px", height: "32px", cursor: "pointer" }}
                        />
                      </Col>
                      <Col>
                        <Text>粗细:</Text>
                      </Col>
                      <Col span={8}>
                        <Slider min={1} max={20} value={brushSize} onChange={(value) => setBrushSize(value)} />
                      </Col>
                    </Row>
                  </Col>
                </Row>

                <div
                  style={{
                    border: "1px solid #d9d9d9",
                    borderRadius: "8px",
                    overflow: "hidden",
                    background: "#ffffff",
                    height: "500px",
                    width: "100%",
                    position: "relative",
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      cursor: "crosshair",
                    }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                </div>
              </Space>
            </Card>
          </Col>

          {/* 下方左侧排行榜 */}
          <Col xs={24} md={8}>
            <Card
              title={
                <Space>
                  <CrownOutlined style={{ color: "#faad14" }} />
                  <span>玩家排行</span>
                </Space>
              }
              style={{ height: "100%" }}
            >
              <List
                itemLayout="horizontal"
                dataSource={players}
                renderItem={(player) => (
                  <List.Item
                    extra={
                      player.isDrawing ? (
                        <Badge
                          count={<EditOutlined style={{ color: "#1890ff" }} />}
                          offset={[0, 0]}
                          style={{ backgroundColor: "#e6f7ff", color: "#1890ff", boxShadow: "none" }}
                        >
                          <Text style={{ marginRight: 8 }}>绘画中</Text>
                        </Badge>
                      ) : null
                    }
                  >
                    <List.Item.Meta
                      avatar={<Avatar src={player.avatar} size={28}/>}
                      title={player.name}
                      description={`获取分数🔥：${player.score} 分`}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* 下方右侧聊天区域 */}
          <Col xs={24} md={16}>
            <Card title="聊天区 & 猜词" style={{ height: "100%" }}>
              <div
                style={{
                  height: "300px",
                  overflowY: "auto",
                  border: "1px solid #d9d9d9",
                  borderRadius: "8px",
                  padding: "12px",
                  marginBottom: "12px",
                  background: "#f9f9f9",
                }}
              >
                {messages.map((msg, index) => (
                  <div key={index} style={{ marginBottom: "8px" }}>
                    <Text strong style={{ color: msg.user === "系统" ? "#1890ff" : "inherit" }}>
                      {msg.user}:
                    </Text>{" "}
                    <Text
                      style={{
                        color: msg.isCorrect ? "#52c41a" : "inherit",
                        fontWeight: msg.isCorrect ? "bold" : "normal",
                      }}
                    >
                      {msg.message}
                    </Text>
                    {msg.isCorrect && " ✅"}
                  </div>
                ))}
              </div>
              <form onSubmit={handleGuessSubmit}>
                <Row gutter={8}>
                  <Col flex="auto">
                    <Input placeholder="输入你的猜测..." value={guess} onChange={(e) => setGuess(e.target.value)} />
                  </Col>
                  <Col>
                    <Button type="primary" htmlType="submit" icon={<SendOutlined />}>
                      发送
                    </Button>
                  </Col>
                </Row>
              </form>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  )
}

// 主组件
export default function DrawAndGuessGame() {
  const [isInRoom, setIsInRoom] = useState(false)
  const [roomId, setRoomId] = useState("")
  const { initialState } = useModel('@@initialState')
  const currentUser = initialState?.currentUser
  const [messageApi, contextHolder] = message.useMessage();

  const handleRoomCreated = (data: any) => {
    console.log("11",data)
    setRoomId(data.data)
    setIsInRoom(true)
    message.success('房间创建成功！')
  }

  const handleRoomJoined = (data: any) => {
    setRoomId(data.data)
    setIsInRoom(true)
    message.success('成功加入房间！')

    // 请求用户列表
    wsService.send({
      type: 2,
      userId: -1,
      data: {
        type: 'getDrawRoomUsers',
        content: data.data
      }
    })
  }

  // 添加 WebSocket 连接初始化
  useEffect(() => {
    if (currentUser?.id) {
      const token = localStorage.getItem('tokenValue');
      if (!token) {
        messageApi.error('请先登录！');
        return;
      }

      // 添加消息处理器
      wsService.addMessageHandler('roomDrawCreated', handleRoomCreated)
      wsService.addMessageHandler('roomDrawJoined', handleRoomJoined)

      // 连接WebSocket
      wsService.connect(token);

      return () => {
        // 清理消息处理器
        wsService.removeMessageHandler('roomDrawCreated', handleRoomCreated)
        wsService.removeMessageHandler('roomDrawJoined', handleRoomJoined)
      };
    }
  }, [currentUser?.id]);

  const handleJoinRoom = (values: { roomId?: string }) => {
    if (values.roomId) {
      // 加入已有房间
      wsService.send({
        type: 2,
        userId: -1,
        data: {
          type: 'joinDrawRoom',
          content: values.roomId
        }
      })
    } else {
      // 创建新房间
      wsService.send({
        type: 2,
        userId: -1,
        data: {
          type: 'createDrawRoom',
        }
      })
    }
  }

  const handleExitRoom = () => {
    if (roomId) {
      wsService.send({
        type: 2,
        userId: -1,
        data: {
          type: 'leaveDrawRoom',
          content: roomId
        }
      })
    }
    setIsInRoom(false)
  }

  if (!isInRoom) {
    return (
      <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
        <Content style={{ padding: "24px" }}>
          <Row justify="center" align="middle" style={{ minHeight: "80vh" }}>
            <Col xs={22} sm={16} md={12} lg={8}>
              <Card
                style={{
                  borderRadius: "16px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                  <Title level={1} style={{ marginBottom: "8px" }}>
                    你画我猜 🎨
                  </Title>
                  <Text type="secondary">创建或加入一个房间开始游戏吧！</Text>
                </div>

                <Form onFinish={handleJoinRoom} layout="vertical" size="large">
                  <Form.Item
                    name="roomId"
                    label="房间号"
                    extra="不填则自动创建新房间"
                  >
                    <Input
                      prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                      placeholder="请输入房间号"
                      style={{ height: "40px" }}
                    />
                  </Form.Item>
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      block
                      size="large"
                      style={{ height: "40px" }}
                    >
                      {roomId ? "加入房间" : "开始游戏"}
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>
        </Content>
        <Footer style={{ textAlign: "center", background: "transparent" }}>
          <Text type="secondary">欢迎来到你画我猜游戏！邀请好友一起来玩吧 🎮</Text>
        </Footer>
      </Layout>
    )
  }

  return <GameRoom roomId={roomId} playerName={currentUser?.userName || '未知用户'} onExit={handleExitRoom} />
}

