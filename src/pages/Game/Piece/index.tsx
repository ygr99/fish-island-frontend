import React, {useState, useCallback, useEffect} from 'react';
import {Board as BoardComponent} from '@/components/Game/Board';
import {Board, Player, Position, Move, COLUMNS, ROWS, WinningLine} from '@/game';
import {createEmptyBoard, checkWin, getAIMove} from '@/utils/gameLogic';
import {Trophy, RotateCcw, ArrowLeft, ChevronDown, Brain, Timer, X} from 'lucide-react';
import "./index.css"
import {Button, Input, message} from "antd";

function App() {
  // 新增类型定义
  type GameMode = 'single' | 'online';
  type OnlineStatus = 'connecting' | 'waiting' | 'playing';
  // 在App组件中新增状态
  const [gameMode, setGameMode] = useState<GameMode>('online');
  const [onlineStatus, setOnlineStatus] = useState<OnlineStatus>('connecting');
  const [ws, setWs] = useState<WebSocket | null>(null);
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
  const [winningLine, setWinningLine] = useState<WinningLine | null>(null);
  const [showRestartModal, setShowRestartModal] = useState(false);

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
    addMove(position, opponentColor);

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

  // 建立WebSocket连接（根据后端URL修改）
  useEffect(() => {

    if (gameMode === 'online') {
      const token = localStorage.getItem('tokenValue');
      if (!token) {
        messageApi.open({
          type: 'info',
          content: '请先登陆一下啦～',
        });
        // setGameMode('single')
        return;
      }
    }
    if (gameMode === 'online' && !ws) {
      const token = localStorage.getItem('tokenValue');
      console.log("开始连接系统")
      const socket = new WebSocket('ws://127.0.0.1:8090?token=' + token);

      socket.onopen = () => {
        setOnlineStatus('waiting');
        // 请求加入或创建房间逻辑
        // 这里示例自动创建房间，实际需要UI让用户输入房间号
        socket.send(JSON.stringify({
          type: 1,
        }));
      };
      socket.onclose = () => {
        messageApi.open({
          type: 'error',
          content: '连接断开啦🔗',
        });
        // setGameMode('single')
        setWs(null);
        setOnlineStatus('connecting');
      };

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        switch (message.type) {
          case 'createChessRoom':
            console.log('创建房间成功', message.data);
            setRoomId(message.data);
            messageApi.open({
              type: 'success',
              content: '房间创建成功啦',
            });
            setGameStarted(true);
            break;
          case 'joinSuccess':
            setOpponentColor(message.data.opponentColor);
            setPlayerColor(message.data.yourColor);
            setOnlineStatus('playing');
            setGameStarted(true);
            setOpponentUserId(message.data.playerId);
            messageApi.open({
              type: 'success',
              content: '战斗开始！！！',
            });
            if (message.data.yourColor === 'white') {
              // 如果加入房间且执白，等待对方先手
              setCurrentPlayer('black');
            }
            break;
          case 'moveChess':
            setPlayerColor(message.data.player === 'black' ? 'white' : 'black');
            // 处理对手的移动
            handleRemoteMove(message.data.position, message.data.player);
            break;
          case 'error':
            console.error('WebSocket Error:', message.error);
            break;
        }
      };
      // 定期发送心跳消息（ping）
      const pingInterval = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          console.log('Sending ping...');
          socket.send(JSON.stringify({
            type: 4,
          }));
        }
      }, 25000);  // 每 25 秒发送一次心跳

      setWs(socket);

      // 清理：组件卸载时关闭 WebSocket 连接并清除定时器
      return () => {
        clearInterval(pingInterval);
        socket.close();
      };
    }
  }, [gameMode]);

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
      // 发送移动信息到服务器
      ws?.send(JSON.stringify({
        type: '2',
        userId: opponentUserId,
        data: {
          type: 'moveChess',
          content: {
            roomId: roomId,
            position,
            player: playerColor
          }
        },
      }));

      // 本地更新棋盘
      const newBoard = [...board]
      // const newBoard = board.map(row => [...row]);
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

  }, [board, winner, onlineStatus, gameMode, currentPlayer, playerColor, opponentColor, ws, roomId, messageApi]);

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
  }, [gameMode, ws, roomId, currentPlayer, board, winner, opponentColor, playerColor, gameStarted, handleMove]);

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
                    ws?.send(JSON.stringify({
                      type: 2,
                      userId: -1,
                      data: {
                        type: 'joinRoom',
                        content: roomId
                      }
                    }));
                  } else {
                    // 发送创建房间请求
                    ws?.send(JSON.stringify({
                      type: 2,
                      userId: -1,
                      data: {
                        type: 'createChessRoom',
                        content: ''
                      }
                    }));
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
                  winningLine={winningLine}
                />
              </div>
            </div>
          </div>

          <div className="lg:w-96 w-full">
            <div className="bg-white rounded-2xl shadow-xl p-4 h-full">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-gray-800">对局记录</h2>
                <ChevronDown className="w-5 h-5 text-gray-400"/>
              </div>
              <div className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-10rem)] overflow-y-auto">
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
                        className={`p-2.5 rounded-lg ${
                          index === moves.length - 1
                            ? 'bg-blue-50 border border-blue-100'
                            : 'hover:bg-gray-50'
                        }`}
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
            </div>
          </div>
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
