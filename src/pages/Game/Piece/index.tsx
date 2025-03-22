import React, {useState, useCallback, useEffect, useRef} from 'react';
import {Board as BoardComponent} from '@/components/Game/Board';
import {Board, Player, Position, Move, COLUMNS, ROWS, WinningLine} from '@/game';
import {createEmptyBoard, checkWin, getAIMove} from '@/utils/gameLogic';
import {Trophy, RotateCcw, ArrowLeft, ChevronDown, Brain, Timer, X, MessageSquare} from 'lucide-react';
import "./index.css"
import {Button, Input, message, Modal} from "antd";
import {BACKEND_HOST_WS} from "@/constants";
import {useModel} from "@@/exports";
import styles from './index.less';
import { wsService } from '@/services/websocket';

// 添加消息类型定义
interface ChatMessage {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
    level: number;
    isAdmin: boolean;
  };
  timestamp: Date;
}

function App() {
  // 新增类型定义
  type GameMode = 'single' | 'online';
  type OnlineStatus = 'connecting' | 'waiting' | 'playing';
  // 在App组件中新增状态
  const [gameMode, setGameMode] = useState<GameMode>('single');
  const [onlineStatus, setOnlineStatus] = useState<OnlineStatus>('connecting');
  const [roomId, setRoomId] = useState<string>('');
  const [opponentColor, setOpponentColor] = useState<Player>('white');
  const [opponentUserId, setOpponentUserId] = useState<string>();
  const [messageApi, contextHolder] = message.useMessage();
  //原有单机模式
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>('black');
  const [winner, setWinner] = useState<Player | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [moves, setMoves] = useState<Move[]>([]);
  const [playerColor, setPlayerColor] = useState<Player>('black');
  const [gameStarted, setGameStarted] = useState(false);
  const [lastMove, setLastMove] = useState<Position | null>(null);
  const [opponentLastMove, setOpponentLastMove] = useState<Position | null>(null);
  const [winningLine, setWinningLine] = useState<WinningLine | null>(null);
  const [showRestartModal, setShowRestartModal] = useState(false);
  const {initialState, setInitialState} = useModel('@@initialState');
  const {currentUser} = initialState || {};

  // 添加聊天相关的状态
  const [showChat, setShowChat] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInputValue, setChatInputValue] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // start 原有单机
  const addMove = (position: Position, player: Player) => {

    setMoves(prev => [...prev, {
      ...position,
      player,
      number: prev.length + 1
    }]);
  };
  // 处理远程对手的移动
  const handleRemoteMove = (position: Position, player: any) => {
    const newBoard = [...board];
    setOpponentColor(player);
    newBoard[position.row][position.col] = player;
    setBoard(newBoard);
    addMove(position, player);
    setOpponentLastMove(position);

    // 检查胜利
    const winResult = checkWin(newBoard, position, player);
    if (winResult) {
      setWinner(player);
      setWinningLine(winResult);
    } else {
      setPlayerColor(player === 'black' ? 'white' : 'black')
      setCurrentPlayer(player === 'black' ? 'white' : 'black'); // 切换回本地玩家回合
    }
  };

  //end 原有单机

  // 添加聊天相关的函数
  const scrollToBottom = () => {
    // 移除自动滚动功能
  };

  const handleChatMessage = (data: any) => {
    const otherUserMessage = data.data.message;
    if (otherUserMessage.sender.id !== String(currentUser?.id)) {
      setChatMessages(prev => [...prev, {...otherUserMessage}]);
      setTimeout(scrollToBottom, 100);
    }
  };

  const handleJoinSuccess = (data: any) => {
    setOpponentColor(data.data.opponentColor);
    setPlayerColor(data.data.yourColor);
    setOnlineStatus('playing');
    setGameStarted(true);
    setOpponentUserId(data.data.playerId);
    messageApi.open({
      type: 'success',
      content: '战斗开始！！！',
    });
    if (data.data.yourColor === 'white') {
      setCurrentPlayer('black');
    }
  };

  const handleCreateChessRoom = (data: any) => {
    console.log('创建房间成功', data.data);
    setRoomId(data.data);
    setOnlineStatus('waiting');
    messageApi.open({
      type: 'success',
      content: '房间创建成功啦',
    });
    setGameStarted(true);
  };

  const handleMoveChess = (data: any) => {
    setPlayerColor(data.data.player === 'black' ? 'white' : 'black');
    handleRemoteMove(data.data.position, data.data.player);
  };

  // 在游戏模式改变时建立WebSocket连接
  useEffect(() => {
    if (gameMode === 'online') {
      const token = localStorage.getItem('tokenValue');
      if (!token || !currentUser?.id) {
        messageApi.error('请先登录！');
        return;
      }

      // 添加消息处理器
      wsService.addMessageHandler('chat', handleChatMessage);
      wsService.addMessageHandler('joinSuccess', handleJoinSuccess);
      wsService.addMessageHandler('createChessRoom', handleCreateChessRoom);
      wsService.addMessageHandler('moveChess', handleMoveChess);

      // 连接WebSocket
      wsService.connect(token);

      return () => {
        // 移除消息处理器
        wsService.removeMessageHandler('chat', handleChatMessage);
        wsService.removeMessageHandler('joinSuccess', handleJoinSuccess);
        wsService.removeMessageHandler('createChessRoom', handleCreateChessRoom);
        wsService.removeMessageHandler('moveChess', handleMoveChess);
      };
    }
  }, [gameMode, currentUser?.id]);

  //原有单机
  const handleMove = useCallback((position: Position) => {
    if (gameMode === 'single') {
      // 原有单机逻辑...
      if (winner || board[position.row][position.col]) return;

      const newBoard = board.map(row => [...row]);
      newBoard[position.row][position.col] = currentPlayer;
      setBoard(newBoard);
      setLastMove(position);

      addMove(position, currentPlayer);

      const winResult = checkWin(newBoard, position, currentPlayer);
      if (winResult) {
        setWinner(currentPlayer);
        setWinningLine(winResult);
        return;
      }

      setCurrentPlayer(currentPlayer === 'black' ? 'white' : 'black');
    } else {
      if (onlineStatus !== 'playing') {
        messageApi.open({
          type: 'info',
          content: '对手还没加入呢，请耐心等待～',
        });
        return;
      }
      if (currentPlayer !== playerColor || winner) return;

      // 使用全局 WebSocket 服务发送消息
      wsService.send({
        type: 2,
        userId: opponentUserId,
        data: {
          type: 'moveChess',
          content: {
            roomId: roomId,
            position,
            player: playerColor
          }
        },
      });

      // 本地更新棋盘
      const newBoard = [...board];
      newBoard[position.row][position.col] = playerColor;
      setBoard(newBoard);
      addMove(position, playerColor);

      // 检查胜利
      const winResult = checkWin(newBoard, position, playerColor);
      if (winResult) {
        setWinner(playerColor);
        setWinningLine(winResult);
      }

      setCurrentPlayer(opponentColor); // 切换回合显示
    }
  }, [board, winner, onlineStatus, gameMode, currentPlayer, playerColor, opponentColor, roomId, messageApi]);

  useEffect(() => {
    if (gameStarted && currentPlayer !== playerColor && !winner) {
      setIsThinking(true);
      const timer = setTimeout(() => {
        const aiMove = getAIMove(board);
        handleMove(aiMove);
        setIsThinking(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameMode, roomId, currentPlayer, board, winner, opponentColor, playerColor, gameStarted, handleMove]);

  const switchColor = () => {
    const newColor: Player = playerColor === 'black' ? 'white' : 'black';

    if (newColor === 'white') {
      const center = Math.floor(board.length / 2);
      handleMove({row: center, col: center})
      // setTimeout(() => , 0);
    }

    setPlayerColor(newColor);
    setBoard(createEmptyBoard());
    setCurrentPlayer('black');
    setWinner(null);
    setIsThinking(false);
    setMoves([]);
    setLastMove(null);
    setOpponentLastMove(null);
    setWinningLine(null);
    setShowRestartModal(false);


  };

  const continueWithSameColor = () => {
    setBoard(createEmptyBoard());

    setCurrentPlayer('black');
    setWinner(null);
    setIsThinking(false);
    setMoves([]);
    setLastMove(null);
    setOpponentLastMove(null);
    setWinningLine(null);
    setShowRestartModal(false);

    if (playerColor === 'white') {
      const center = Math.floor(board.length / 2);
      setTimeout(() => handleMove({row: center, col: center}), 0);
    }
  };

  const undoMove = () => {
    if (moves.length < 2 || isThinking || winner) return;
    const newMoves = moves.slice(0, -2);
    setMoves(newMoves);
    const newBoard = createEmptyBoard();
    newMoves.forEach(move => {
      newBoard[move.row][move.col] = move.player;
    });

    setBoard(newBoard);
    setCurrentPlayer(playerColor);
    setLastMove(newMoves.length > 0 ? newMoves[newMoves.length - 1] : null);
  };

  const startGame = (color: Player) => {
    setPlayerColor(color);
    setGameStarted(true);

    setBoard(createEmptyBoard());
    setCurrentPlayer('black');
    setWinner(null);
    setMoves([]);
    setLastMove(null);
    setOpponentLastMove(null);
    setWinningLine(null);

    if (color === 'white' && gameMode === 'single') {
      const center = Math.floor(board.length / 2);
      handleMove({row: center, col: center});
    }
  };

  const formatMove = (move: Move) => {
    const col = COLUMNS[move.col];
    const row = ROWS[move.row];
    return `${move.number}. ${move.player === 'black' ? '●' : '○'} ${col}${row}`;
  };

  // 添加 handleChatSend 函数
  const handleChatSend = () => {
    if (!chatInputValue.trim()) return;
    if (!currentUser?.id) {
      messageApi.error('请先登录！');
      return;
    }

    const newMessage: ChatMessage = {
      id: `${Date.now()}`,
      content: chatInputValue,
      sender: {
        id: String(currentUser.id),
        name: currentUser.userName || '游客',
        avatar: currentUser.userAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=visitor',
        level: currentUser.level || 1,
        isAdmin: currentUser.userRole === 'admin',
      },
      timestamp: new Date(),
    };

    // 使用全局 WebSocket 服务发送消息
    wsService.send({
      type: 2,
      userId: -1,
      data: {
        type: 'chat',
        content: {
          message: newMessage
        }
      }
    });

    // 更新消息列表
    setChatMessages(prev => [...prev, newMessage]);
    setChatInputValue('');
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br  to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white p-12 rounded-2xl shadow-xl max-w-lg w-full text-center">
          <h1
            className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            五子棋 Gomoku
          </h1>
          <p className="text-gray-600 mb-12">挑战AI，展现你的棋艺</p>
          <div className="mb-8">
            <h2 className="text-xl font-medium mb-4">选择游戏模式</h2>
            <div className="flex gap-4 justify-center">
              <button
                type={"button"}
                className="group px-8 py-4 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-all duration-200 transform hover:scale-105"
                onClick={() => setGameMode('single')}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div style={{
                    backgroundColor: gameMode === 'single' ? 'rgba(172,229,178,0.95)' : 'white',
                    color: 'white'
                  }} className="w-5 h-5 rounded-full border-2 border-gray-800"></div>
                  <span className="font-medium text-gray-800">单人 VS AI</span>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-600">Local Game</span>
              </button>
              <button
                type={"button"}
                onClick={() => setGameMode('online')}
                className="group px-8 py-4 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-all duration-200 transform hover:scale-105"

              >
                <div className="flex items-center gap-3 mb-2">
                  <div style={{
                    backgroundColor: gameMode === 'online' ? 'rgba(172,229,178,0.95)' : 'white',
                    color: 'white'
                  }}
                       className="w-5 h-5 rounded-full border-2 border-gray-800"></div>
                  <span className="font-medium text-gray-800">联机对战</span>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-600"> Online Game</span>
              </button>
            </div>
          </div>
          {contextHolder}
          {/* 联机模式下的额外UI */}
          {gameMode === 'online' && (

            <div className="mb-8">
              <Input
                type="text"
                placeholder="输入房间号（留空创建新房间）"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="border p-2 rounded-lg mb-4"
              />
              <Button
                onClick={() => {
                  if (roomId) {
                    // 发送加入房间请求
                    wsService.send({
                      type: 2,
                      userId: -1,
                      data: {
                        type: 'joinRoom',
                        content: roomId
                      }
                    });
                  } else {
                    // 发送创建房间请求
                    wsService.send({
                      type: 2,
                      userId: -1,
                      data: {
                        type: 'createChessRoom',
                        content: ''
                      }
                    });
                  }
                }}
              >
                {roomId ? '加入房间' : '创建房间'}
              </Button>
            </div>
          )}
          {gameMode === 'single' && (
            <div>
              <h2 className="text-xl font-medium mb-8 text-gray-800">选择您的执子颜色</h2>
              <div className="flex gap-6 justify-center">
                <button
                  type={"button"}
                  onClick={() => startGame('black')}
                  className="group px-8 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-200 transform hover:scale-105"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-5 h-5 rounded-full bg-black border-2 border-gray-700"></div>
                    <span className="font-medium">执黑先手</span>
                  </div>
                  <span className="text-sm text-gray-400 group-hover:text-gray-300">First Move</span>
                </button>
                <button
                  type={"button"}
                  onClick={() => startGame('white')}
                  className="group px-8 py-4 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-all duration-200 transform hover:scale-105"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-5 h-5 rounded-full bg-white border-2 border-gray-800"></div>
                    <span className="font-medium text-gray-800">执白后手</span>
                  </div>
                  <span className="text-sm text-gray-400 group-hover:text-gray-600">Second Move</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center">
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-xl p-4">
              {gameMode === 'online' && (
                <div className="mb-3 bg-purple-50 border border-purple-100 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      onlineStatus === 'playing' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}/>
                    <span className="text-sm text-purple-800">
                      {onlineStatus === 'connecting' && '连接中...'}
                      {onlineStatus === 'waiting' && `等待对手加入 (房间号🏠: ${roomId})`}
                      {onlineStatus === 'playing' && `对战中 - 你执${playerColor === 'black' ? '黑' : '白'}棋`}
                    </span>
                  </div>
                </div>
              )}
              {contextHolder}
              <div className="flex items-center justify-between mb-3">
                {gameMode === 'single' && (
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">五子棋 Gomoku</h1>
                    <div className="mt-1 flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${isThinking ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}/>
                      <span className="text-sm text-gray-600">
                      {isThinking ? 'AI 思考中...' : '等待落子'}
                    </span>
                    </div>
                  </div>
                )}
                {gameMode === 'single' && (
                  <div className="flex gap-3">
                    <button
                      type={"button"}
                      onClick={undoMove}
                      disabled={moves.length < 2 || isThinking || !!winner}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                        moves.length < 2 || isThinking || winner
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-amber-500 text-white hover:bg-amber-600'
                      } transition-colors`}
                    >
                      <ArrowLeft className="w-4 h-4"/>
                      <span className="font-medium">悔棋</span>
                    </button>
                    <button
                      type={"button"}
                      onClick={() => setShowRestartModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4"/>
                      <span className="font-medium">重新开始</span>
                    </button>
                  </div>
                )}
              </div>

              {winner && (
                <div
                  className="mb-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-center gap-3">
                  <Trophy className="w-6 h-6 text-yellow-600"/>
                  <span className="text-lg font-medium text-yellow-800">
                    {winner === playerColor ? '恭喜你赢了！' : gameMode === "online"
                      ? "对手小胜，再接再厉" : 'AI 赢了，再接再厉！'}
                  </span>
                </div>
              )}

              {!winner && (
                <div
                  className="mb-3 bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${
                      currentPlayer === 'black'
                        ? 'bg-gray-900'
                        : 'bg-white border-2 border-gray-900'
                    }`}/>
                    <div>
                      <div className="font-medium text-gray-900">
                        {currentPlayer === playerColor ? '你的回合' : '对手 回合'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {currentPlayer === 'black' ? '黑棋' : '白棋'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Timer className="w-5 h-5"/>
                      <span>回合 {moves.length + 1}</span>
                    </div>
                    {gameMode === 'single' && (
                      <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5"/>
                        <span>AI 难度: 高级</span>
                      </div>)}
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <BoardComponent
                  board={board}
                  onMove={handleMove}
                  disabled={isThinking || currentPlayer !== playerColor || !!winner}
                  lastMove={lastMove}
                  opponentLastMove={opponentLastMove}
                  winningLine={winningLine}
                />
              </div>
            </div>
          </div>

          {/* 右侧面板：对战记录和聊天窗口 */}
          {(gameMode === 'online' || gameMode === 'single') && (
            <div className="lg:w-96 w-full">
              <div className="bg-white rounded-2xl shadow-xl p-4 flex flex-col" style={{ height: 'calc(100vh - 8rem)' }}>
                {/* Tab 切换按钮 - 仅在联机模式下显示 */}
                {gameMode === 'online' && (
                  <div className="flex border-b mb-4">
                    <button
                      onClick={() => setActiveTab('chat')}
                      className={`flex-1 py-2 px-4 text-center font-medium transition-colors ${
                        activeTab === 'chat'
                          ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      聊天室
                    </button>
                    <button
                      onClick={() => setActiveTab('history')}
                      className={`flex-1 py-2 px-4 text-center font-medium transition-colors ${
                        activeTab === 'history'
                          ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      对战记录
                    </button>
                  </div>
                )}

                {/* 聊天窗口 - 仅在联机模式下显示 */}
                {gameMode === 'online' && activeTab === 'chat' && (
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1 overflow-y-auto mb-4">
                      {chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`mb-3 flex ${
                            currentUser?.id && String(msg.sender.id) === String(currentUser.id)
                              ? 'justify-end'
                              : 'justify-start'
                          }`}
                        >
                          <div className={`max-w-[80%] ${
                            currentUser?.id && String(msg.sender.id) === String(currentUser.id)
                              ? 'order-2'
                              : 'order-1'
                          }`}>
                            <div className={`flex items-center gap-2 mb-1 ${
                              currentUser?.id && String(msg.sender.id) === String(currentUser.id)
                                ? 'justify-end'
                                : 'justify-start'
                            }`}>
                              <span className="text-sm text-gray-500">{msg.sender.name}</span>
                              <span className="text-xs text-gray-400">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <div className={`rounded-2xl px-4 py-2 ${
                              currentUser?.id && String(msg.sender.id) === String(currentUser.id)
                                ? 'bg-blue-500 text-white rounded-br-none'
                                : 'bg-gray-100 text-gray-800 rounded-bl-none'
                            }`}>
                              {msg.content}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <Input.TextArea
                        value={chatInputValue}
                        onChange={(e) => setChatInputValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleChatSend();
                          }
                        }}
                        placeholder="输入消息..."
                        autoSize={{ minRows: 1, maxRows: 4 }}
                        className="flex-1"
                      />
                      <Button type="primary" onClick={handleChatSend} className="px-6">
                        发送
                      </Button>
                    </div>
                  </div>
                )}

                {/* 对战记录 - 在所有模式下显示 */}
                {(gameMode === 'single' || (gameMode === 'online' && activeTab === 'history')) && (
                  <div className="flex-1 overflow-y-auto">
                    {moves.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                          <Timer className="w-8 h-8"/>
                        </div>
                        <p>暂无落子</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {moves.map((move, index) => (
                          <div
                            key={index}
                            className={`p-2.5 rounded-lg cursor-pointer transition-colors ${
                              index === moves.length - 1
                                ? 'bg-blue-50 border border-blue-100'
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => {
                              // 这里可以添加点击落子记录时的处理逻辑
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full ${
                                move.player === 'black'
                                  ? 'bg-gray-900'
                                  : 'bg-white border-2 border-gray-900'
                              }`}/>
                              <span className="font-medium">{formatMove(move)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Restart Modal */}
      {showRestartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">重新开始</h3>
              {/* eslint-disable-next-line react/button-has-type */}
              <button
                onClick={() => setShowRestartModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5"/>
              </button>
            </div>
            <p className="text-gray-600 mb-6">请选择重新开始的方式：</p>
            <div className="space-y-3">
              <button
                type={"button"}
                onClick={continueWithSameColor}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <div className={`w-4 h-4 rounded-full ${
                  playerColor === 'black'
                    ? 'bg-gray-900'
                    : 'bg-white border-2 border-gray-900'
                }`}/>
                <span className="font-medium">继续{playerColor === 'black' ? '执黑先手' : '执白后手'}</span>
              </button>
              <button
                type={"button"}
                onClick={switchColor}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors flex items-center justify-center gap-2"
              >
                <div className={`w-4 h-4 rounded-full ${
                  playerColor === 'black'
                    ? 'bg-white border-2 border-gray-900'
                    : 'bg-gray-900'
                }`}/>
                <span className="font-medium text-gray-800">
                  改为{playerColor === 'black' ? '执白后手' : '执黑先手'}
                </span>
              </button>
              <button
                type={"button"}
                onClick={() => setShowRestartModal(false)}
                className="w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
