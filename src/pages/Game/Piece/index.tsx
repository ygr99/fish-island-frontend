import React, {useState, useCallback, useEffect} from 'react';
import {Board, Player, Position, Move, COLUMNS, ROWS, WinningLine} from '@/game';
import {Board as BoardComponent} from '@/components/Game/Board';
import {createEmptyBoard, checkWin, getAIMove} from '@/utils/gameLogic';
import {Trophy, RotateCcw, ArrowLeft, ChevronDown, Brain, Timer} from 'lucide-react';
import './index.css';


function App() {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>('black');
  const [winner, setWinner] = useState<Player | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [moves, setMoves] = useState<Move[]>([]);
  const [playerColor, setPlayerColor] = useState<Player>('black');
  const [gameStarted, setGameStarted] = useState(false);
  const [lastMove, setLastMove] = useState<Position | null>(null);
  const [winningLine, setWinningLine] = useState<WinningLine | null>(null);

  const addMove = (position: Position, player: Player) => {
    setMoves(prev => [...prev, {
      ...position,
      player,
      number: prev.length + 1
    }]);
  };

  const handleMove = useCallback((position: Position) => {
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
  }, [board, currentPlayer, winner]);

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
  }, [currentPlayer, board, winner, playerColor, gameStarted, handleMove]);

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setCurrentPlayer('black');
    setWinner(null);
    setIsThinking(false);
    setMoves([]);
    setGameStarted(false);
    setLastMove(null);
    setWinningLine(null);
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

    if (color === 'white') {
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
      <div className="min-h-screen bg-gradient-to-br to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white p-12 rounded-2xl shadow-xl max-w-lg w-full text-center">
          <h1
            className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            五子棋 Gomoku
          </h1>
          <p className="text-gray-600 mb-12">挑战AI，展现你的棋艺</p>
          <h2 className="text-xl font-medium mb-8 text-gray-800">选择您的执子颜色</h2>
          <div className="flex gap-6 justify-center">
            <button
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br flex items-center">
      <div className="w-full max-w-7xl mx-auto ">
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-xl p-4">
              <div className="flex items-center justify-between mb-3">
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
                <div className="flex gap-3">
                  <button
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
                    onClick={resetGame}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4"/>
                    <span className="font-medium">重新开始</span>
                  </button>
                </div>
              </div>

              {winner && (
                <div
                  className="mb-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-center gap-3">
                  <Trophy className="w-6 h-6 text-yellow-600"/>
                  <span className="text-lg font-medium text-yellow-800">
                    {winner === playerColor ? '恭喜你赢了！' : 'AI 赢了，再接再厉！'}
                  </span>
                </div>
              )}

              {!winner && (
                <div
                  className="mb-3 bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${
                      currentPlayer === 'black' ? 'bg-gray-900' : 'bg-white border-2 border-gray-900'
                    }`}/>
                    <div>
                      <div className="font-medium text-gray-900">
                        {currentPlayer === playerColor ? '你的回合' : 'AI 回合'}
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
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5"/>
                      <span>AI 难度: 高级</span>
                    </div>
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
    </div>
  );
}

export default App;
