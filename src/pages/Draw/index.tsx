import React, { useState, useEffect, useRef } from 'react';
import { useModel } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Input, Button, List, Avatar, message, Typography, Modal } from 'antd';
import { SendOutlined, UndoOutlined, ClearOutlined, SaveOutlined } from '@ant-design/icons';
import { wsService } from '@/services/websocket';
import './index.less';

const { Text } = Typography;

interface DrawMessage {
  type: 'draw' | 'clear' | 'chat';
  data: any;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  timestamp: number;
}

interface ChatMessage {
  content: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  timestamp: number;
}

const DrawPage: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;
  const [isRoomOwner, setIsRoomOwner] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [roomUsers, setRoomUsers] = useState<any[]>([]);
  const [currentWord, setCurrentWord] = useState<string>('');
  const [roundTime, setRoundTime] = useState<number>(60);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush'); // 添加工具类型状态
  const [eraserSize, setEraserSize] = useState(20); // 橡皮擦大小
  
  // 记录绘画操作历史
  const [drawOperations, setDrawOperations] = useState<any[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chatListRef = useRef<HTMLDivElement | null>(null);
  const drawingHistoryRef = useRef<ImageData[]>([]);
  const currentPathRef = useRef<{ x: number; y: number }[]>([]);
  
  // 添加canvas尺寸状态
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 400 });
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  
  // 调整canvas大小以适应容器
  useEffect(() => {
    const resizeCanvas = () => {
      if (canvasContainerRef.current && canvasRef.current) {
        const containerWidth = canvasContainerRef.current.clientWidth;
        const containerHeight = Math.min(400, window.innerHeight * 0.5); // 限制最大高度
        
        // 更新canvas尺寸状态
        setCanvasSize({
          width: containerWidth,
          height: containerHeight
        });
        
        // 设置canvas的实际尺寸与显示尺寸一致
        canvasRef.current.width = containerWidth;
        canvasRef.current.height = containerHeight;
        
        // 如果之前有内容，需要重新绘制
        if (drawingHistoryRef.current.length > 0 && canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            const lastState = drawingHistoryRef.current[drawingHistoryRef.current.length - 1];
            ctx.putImageData(lastState, 0, 0);
          }
        }
      }
    };
    
    // 初始调整
    resizeCanvas();
    
    // 监听窗口大小变化
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  // 连接到WebSocket
  useEffect(() => {
    if (currentUser) {
      // 使用空字符串，实际连接会在WebSocketService内部使用请求头授权
      wsService.connect('');
      
      // 监听连接状态变化
      const checkConnection = () => {
        const connected = wsService.isConnected();
        setIsConnected(connected);
      };
      
      const interval = setInterval(checkConnection, 1000);
      
      // 设置房主状态 (简化示例，实际上应该从服务端获取)
      setIsRoomOwner(true); // 暂时默认为房主
      
      return () => {
        clearInterval(interval);
        wsService.disconnect();
      };
    }
  }, [currentUser]);
  
  // 注册WebSocket消息处理
  useEffect(() => {
    // 处理画板消息
    wsService.addMessageHandler('draw', (data) => {
      handleDrawMessageReceived(data);
    });
    
    // 处理聊天消息
    wsService.addMessageHandler('chat', (data) => {
      const newMessage: ChatMessage = {
        content: data.data.content,
        sender: data.data.sender,
        timestamp: data.timestamp
      };
      setMessages(prev => [...prev, newMessage]);
      
      // 检查是否猜对了
      if (isRoomOwner && currentWord && data.data.content.includes(currentWord)) {
        message.success(`${data.data.sender.name} 猜对了词语：${currentWord}`);
        wsService.send({
          type: 'draw',
          action: 'correct_guess',
          data: {
            userId: data.data.sender.id,
            word: currentWord
          }
        });
      }
    });
    
    // 处理用户加入/离开消息
    wsService.addMessageHandler('user_event', (data) => {
      if (data.data.action === 'join') {
        setRoomUsers(prev => [...prev, data.data.user]);
        message.info(`${data.data.user.name} 加入了房间`);
      } else if (data.data.action === 'leave') {
        setRoomUsers(prev => prev.filter(user => user.id !== data.data.user.id));
        message.info(`${data.data.user.name} 离开了房间`);
      }
    });
    
    // 处理游戏状态更新
    wsService.addMessageHandler('game_state', (data) => {
      if (data.data.currentWord) {
        setCurrentWord(data.data.currentWord);
      }
      if (data.data.roundTime) {
        setRoundTime(data.data.roundTime);
      }
    });
    
    return () => {
      wsService.clearMessageHandlers();
    };
  }, [isRoomOwner, currentWord]);
  
  // 自动滚动聊天到底部
  useEffect(() => {
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [messages]);
  
  // 处理画板消息
  const handleDrawMessageReceived = (data: DrawMessage) => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    switch (data.type) {
      case 'draw':
        if (data.data.action === 'start') {
          ctx.beginPath();
          ctx.moveTo(data.data.x, data.data.y);
          
          if (data.data.tool === 'brush') {
            ctx.strokeStyle = data.data.color;
            ctx.lineWidth = data.data.brushSize;
          } else if (data.data.tool === 'eraser') {
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = data.data.eraserSize;
          }
          
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
        } else if (data.data.action === 'move') {
          ctx.lineTo(data.data.x, data.data.y);
          ctx.stroke();
        }
        break;
      case 'clear':
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        drawingHistoryRef.current = [];
        break;
      default:
        break;
    }
  };
  
  // Canvas事件处理 - 修复坐标计算
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isRoomOwner || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // 使用缩放比例来正确计算坐标
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setIsDrawing(true);
    currentPathRef.current = [{ x, y }];
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // 保存当前画布状态
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      drawingHistoryRef.current.push(imageData);
      
      if (tool === 'brush') {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round'; // 添加线条连接方式
        
        // 记录绘画操作，但不发送
        const operation = {
          action: 'start',
          tool: 'brush',
          x,
          y,
          color,
          brushSize
        };
        
        setDrawOperations(prev => [...prev, operation]);
      } else if (tool === 'eraser') {
        // 橡皮擦工具
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = '#FFFFFF'; // 白色橡皮擦
        ctx.lineWidth = eraserSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // 记录橡皮擦操作
        const operation = {
          action: 'start',
          tool: 'eraser',
          x,
          y,
          eraserSize
        };
        
        setDrawOperations(prev => [...prev, operation]);
      }
    }
  };
  
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isRoomOwner || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // 使用缩放比例来正确计算坐标
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    currentPathRef.current.push({ x, y });
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
      
      // 记录绘画操作，但不发送
      const operation = {
        action: 'move',
        tool: tool,
        x,
        y
      };
      
      setDrawOperations(prev => [...prev, operation]);
    }
  };
  
  // 添加触摸设备支持
  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isRoomOwner || !canvasRef.current) return;
    e.preventDefault(); // 防止页面滚动
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    
    // 使用缩放比例来正确计算坐标
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;
    
    setIsDrawing(true);
    currentPathRef.current = [{ x, y }];
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // 保存当前画布状态
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      drawingHistoryRef.current.push(imageData);
      
      if (tool === 'brush') {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // 记录绘画操作
        const operation = {
          action: 'start',
          tool: 'brush',
          x,
          y,
          color,
          brushSize
        };
        
        setDrawOperations(prev => [...prev, operation]);
      } else if (tool === 'eraser') {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = eraserSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // 记录橡皮擦操作
        const operation = {
          action: 'start',
          tool: 'eraser',
          x,
          y,
          eraserSize
        };
        
        setDrawOperations(prev => [...prev, operation]);
      }
    }
  };
  
  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isRoomOwner || !canvasRef.current) return;
    e.preventDefault(); // 防止页面滚动
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    
    // 使用缩放比例来正确计算坐标
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;
    
    currentPathRef.current.push({ x, y });
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
      
      // 记录绘画操作
      const operation = {
        action: 'move',
        tool: tool,
        x,
        y
      };
      
      setDrawOperations(prev => [...prev, operation]);
    }
  };
  
  const handleCanvasMouseUp = () => {
    if (!isDrawing || !isRoomOwner) return;
    setIsDrawing(false);
  };
  
  // 撤销上一步
  const handleUndo = () => {
    if (!canvasRef.current || drawingHistoryRef.current.length === 0) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      const prevState = drawingHistoryRef.current.pop();
      if (prevState) {
        ctx.putImageData(prevState, 0, 0);
        
        // 记录撤销操作
        const operation = {
          action: 'undo'
        };
        
        setDrawOperations(prev => [...prev, operation]);
      }
    }
  };
  
  // 清空画布
  const handleClear = () => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      drawingHistoryRef.current = [];
      
      // 记录清空操作
      const operation = {
        action: 'clear'
      };
      
      setDrawOperations(prev => [...prev, operation]);
    }
  };
  
  // 保存画布并上传
  const handleSave = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    
    // 获取画布数据
    const imageDataUrl = canvas.toDataURL('image/png');
    
    // 打印上传参数
    console.log('保存画布数据：', {
      imageDataUrl,
      operations: drawOperations,
      word: currentWord,
      timestamp: new Date().toISOString()
    });
    
    message.success('画布数据已准备好，请查看控制台');
    
    // 这里将来会调用上传API
    // API调用示例:
    // uploadDrawing({
    //   imageData: imageDataUrl,
    //   operations: drawOperations,
    //   word: currentWord
    // }).then(() => {
    //   message.success('绘画保存成功!');
    // }).catch(err => {
    //   message.error('保存失败: ' + err.message);
    // });
  };
  
  // 发送聊天消息
  const handleSendMessage = () => {
    if (!inputMessage.trim() || !currentUser) return;
    
    const message = {
      type: 'chat',
      data: {
        content: inputMessage,
        sender: {
          id: currentUser.id,
          name: currentUser.userName,
          avatar: currentUser.userAvatar
        }
      }
    };
    
    wsService.send(message);
    setInputMessage('');
  };
  
  // 设置新的绘画词语
  const handleSetNewWord = () => {
    Modal.confirm({
      title: '设置绘画词语',
      content: (
        <Input 
          placeholder="输入新的绘画词语" 
          onChange={(e) => setCurrentWord(e.target.value)}
          value={currentWord}
        />
      ),
      onOk() {
        if (currentWord.trim()) {
          wsService.send({
            type: 'draw',
            action: 'set_word',
            data: {
              word: currentWord
            }
          });
          message.success(`成功设置词语: ${currentWord}`);
        }
      }
    });
  };
  
  // 切换绘图工具
  const switchTool = (selectedTool: 'brush' | 'eraser') => {
    setTool(selectedTool);
    // 如果切换到画笔，记得保存当前画笔设置
    message.info(`已切换到${selectedTool === 'brush' ? '画笔' : '橡皮擦'}`);
  };
  
  const colorOptions = ['#000000', '#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#FF00FF', '#00FFFF'];
  
  return (
    <PageContainer>
      <div className="draw-game-container">
        <div className="draw-game-content">
          {/* 画板区域 */}
          <div className="draw-canvas-section">
            <Card 
              title={
                <div className="canvas-header">
                  <span>{isRoomOwner ? "你是绘画者" : "猜词环节"}</span>
                  {isRoomOwner && (
                    <div className="word-display">
                      当前词语: <Text strong>{currentWord || '(未设置)'}</Text>
                      <Button size="small" type="primary" onClick={handleSetNewWord}>
                        设置词语
                      </Button>
                    </div>
                  )}
                  <div className="timer">剩余时间: {roundTime}s</div>
                </div>
              } 
              className="draw-canvas-card"
            >
              <div className="canvas-container" ref={canvasContainerRef}>
                <canvas
                  ref={canvasRef}
                  width={canvasSize.width}
                  height={canvasSize.height}
                  className="draw-canvas"
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                  onTouchStart={handleCanvasTouchStart}
                  onTouchMove={handleCanvasTouchMove}
                  onTouchEnd={handleCanvasMouseUp}
                />
              </div>
              
              {isRoomOwner && (
                <div className="canvas-toolbar">
                  <div className="tool-selector">
                    <Button 
                      type={tool === 'brush' ? 'primary' : 'default'}
                      onClick={() => switchTool('brush')}
                      className="tool-button"
                    >
                      画笔
                    </Button>
                    <Button 
                      type={tool === 'eraser' ? 'primary' : 'default'}
                      onClick={() => switchTool('eraser')}
                      className="tool-button"
                    >
                      橡皮擦
                    </Button>
                  </div>
                  
                  {tool === 'brush' ? (
                    <>
                      <div className="color-palette">
                        {colorOptions.map((c) => (
                          <div 
                            key={c} 
                            className={`color-option ${color === c ? 'selected' : ''}`}
                            style={{ backgroundColor: c }}
                            onClick={() => setColor(c)}
                          />
                        ))}
                      </div>
                      
                      <div className="brush-size-controls">
                        <span>笔触大小:</span>
                        <input 
                          type="range" 
                          min="1" 
                          max="20" 
                          value={brushSize} 
                          onChange={(e) => setBrushSize(parseInt(e.target.value))}
                        />
                        <span>{brushSize}px</span>
                      </div>
                    </>
                  ) : (
                    <div className="brush-size-controls">
                      <span>橡皮大小:</span>
                      <input 
                        type="range" 
                        min="5" 
                        max="50" 
                        value={eraserSize} 
                        onChange={(e) => setEraserSize(parseInt(e.target.value))}
                      />
                      <span>{eraserSize}px</span>
                    </div>
                  )}
                  
                  <div className="canvas-actions">
                    <Button icon={<UndoOutlined />} onClick={handleUndo}>撤销</Button>
                    <Button icon={<ClearOutlined />} danger onClick={handleClear}>清空</Button>
                    <Button 
                      icon={<SaveOutlined />} 
                      type="primary"
                      onClick={handleSave}
                    >
                      保存
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
          
          {/* 聊天室区域 */}
          <div className="chat-section">
            <Card title="聊天室" className="chat-card">
              <div className="chat-list" ref={chatListRef}>
                <List
                  itemLayout="horizontal"
                  dataSource={messages}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar src={item.sender.avatar} />}
                        title={<span>{item.sender.name} <Text type="secondary" style={{ fontSize: '12px' }}>
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </Text></span>}
                        description={item.content}
                      />
                    </List.Item>
                  )}
                />
              </div>
              
              <div className="chat-input">
                <Input 
                  placeholder="输入你的猜测..." 
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onPressEnter={handleSendMessage}
                  disabled={isRoomOwner}
                  suffix={
                    <Button 
                      type="primary" 
                      icon={<SendOutlined />} 
                      onClick={handleSendMessage}
                      disabled={isRoomOwner}
                    >
                      发送
                    </Button>
                  }
                />
                {isRoomOwner && <div className="drawing-hint">你是绘画者，不能参与猜词</div>}
              </div>
            </Card>
            
            <Card title="房间成员" className="users-card">
              <List
                dataSource={roomUsers}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar src={item.avatar} />}
                      title={item.name}
                      description={item.isOwner ? '(房主)' : '玩家'}
                    />
                    <div>{item.score || 0}分</div>
                  </List.Item>
                )}
              />
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default DrawPage;
