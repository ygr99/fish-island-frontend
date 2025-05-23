import { Board, Piece, Player, Position, PieceType, CheckStatus } from '@/gameChineseChess';

// 棋盘尺寸
export const BOARD_COLS = 9;
export const BOARD_ROWS = 10;

// 添加全局静默模式变量
export let GLOBAL_SILENT_MODE = false;

// 创建空棋盘
export function createEmptyBoard(): Board {
  return Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null));
}

// 添加揭棋模式相关的类型定义
export interface HiddenPiece extends Piece {
  isHidden: boolean;
  originalPosition?: Position; // 添加原始位置字段，用于确定走法
}

// 创建初始棋盘，设置所有棋子的初始位置
export function createInitialBoard(gameType: 'normal' | 'hidden' = 'normal'): Board {
  const board = createEmptyBoard();

  if (gameType === 'normal') {
    // 普通模式，按标准方式放置
    placePiece(board, 'chariot', 'red', 9, 0);
    placePiece(board, 'horse', 'red', 9, 1);
    placePiece(board, 'elephant', 'red', 9, 2);
    placePiece(board, 'advisor', 'red', 9, 3);
    placePiece(board, 'general', 'red', 9, 4);
    placePiece(board, 'advisor', 'red', 9, 5);
    placePiece(board, 'elephant', 'red', 9, 6);
    placePiece(board, 'horse', 'red', 9, 7);
    placePiece(board, 'chariot', 'red', 9, 8);
    placePiece(board, 'cannon', 'red', 7, 1);
    placePiece(board, 'cannon', 'red', 7, 7);
    placePiece(board, 'soldier', 'red', 6, 0);
    placePiece(board, 'soldier', 'red', 6, 2);
    placePiece(board, 'soldier', 'red', 6, 4);
    placePiece(board, 'soldier', 'red', 6, 6);
    placePiece(board, 'soldier', 'red', 6, 8);
    placePiece(board, 'chariot', 'black', 0, 0);
    placePiece(board, 'horse', 'black', 0, 1);
    placePiece(board, 'elephant', 'black', 0, 2);
    placePiece(board, 'advisor', 'black', 0, 3);
    placePiece(board, 'general', 'black', 0, 4);
    placePiece(board, 'advisor', 'black', 0, 5);
    placePiece(board, 'elephant', 'black', 0, 6);
    placePiece(board, 'horse', 'black', 0, 7);
    placePiece(board, 'chariot', 'black', 0, 8);
    placePiece(board, 'cannon', 'black', 2, 1);
    placePiece(board, 'cannon', 'black', 2, 7);
    placePiece(board, 'soldier', 'black', 3, 0);
    placePiece(board, 'soldier', 'black', 3, 2);
    placePiece(board, 'soldier', 'black', 3, 4);
    placePiece(board, 'soldier', 'black', 3, 6);
    placePiece(board, 'soldier', 'black', 3, 8);
    return board;
  }

  // 揭棋模式
  // 1. 先放明将/帅
  placePiece(board, 'general', 'red', 9, 4);
  placePiece(board, 'general', 'black', 0, 4);

  // 2. 创建所有棋子类型的池子（不包括将帅）
  const pieceTypes: PieceType[] = [
    'chariot', 'chariot', 'horse', 'horse', 'elephant', 'elephant', 
    'advisor', 'advisor', 'cannon', 'cannon', 
    'soldier', 'soldier', 'soldier', 'soldier', 'soldier'
  ];
  
  // 红黑双方各自的棋子池
  const redPieces: Piece[] = pieceTypes.map((type, i) => ({
    type,
    player: 'red',
    id: `red-${type}-${i}`
  }));
  
  const blackPieces: Piece[] = pieceTypes.map((type, i) => ({
    type,
    player: 'black',
    id: `black-${type}-${i}`
  }));
  
  // 3. 随机打乱棋子池
  for (let i = redPieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [redPieces[i], redPieces[j]] = [redPieces[j], redPieces[i]];
  }
  
  for (let i = blackPieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [blackPieces[i], blackPieces[j]] = [blackPieces[j], blackPieces[i]];
  }
  
  // 4. 放置红方暗子（按位置）
  let redIndex = 0;
  // 底线棋子（车马相士）
  for (let col = 0; col < 9; col++) {
    if (col !== 4) { // 跳过将帅位置
      board[9][col] = {
        ...redPieces[redIndex++],
        isHidden: true,
        originalPosition: {row: 9, col} // 记录原始位置，用于确定走法
      } as HiddenPiece;
    }
  }
  // 炮的位置
  board[7][1] = {
    ...redPieces[redIndex++],
    isHidden: true,
    originalPosition: {row: 7, col: 1}
  } as HiddenPiece;
  board[7][7] = {
    ...redPieces[redIndex++],
    isHidden: true,
    originalPosition: {row: 7, col: 7}
  } as HiddenPiece;
  // 兵的位置
  for (let col = 0; col < 9; col += 2) {
    board[6][col] = {
      ...redPieces[redIndex++],
      isHidden: true,
      originalPosition: {row: 6, col}
    } as HiddenPiece;
  }

  // 5. 放置黑方暗子（按位置）
  let blackIndex = 0;
  // 底线棋子（车马相士）
  for (let col = 0; col < 9; col++) {
    if (col !== 4) { // 跳过将帅位置
      board[0][col] = {
        ...blackPieces[blackIndex++],
        isHidden: true,
        originalPosition: {row: 0, col} // 记录原始位置，用于确定走法
      } as HiddenPiece;
    }
  }
  // 炮的位置
  board[2][1] = {
    ...blackPieces[blackIndex++],
    isHidden: true,
    originalPosition: {row: 2, col: 1}
  } as HiddenPiece;
  board[2][7] = {
    ...blackPieces[blackIndex++],
    isHidden: true,
    originalPosition: {row: 2, col: 7}
  } as HiddenPiece;
  // 卒的位置
  for (let col = 0; col < 9; col += 2) {
    board[3][col] = {
      ...blackPieces[blackIndex++],
      isHidden: true,
      originalPosition: {row: 3, col}
    } as HiddenPiece;
  }

  return board;
}

// 在指定位置放置棋子
function placePiece(board: Board, type: PieceType, player: Player, row: number, col: number): void {
  board[row][col] = {
    type,
    player,
    id: `${player}-${type}-${row}-${col}`
  };
}

// 复制棋盘
export function copyBoard(board: Board): Board {
  return board.map(row => [...row]);
}

// 判断位置是否在棋盘内
export function isPositionInBoard(position: Position): boolean {
  return position.row >= 0 && position.row < BOARD_ROWS &&
         position.col >= 0 && position.col < BOARD_COLS;
}

// 判断位置是否在九宫格内
export function isInPalace(position: Position, player: Player): boolean {
  const { row, col } = position;

  // 只检查列的范围（3-5）和行的范围（0-2或7-9）
  const isValidCol = col >= 3 && col <= 5;
  const isValidRow = player === 'red' ?
    (row >= 7 && row <= 9) :
    (row >= 0 && row <= 2);

  return isValidCol && isValidRow;
}

// 新增：根据棋子类型判断走法（不依赖piece.type）
function isValidMoveByType(
  board: Board,
  from: Position,
  to: Position,
  pieceType: PieceType,
  player: Player,
  canCrossRiver: boolean = false
): boolean {
  // 不能吃自己的棋子
  if (board[to.row][to.col]?.player === player) return false;
  // 修正：未翻开的暗子，pieceType 必须用 getEffectivePieceType
  const piece = board[from.row][from.col];
  let realType = piece ? getEffectivePieceType(piece, from) : pieceType;
  switch (realType) {
    case 'general':
      return isValidGeneralMove(board, from, to, player);
    case 'advisor':
      return isValidAdvisorMove(board, from, to, player, canCrossRiver);
    case 'elephant':
      return isValidElephantMove(board, from, to, player, canCrossRiver);
    case 'horse':
      return isValidHorseMove(board, from, to);
    case 'chariot':
      return isValidChariotMove(board, from, to);
    case 'cannon':
      return isValidCannonMove(board, from, to);
    case 'soldier':
      return isValidSoldierMove(board, from, to, player);
    default:
      return false;
  }
}

// 原有的移动规则函数
function isValidMoveNormal(board: Board, from: Position, to: Position, canCrossRiver: boolean = false): boolean {
  const piece = board[from.row][from.col];
  if (!piece) return false;
  // 不能吃自己的棋子
  if (board[to.row][to.col]?.player === piece.player) return false;
  // 修正：未翻开的暗子，pieceType 必须用 getEffectivePieceType
  let realType = getEffectivePieceType(piece, from);
  switch (realType) {
    case 'general':
      return isValidGeneralMove(board, from, to, piece.player);
    case 'advisor':
      return isValidAdvisorMove(board, from, to, piece.player, canCrossRiver);
    case 'elephant':
      return isValidElephantMove(board, from, to, piece.player, canCrossRiver);
    case 'horse':
      return isValidHorseMove(board, from, to);
    case 'chariot':
      return isValidChariotMove(board, from, to);
    case 'cannon':
      return isValidCannonMove(board, from, to);
    case 'soldier':
      return isValidSoldierMove(board, from, to, piece.player);
    default:
      return false;
  }
}

// 将/帅的移动规则
function isValidGeneralMove(board: Board, fromPos: Position, toPos: Position, player: Player): boolean {
  // 将帅只能在九宫格内移动
  if (!isInPalace(toPos, player)) return false;

  const rowDiff = Math.abs(toPos.row - fromPos.row);
  const colDiff = Math.abs(toPos.col - fromPos.col);

  // 将帅只能上下左右移动一格
  const normalMove = (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);

  // 特殊规则：将帅对面时，将可以吃帅，帅可以吃将
  if (!normalMove) {
    // 检查是否是直接面对对方将帅的特殊情况
    const opponent = player === 'red' ? 'black' : 'red';
    const piece = board[toPos.row][toPos.col];

    // 如果目标位置是对方的将帅
    if (piece && piece.player === opponent && piece.type === 'general') {
      // 检查两个将帅是否在同一列上
      if (toPos.col === fromPos.col) {
        // 检查两个将帅之间是否有其他棋子
        let hasObstacle = false;
        const startRow = Math.min(fromPos.row, toPos.row) + 1;
        const endRow = Math.max(fromPos.row, toPos.row);

        for (let row = startRow; row < endRow; row++) {
          if (board[row][fromPos.col] !== null) {
            hasObstacle = true;
            break;
          }
        }

        // 如果没有障碍物，将帅可以相互吃
        if (!hasObstacle) {
          // 允许将帅隔空相吃
          return true;
        }
      }
    }
  }

  return normalMove;
}

// 士/仕的移动规则
function isValidAdvisorMove(board: Board, fromPos: Position, toPos: Position, player: Player, canCrossRiver: boolean = false): boolean {
  // 如果允许过河，则不需要检查九宫格限制
  if (!canCrossRiver && !isInPalace(toPos, player)) return false;

  const rowDiff = Math.abs(toPos.row - fromPos.row);
  const colDiff = Math.abs(toPos.col - fromPos.col);

  // 士仕只能斜着走一格
  return rowDiff === 1 && colDiff === 1;
}

// 象/相的移动规则
function isValidElephantMove(board: Board, fromPos: Position, toPos: Position, player: Player, canCrossRiver: boolean = false): boolean {
  // 如果不允许过河，则检查过河限制
  if (!canCrossRiver) {
    if (player === 'red' && toPos.row < 5) return false;
    if (player === 'black' && toPos.row > 4) return false;
  }

  const rowDiff = Math.abs(toPos.row - fromPos.row);
  const colDiff = Math.abs(toPos.col - fromPos.col);

  // 象相必须走"田"字
  if (rowDiff !== 2 || colDiff !== 2) return false;

  // 检查象眼是否被堵住
  const eyeRow = Math.floor((fromPos.row + toPos.row) / 2);
  const eyeCol = Math.floor((fromPos.col + toPos.col) / 2);

  return board[eyeRow][eyeCol] === null;
}

// 马的移动规则
function isValidHorseMove(board: Board, fromPos: Position, toPos: Position): boolean {
  const rowDiff = Math.abs(toPos.row - fromPos.row);
  const colDiff = Math.abs(toPos.col - fromPos.col);

  // 马走"日"字
  if (!((rowDiff === 1 && colDiff === 2) || (rowDiff === 2 && colDiff === 1))) {
    return false;
  }

  // 检查马脚是否被绊住
  if (rowDiff === 2) {
    // 垂直方向上的"拐脚"移动（上或下）
    const legRow = fromPos.row + (toPos.row > fromPos.row ? 1 : -1);
    const legCol = fromPos.col;
    if (board[legRow][legCol] !== null) {
      // 马脚被卡住
      return false;
    }
  } else { // rowDiff === 1 && colDiff === 2
    // 水平方向上的"拐脚"移动（左或右）
    const legRow = fromPos.row;
    const legCol = fromPos.col + (toPos.col > fromPos.col ? 1 : -1);
    if (board[legRow][legCol] !== null) {
      // 马脚被卡住
      return false;
    }
  }

  return true;
}

// 车的移动规则
function isValidChariotMove(board: Board, fromPos: Position, toPos: Position): boolean {
  const rowDiff = Math.abs(toPos.row - fromPos.row);
  const colDiff = Math.abs(toPos.col - fromPos.col);

  // 车只能直线移动（横或竖）
  if (rowDiff > 0 && colDiff > 0) {
    return false;
  }

  // 检查路径上是否有其他棋子
  if (rowDiff > 0) {
    // 竖直移动
    const direction = toPos.row > fromPos.row ? 1 : -1;
    let currentRow = fromPos.row + direction;

    while (currentRow !== toPos.row) {
      if (board[currentRow][fromPos.col] !== null) {
        return false;
      }
      currentRow += direction;
    }
  } else if (colDiff > 0) {
    // 水平移动
    const direction = toPos.col > fromPos.col ? 1 : -1;
    let currentCol = fromPos.col + direction;

    while (currentCol !== toPos.col) {
      if (board[fromPos.row][currentCol] !== null) {
        return false;
      }
      currentCol += direction;
    }
  }

  return true;
}

// 炮的移动规则
function isValidCannonMove(board: Board, fromPos: Position, toPos: Position): boolean {
  const rowDiff = Math.abs(toPos.row - fromPos.row);
  const colDiff = Math.abs(toPos.col - fromPos.col);

  // 炮只能直线移动（横或竖）
  if (rowDiff > 0 && colDiff > 0) {
    return false;
  }

  // 计算路径上的棋子数量
  let piecesInPath = 0;

  if (rowDiff > 0) {
    // 竖直移动
    const direction = toPos.row > fromPos.row ? 1 : -1;
    let currentRow = fromPos.row + direction;

    while (currentRow !== toPos.row) {
      if (board[currentRow][fromPos.col] !== null) {
        piecesInPath++;
      }
      currentRow += direction;
    }
  } else if (colDiff > 0) {
    // 水平移动
    const direction = toPos.col > fromPos.col ? 1 : -1;
    let currentCol = fromPos.col + direction;

    while (currentCol !== toPos.col) {
      if (board[fromPos.row][currentCol] !== null) {
        piecesInPath++;
      }
      currentCol += direction;
    }
  }

  const targetPiece = board[toPos.row][toPos.col];

  // 如果目标位置没有棋子，则不能有翻山（路径上不能有棋子）
  if (targetPiece === null) {
    return piecesInPath === 0;
  }

  // 如果目标位置有棋子，则必须正好翻过一个棋子才能吃子
  return piecesInPath === 1;
}

// 兵/卒的移动规则
function isValidSoldierMove(board: Board, fromPos: Position, toPos: Position, player: Player): boolean {
  const rowDiff = toPos.row - fromPos.row;
  const absRowDiff = Math.abs(rowDiff);
  const colDiff = Math.abs(toPos.col - fromPos.col);

  // 兵只能前进一格或过河后左右移动一格
  if (player === 'red') {
    // 红方兵向上移动
    if (rowDiff > 0) return false; // 不能后退

    // 未过河（在第5行之后）只能向前
    if (fromPos.row > 4) {
      return rowDiff === -1 && colDiff === 0;
    } else {
      // 过河后可以向前或左右
      return (absRowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }
  } else {
    // 黑方卒向下移动
    if (rowDiff < 0) return false; // 不能后退

    // 未过河（在第4行之前）只能向前
    if (fromPos.row < 5) {
      return rowDiff === 1 && colDiff === 0;
    } else {
      // 过河后可以向前或左右
      return (absRowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }
  }
}

// 找到指定玩家的将/帅的位置
export function findGeneral(board: Board, player: Player): Position | null {
  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'general' && piece.player === player) {
        return { row, col };
      }
    }
  }
  return null;
}

// 检查是否被将军
export function isInCheck(
  board: Board,
  player: Player,
  silent: boolean = true, // 添加silent参数
  gameType: 'normal' | 'hidden' = 'normal'
): CheckStatus {
  // 使用全局静默模式或传入的silent参数
  const isSilent = GLOBAL_SILENT_MODE || silent;

  // 找到将/帅的位置
  const generalPosition = findGeneral(board, player);
  if (!generalPosition) return { inCheck: false, checkedBy: null };

  const opponent: Player = player === 'red' ? 'black' : 'red';
  const checkedBy: Piece[] = [];

  // 检查所有对手棋子是否可以吃掉将/帅
  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      const piece = board[row][col];
      if (piece && piece.player === opponent) {
        const fromPos = { row, col };
        // 使用isValidMove确认对方是否能够攻击将帅
        if (isValidMove(board, fromPos, generalPosition, gameType)) {
          checkedBy.push(piece);
          if (!isSilent) {
            console.log(`${player}方将/帅被${opponent}方${piece.type}将军`);
          }
        }
      }
    }
  }

  // 额外检查：将帅是否面对面
  const opponentGeneralPosition = findGeneral(board, opponent);
  if (opponentGeneralPosition && generalPosition.col === opponentGeneralPosition.col) {
    // 检查将帅之间是否有棋子
    let hasObstacle = false;
    const startRow = Math.min(generalPosition.row, opponentGeneralPosition.row) + 1;
    const endRow = Math.max(generalPosition.row, opponentGeneralPosition.row);

    for (let row = startRow; row < endRow; row++) {
      if (board[row][generalPosition.col] !== null) {
        hasObstacle = true;
        break;
      }
    }

    // 如果将帅之间没有棋子，则被对方将军
    if (!hasObstacle) {
      const opponentGeneral = board[opponentGeneralPosition.row][opponentGeneralPosition.col];
      if (opponentGeneral) {
        // 避免重复添加
        if (!checkedBy.some(p => p.id === opponentGeneral.id)) {
          checkedBy.push(opponentGeneral);
          if (!isSilent) {
            console.log(`将帅对面: ${player}方将/帅被${opponent}方将/帅照面，没有中间子阻挡`);
          }
        }
      }
    }
  }

  return {
    inCheck: checkedBy.length > 0,
    checkedBy: checkedBy.length > 0 ? checkedBy : null
  };
}

// 检查移动是否会导致自己被将军
export function isMoveSafeFromCheck(
  board: Board,
  fromPos: Position,
  toPos: Position,
  player: Player,
  silent: boolean = false, // 添加silent参数
  gameType: 'normal' | 'hidden' = 'normal'
): boolean {
  // 使用全局静默模式或传入的silent参数
  const isSilent = GLOBAL_SILENT_MODE || silent;

  // 模拟进行移动
  const newBoard = makeMove(board, fromPos, toPos, gameType);

  // 检查移动后是否处于被将军状态
  const checkStatus = isInCheck(newBoard, player, isSilent, gameType);

  return !checkStatus.inCheck;
}

// 检查是否将死（无合法移动可以解除将军状态）
export function isCheckmate(board: Board, player: Player, silent: boolean = false, gameType: 'normal' | 'hidden' = 'normal'): boolean {
  // 使用全局静默模式或传入的silent参数
  const isSilent = GLOBAL_SILENT_MODE || silent;

  const checkStatus = isInCheck(board, player, isSilent, gameType);
  if (!checkStatus.inCheck) return false;

  // 尝试每个棋子的每个可能移动，看是否能解除将军
  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      const piece = board[row][col];
      if (piece && piece.player === player) {
        const fromPos = { row, col };
        
        // 揭棋模式特殊处理
        if (gameType === 'hidden') {
          // 如果是暗子，使用原始位置规则
          if ((piece as HiddenPiece).isHidden) {
            const originalPos = (piece as HiddenPiece).originalPosition || fromPos;
            const pieceType = getPieceTypeByPosition(originalPos);
            // 获取暗子的可能移动
            const potentialMoves = getPotentialMoves(board, fromPos, pieceType, player, true, gameType);
            
            for (const toPos of potentialMoves) {
              // 检查移动是否合法且可以解除将军状态
              if (isValidHiddenPieceFirstMove(board, fromPos, toPos, piece) &&
                  isMoveSafeFromCheck(board, fromPos, toPos, player, isSilent, gameType)) {
                return false; // 找到了一个可以解除将军的移动
              }
            }
          } else {
            // 如果是明子，使用正常规则
            const realType = getEffectivePieceType(piece, fromPos);
            const potentialMoves = getPotentialMoves(board, fromPos, realType, player, true, gameType);
            
            for (const toPos of potentialMoves) {
              if (isValidMove(board, fromPos, toPos, gameType) &&
                  isMoveSafeFromCheck(board, fromPos, toPos, player, isSilent, gameType)) {
                return false; // 找到了一个可以解除将军的移动
              }
            }
          }
        } else {
          // 普通模式
          const realType = getEffectivePieceType(piece, fromPos);
          const potentialMoves = getPotentialMoves(board, fromPos, realType, player, true, gameType);
          
          for (const toPos of potentialMoves) {
            if (isValidMove(board, fromPos, toPos, gameType) &&
                isMoveSafeFromCheck(board, fromPos, toPos, player, isSilent, gameType)) {
              return false; // 找到了一个可以解除将军的移动
            }
          }
        }
      }
    }
  }

  // 没有找到可以解除将军的移动，判定为将死
  return true;
}

// 执行移动，返回移动后的新棋盘
export function makeMove(
  board: Board,
  from: Position,
  to: Position,
  gameType: 'normal' | 'hidden' = 'normal'
): Board {
  const newBoard = copyBoard(board);
  const piece = newBoard[from.row][from.col];
  if (!piece) return newBoard;

  // 修正：揭棋模式下暗子移动，先翻明再移动
  if (gameType === 'hidden' && (piece as HiddenPiece).isHidden) {
    // 先翻明（去掉 isHidden 和 originalPosition）
    const { isHidden, originalPosition, ...restProps } = piece as HiddenPiece;
    // 生成明子对象
    const revealed = { ...restProps };
    // 目标位置放明子
    newBoard[to.row][to.col] = revealed;
  } else {
    newBoard[to.row][to.col] = piece;
  }
  newBoard[from.row][from.col] = null;
  return newBoard;
}

// 获取电脑AI的移动
export function getAIMove(board: Board, player: Player, gameType: 'normal' | 'hidden' = 'normal'): { from: Position, to: Position } {
  // 启用全局静默模式，抑制所有日志输出
  const previousSilentMode = GLOBAL_SILENT_MODE;
  GLOBAL_SILENT_MODE = true;

  try {
    // 记录开始时间，用于性能分析
    const startTime = Date.now();

    // 使用Alpha-Beta剪枝搜索找到最佳走法
    const possibleMoves: Array<{ from: Position, to: Position, score: number }> = [];
    const opponent = player === 'red' ? 'black' : 'red';

    // 检查当前是否处于将军状态，优先考虑解除将军
    const inCheckStatus = isInCheck(board, player, true, gameType);
    let movesChecked = 0;

    // 遍历所有AI棋子
    for (let row = 0; row < BOARD_ROWS; row++) {
      for (let col = 0; col < BOARD_COLS; col++) {
        const piece = board[row][col];
        if (piece && piece.player === player) {
          const fromPos = { row, col };
          // 修正：暗子用原始位置规则
          let moveType: PieceType;
          if (gameType === 'hidden' && (piece as HiddenPiece).isHidden) {
            moveType = getPieceTypeByPosition((piece as HiddenPiece).originalPosition || fromPos);
          } else {
            moveType = piece.type;
          }
          // 快速找出可能的目标位置
          const potentialMoves = getPotentialMoves(board, fromPos, moveType, player, true, gameType);

          for (const toPos of potentialMoves) {
            // 检查移动是否合法且安全 - AI必须遵循规则，不能自杀
            if (isValidMove(board, fromPos, toPos, gameType) &&  // 添加gameType参数
                isMoveSafeFromCheck(board, fromPos, toPos, player, true, gameType)) {  // AI必须检查是否会导致自己被将军

              movesChecked++;

              // 模拟移动
              const newBoard = makeMove(board, fromPos, toPos, gameType);

              // 优先考虑即时胜利
              if (isImmediateWin(newBoard, toPos, player, opponent, gameType)) {
                console.log(`AI找到了立即获胜的走法: ${moveType} (${fromPos.row},${fromPos.col})->(${toPos.row},${toPos.col})`);
                return { from: fromPos, to: toPos };
              }

              // 提高搜索深度到3，使AI能够考虑更远的后果
              const score = minimax(newBoard, 3, false, -Infinity, Infinity, player, opponent, gameType);

              possibleMoves.push({ from: fromPos, to: toPos, score });

              // 如果已经检查了超过150个走法且已运行超过1.5秒，提前停止
              // 增加计算量确保选出更好的走法
              if (movesChecked > 150 && (Date.now() - startTime) > 1500) {
                console.log(`AI搜索提前停止: 已检查${movesChecked}个走法，耗时${Date.now() - startTime}ms`);
                break;
              }
            }
          }
        }
      }
    }

    // 按分数排序
    possibleMoves.sort((a, b) => b.score - a.score);

    // 计算耗时并记录日志
    const endTime = Date.now();
    const timeSpent = endTime - startTime;

    // 如果没有找到任何可能的移动，返回一个默认移动
    if (possibleMoves.length === 0) {
      console.log('AI没有找到任何可能的移动');
      return { from: { row: 0, col: 0 }, to: { row: 0, col: 0 } };
    }

    // 返回最佳移动
    const bestMove = possibleMoves[0];
    console.log(`AI选择了最佳移动: ${bestMove.from.row},${bestMove.from.col}->${bestMove.to.row},${bestMove.to.col}，分数: ${bestMove.score}，耗时: ${timeSpent}ms`);
    return { from: bestMove.from, to: bestMove.to };
  } finally {
    // 恢复之前的静默模式设置
    GLOBAL_SILENT_MODE = previousSilentMode;
  }
}

// 检查是否是立即获胜的走法
function isImmediateWin(board: Board, movePos: Position, player: Player, opponent: Player, gameType: 'normal' | 'hidden' = 'normal'): boolean {
  // 检查是否吃掉了对方的将/帅
  const targetPiece = board[movePos.row][movePos.col];

  if (targetPiece && targetPiece.type === 'general' && targetPiece.player === opponent) {
    return true;
  }

  // 检查是否将死对方
  return isCheckmate(board, opponent, true, gameType);
}

// 极大极小搜索算法 - 优化版
function minimax(board: Board, depth: number, isMaximizing: boolean, alpha: number, beta: number, currentPlayer: Player, opponent: Player, gameType: 'normal' | 'hidden'): number {
  // 达到搜索深度或游戏结束，评估当前局面
  if (depth === 0) {
    return evaluateBoard(board, currentPlayer, opponent, gameType);
  }

  // 检查终局条件
  if (isCheckmate(board, opponent, true, gameType)) {
    return 100000 + depth * 1000; // 尽快获胜，加上深度因子
  }

  if (isCheckmate(board, currentPlayer, true, gameType)) {
    return -100000 - depth * 1000; // 尽量避免被将死，减去深度因子
  }

  // 为了提高性能，仅考虑最重要的一些移动
  const allMoves: Array<{ fromPos: Position, toPos: Position, score: number }> = [];

  // 快速收集所有可能的移动，并进行初步评估
  const activePlayer = isMaximizing ? currentPlayer : opponent;

  // 遍历棋盘找出所有活跃玩家的棋子
  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      const piece = board[row][col];
      if (piece && piece.player === activePlayer) {
        const fromPos = { row, col };
        // 修正：暗子用原始位置规则
        let moveType: PieceType;
        if (gameType === 'hidden' && (piece as HiddenPiece).isHidden) {
          moveType = getPieceTypeByPosition((piece as HiddenPiece).originalPosition || fromPos);
        } else {
          moveType = piece.type;
        }
        // 获取潜在移动
        const potentialMoves = getPotentialMoves(board, fromPos, moveType, activePlayer, true, gameType);

        for (const toPos of potentialMoves) {
          // 仅检查基本移动规则，加速验证过程
          if (isValidMove(board, fromPos, toPos, gameType)) {  // 使用静默模式
            // 模拟移动并快速评估
            const newBoard = makeMove(board, fromPos, toPos, gameType);
            const quickScore = quickEvaluate(newBoard, piece, toPos, currentPlayer, opponent, isMaximizing, gameType);

            allMoves.push({ fromPos, toPos, score: quickScore });
          }
        }
      }
    }
  }

  // 对移动进行排序，优先考虑更有希望的移动
  allMoves.sort((a, b) => isMaximizing ? b.score - a.score : a.score - b.score);

  // 只考虑前15个最有希望的移动，以提高性能
  // 增加考虑的移动数量提高棋力
  const movesToConsider = allMoves.slice(0, Math.min(15, allMoves.length));

  if (isMaximizing) {
    // AI回合，寻找最大分数
    let maxScore = -Infinity;

    for (const move of movesToConsider) {
      // 检查移动是否安全
      if (isMoveSafeFromCheck(board, move.fromPos, move.toPos, currentPlayer, true, gameType)) {  // 使用静默模式
        // 模拟移动
        const newBoard = makeMove(board, move.fromPos, move.toPos, gameType);

        // 递归计算分数
        const score = minimax(newBoard, depth - 1, false, alpha, beta, currentPlayer, opponent, gameType);
        maxScore = Math.max(maxScore, score);

        // Alpha-Beta剪枝
        alpha = Math.max(alpha, score);
        if (beta <= alpha) {
          break;
        }
      }
    }

    return maxScore === -Infinity ? evaluateBoard(board, currentPlayer, opponent, gameType) : maxScore;
  } else {
    // 对手回合，寻找最小分数
    let minScore = Infinity;

    for (const move of movesToConsider) {
      // 检查移动是否安全
      if (isMoveSafeFromCheck(board, move.fromPos, move.toPos, opponent, true, gameType)) {  // 使用静默模式
        // 模拟移动
        const newBoard = makeMove(board, move.fromPos, move.toPos, gameType);

        // 递归计算分数
        const score = minimax(newBoard, depth - 1, true, alpha, beta, currentPlayer, opponent, gameType);
        minScore = Math.min(minScore, score);

        // Alpha-Beta剪枝
        beta = Math.min(beta, score);
        if (beta <= alpha) {
          break;
        }
      }
    }

    return minScore === Infinity ? evaluateBoard(board, currentPlayer, opponent, gameType) : minScore;
  }
}

// 快速评估函数 - 增强版
function quickEvaluate(board: Board, piece: Piece, movePos: Position, player: Player, opponent: Player, isMaximizing: boolean, gameType: 'normal' | 'hidden' = 'normal'): number {
  // 棋子价值表 - 调整价值以反映高级象棋认知
  const pieceValues: Record<PieceType, number> = {
    'general': 10000,
    'advisor': 200,
    'elephant': 250,
    'horse': 550,  // 提高马的价值
    'chariot': 950, // 提高车的价值
    'cannon': 500,  // 提高炮的价值
    'soldier': 120   // 提高兵的价值
  };

  let score = 0;

  // 揭棋模式特殊处理
  if (gameType === 'hidden') {
    // 如果是暗子，增加探索价值
    if ((piece as HiddenPiece).isHidden) {
      // 基础探索价值
      score += 300;
      
      // 如果这个暗子位置在对方半场，增加探索价值
      const isInOpponentHalf = (player === 'red' && movePos.row < 5) || 
                              (player === 'black' && movePos.row > 4);
      if (isInOpponentHalf) {
        score += 200;
      }

      // 如果这个暗子周围有己方明子，增加探索价值（协同作战）
      const surroundingPieces = getSurroundingPieces(board, movePos);
      const friendlyRevealedPieces = surroundingPieces.filter(p => 
        p && p.player === player && !(p as HiddenPiece).isHidden
      );
      score += friendlyRevealedPieces.length * 100;

      // 如果这个暗子周围有对方明子，增加探索价值（威胁对方）
      const enemyRevealedPieces = surroundingPieces.filter(p => 
        p && p.player === opponent && !(p as HiddenPiece).isHidden
      );
      score += enemyRevealedPieces.length * 150;

      // 如果这个暗子在对方重要棋子附近，增加探索价值
      const nearImportantPieces = isNearImportantPieces(board, movePos, opponent);
      if (nearImportantPieces) {
        score += 250;
      }

      return isMaximizing ? score : -score;
    }
  }

  // 1. 如果能吃子，加分
  const targetPiece = board[movePos.row][movePos.col];
  let targetType = targetPiece ? getEffectivePieceType(targetPiece, { row: movePos.row, col: movePos.col }) : null;
  if (targetPiece) {
    score += pieceValues[targetType!] * 1.2; // 提高吃子价值

    // 如果能吃将/帅，给极高分数
    if (targetType === 'general') {
      return isMaximizing ? 9999 : -9999;
    }
  }

  // 2. 如果是兵/卒过河，加分
  const myType = getEffectivePieceType(piece, movePos);
  if (myType === 'soldier') {
    const hasCrossedRiver = (piece.player === 'red' && movePos.row < 5) ||
                          (piece.player === 'black' && movePos.row > 4);
    if (hasCrossedRiver) {
      score += 70; // 提高过河兵价值
    }
  }

  // 3. 控制中心点和要道
  if ([ 'chariot', 'horse', 'cannon' ].includes(myType)) {
    // 估计中心控制
    const centerScore = 8 - Math.abs(movePos.col - 4) - Math.abs(movePos.row - 4.5);
    score += centerScore * 8; // 提高中心控制价值

    // 额外考虑控制要道
    if (movePos.col === 4) {
      score += 20; // 控制中路要道
    }
  }

  // 4. 增加马、车、炮的机动性奖励
  if (myType === 'horse') {
    // 马靠近中心更灵活
    const mobilityBonus = 6 - (Math.abs(movePos.col - 4) + Math.abs(movePos.row - 4.5)) / 2;
    score += mobilityBonus * 10;
  } else if (myType === 'chariot') {
    // 车在开阔位置更有价值
    score += countOpenLines(board, movePos) * 15;
  } else if (myType === 'cannon') {
    // 炮有潜在的炮架更有价值
    let potentialPawnCount = 0;
    // 检查横向和纵向的潜在炮架
    for (let r = 0; r < BOARD_ROWS; r++) {
      if (board[r][movePos.col] !== null) potentialPawnCount++;
    }
    for (let c = 0; c < BOARD_COLS; c++) {
      if (board[movePos.row][c] !== null) potentialPawnCount++;
    }
    score += potentialPawnCount * 5;
  }

  // 5. 考虑安全性
  if (isPieceEndangered(board, movePos, piece.player, gameType)) {
    score -= pieceValues[myType] / 2; // 如果棋子处于危险中，减分
  }

  return isMaximizing ? score : -score;
}

// 获取周围8个位置的棋子
function getSurroundingPieces(board: Board, pos: Position): (Piece | null)[] {
  const pieces: (Piece | null)[] = [];
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  for (const [dr, dc] of directions) {
    const newRow = pos.row + dr;
    const newCol = pos.col + dc;
    if (newRow >= 0 && newRow < BOARD_ROWS && newCol >= 0 && newCol < BOARD_COLS) {
      pieces.push(board[newRow][newCol]);
    }
  }

  return pieces;
}

// 判断是否在对方重要棋子附近
function isNearImportantPieces(board: Board, pos: Position, opponent: Player): boolean {
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  for (const [dr, dc] of directions) {
    const newRow = pos.row + dr;
    const newCol = pos.col + dc;
    if (newRow >= 0 && newRow < BOARD_ROWS && newCol >= 0 && newCol < BOARD_COLS) {
      const piece = board[newRow][newCol];
      if (piece && piece.player === opponent && !(piece as HiddenPiece).isHidden) {
        // 检查是否是重要棋子（车、马、炮、将）
        if (['chariot', 'horse', 'cannon', 'general'].includes(piece.type)) {
          return true;
        }
      }
    }
  }

  return false;
}

// 获取棋子可能的移动位置，减少遍历整个棋盘
function getPotentialMoves(board: Board, fromPos: Position, pieceType: PieceType, player: Player, silent: boolean = true, gameType: 'normal' | 'hidden' = 'normal'): Position[] {
  const piece = board[fromPos.row][fromPos.col];
  // 如果是暗棋，只能走暗棋第一步规则
  if (piece && (piece as any).isHidden) {
    const moves: Position[] = [];
    for (let row = 0; row < BOARD_ROWS; row++) {
      for (let col = 0; col < BOARD_COLS; col++) {
        const toPos = { row, col };
        if (isValidHiddenPieceFirstMove(board, fromPos, toPos, piece)) {
          moves.push(toPos);
        }
      }
    }
    return moves;
  }
  // ...原有明棋逻辑...
  const moves: Position[] = [];
  const { row, col } = fromPos;

  // 修正：未翻开的暗子，pieceType 必须用 getEffectivePieceType
  let realPieceType = piece ? getEffectivePieceType(piece, fromPos) : pieceType;

  switch (realPieceType) {
    case 'general': // 将/帅只能在九宫格内移动
      // 上下左右四个方向，每次一格
      const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // 右、下、左、上
      directions.forEach(([dr, dc]) => {
        const toRow = row + dr;
        const toCol = col + dc;
        if (isPositionInBoard({ row: toRow, col: toCol }) && isInPalace({ row: toRow, col: toCol }, player)) {
          moves.push({ row: toRow, col: toCol });
        }
      });

      // 添加将帅对面的特殊情况
      const opponent = player === 'red' ? 'black' : 'red';
      const opponentGeneralPos = findGeneral(board, opponent);
      if (opponentGeneralPos && opponentGeneralPos.col === col) {
        // 检查中间是否有障碍物
        let hasObstacle = false;
        const startRow = Math.min(row, opponentGeneralPos.row);
        const endRow = Math.max(row, opponentGeneralPos.row);

        for (let r = startRow + 1; r < endRow; r++) {
          if (board[r][col] !== null) {
            hasObstacle = true;
            break;
          }
        }

        if (!hasObstacle) {
          moves.push(opponentGeneralPos);
        }
      }
      break;

    case 'advisor': // 士/仕只能在九宫格内斜线移动
      // 四个斜向，每次一格
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
        const toRow = row + dr;
        const toCol = col + dc;
        if (isPositionInBoard({ row: toRow, col: toCol }) && isInPalace({ row: toRow, col: toCol }, player)) {
          moves.push({ row: toRow, col: toCol });
        }
      });
      break;

    case 'elephant': // 象/相的田字移动
      // 四个斜向，每次两格
      [[2, 2], [2, -2], [-2, 2], [-2, -2]].forEach(([dr, dc]) => {
        const toRow = row + dr;
        const toCol = col + dc;
        // 添加过河检查：红方象不能过河（不能上到第4行），黑方相不能过河（不能下到第5行）
        const isOverRiver = (player === 'red' && toRow < 5) || (player === 'black' && toRow > 4);
        if (isPositionInBoard({ row: toRow, col: toCol }) && !isOverRiver) {
          // 检查象眼是否被堵住
          const eyeRow = Math.floor((row + toRow) / 2);
          const eyeCol = Math.floor((col + toCol) / 2);
          if (board[eyeRow][eyeCol] === null) {
            moves.push({ row: toRow, col: toCol });
          }
        }
      });
      break;

    case 'horse': // 马走日
      // 八个方向的日字移动
      [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]].forEach(([dr, dc]) => {
        const toRow = row + dr;
        const toCol = col + dc;
        if (isPositionInBoard({ row: toRow, col: toCol })) {
          // 检查马脚是否被绊住
          let legRow = row;
          let legCol = col;

          if (Math.abs(dr) === 1) { // 横向移动2格
            legCol += Math.sign(dc);
          } else { // 纵向移动2格
            legRow += Math.sign(dr);
          }

          if (board[legRow][legCol] === null) {
            moves.push({ row: toRow, col: toCol });
          }
        }
      });
      break;

    case 'chariot': // 车可以横向和纵向移动任意格
      // 横向移动
      for (let c = col + 1; c < BOARD_COLS; c++) {
        moves.push({ row, col: c });
        if (board[row][c] !== null) break; // 遇到棋子停止
      }
      for (let c = col - 1; c >= 0; c--) {
        moves.push({ row, col: c });
        if (board[row][c] !== null) break; // 遇到棋子停止
      }

      // 纵向移动
      for (let r = row + 1; r < BOARD_ROWS; r++) {
        moves.push({ row: r, col });
        if (board[r][col] !== null) break; // 遇到棋子停止
      }
      for (let r = row - 1; r >= 0; r--) {
        moves.push({ row: r, col });
        if (board[r][col] !== null) break; // 遇到棋子停止
      }
      break;

    case 'cannon': // 炮的移动与车类似，但吃子时需要翻山
      // 横向移动
      let hasFoundPiece = false;
      for (let c = col + 1; c < BOARD_COLS; c++) {
        if (!hasFoundPiece && board[row][c] === null) {
          moves.push({ row, col: c }); // 没有隔山，可以走到空位
        } else if (!hasFoundPiece && board[row][c] !== null) {
          hasFoundPiece = true; // 找到第一个棋子
        } else if (hasFoundPiece && board[row][c] !== null) {
          moves.push({ row, col: c }); // 已经有一个棋子作为炮架，可以吃这个棋子
          break;
        }
      }

      hasFoundPiece = false;
      for (let c = col - 1; c >= 0; c--) {
        if (!hasFoundPiece && board[row][c] === null) {
          moves.push({ row, col: c }); // 没有隔山，可以走到空位
        } else if (!hasFoundPiece && board[row][c] !== null) {
          hasFoundPiece = true; // 找到第一个棋子
        } else if (hasFoundPiece && board[row][c] !== null) {
          moves.push({ row, col: c }); // 已经有一个棋子作为炮架，可以吃这个棋子
          break;
        }
      }

      // 纵向移动
      hasFoundPiece = false;
      for (let r = row + 1; r < BOARD_ROWS; r++) {
        if (!hasFoundPiece && board[r][col] === null) {
          moves.push({ row: r, col }); // 没有隔山，可以走到空位
        } else if (!hasFoundPiece && board[r][col] !== null) {
          hasFoundPiece = true; // 找到第一个棋子
        } else if (hasFoundPiece && board[r][col] !== null) {
          moves.push({ row: r, col }); // 已经有一个棋子作为炮架，可以吃这个棋子
          break;
        }
      }

      hasFoundPiece = false;
      for (let r = row - 1; r >= 0; r--) {
        if (!hasFoundPiece && board[r][col] === null) {
          moves.push({ row: r, col }); // 没有隔山，可以走到空位
        } else if (!hasFoundPiece && board[r][col] !== null) {
          hasFoundPiece = true; // 找到第一个棋子
        } else if (hasFoundPiece && board[r][col] !== null) {
          moves.push({ row: r, col }); // 已经有一个棋子作为炮架，可以吃这个棋子
          break;
        }
      }
      break;

    case 'soldier': // 兵/卒向前移动，过河后可以左右移动
      const direction = player === 'red' ? -1 : 1; // 红方向上，黑方向下

      // 前进一格
      const forwardRow = row + direction;
      if (isPositionInBoard({ row: forwardRow, col })) {
        moves.push({ row: forwardRow, col });
      }

      // 判断是否过河
      const hasCrossedRiver = (player === 'red' && row < 5) || (player === 'black' && row > 4);
      if (hasCrossedRiver) {
        // 左右移动
        if (col > 0) moves.push({ row, col: col - 1 });
        if (col < BOARD_COLS - 1) moves.push({ row, col: col + 1 });
      }
      break;
  }

  // 过滤掉目标位置有己方棋子的移动
  return moves.filter(toPos => {
    const targetPiece = board[toPos.row][toPos.col];
    // 修正：未翻开的暗子，pieceType 必须用 getEffectivePieceType
    const useType = piece ? getEffectivePieceType(piece, fromPos) : pieceType;
    return (targetPiece === null || targetPiece.player !== player) && isValidMoveByType(board, fromPos, toPos, useType, player, gameType === 'hidden' ? false : undefined);
  });
}

// 检查棋子是否处于危险中（会被吃掉）
function isPieceEndangered(board: Board, position: Position, player: Player, gameType: 'normal' | 'hidden' = 'normal'): boolean {
  const opponent = player === 'red' ? 'black' : 'red';
  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      const piece = board[row][col];
      if (piece && piece.player === opponent) {
        const fromPos = { row, col };
        // 用原始类型判断威胁
        const pieceType = getEffectivePieceType(piece, fromPos);
        if (isValidMoveByType(board, fromPos, position, pieceType, opponent)) {
          return true;
        }
      }
    }
  }
  return false;
}

// 计算一个位置威胁到的敌方棋子数量
function countThreatenedPieces(board: Board, position: Position, player: Player): number {
  let count = 0;
  const opponent = player === 'red' ? 'black' : 'red';

  // 遍历棋盘寻找敌方棋子
  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      const piece = board[row][col];
      if (piece && piece.player === opponent) {
        // 检查是否可以吃到这个敌方棋子
        const selfPiece = board[position.row][position.col];
        if (selfPiece) {
          const pieceType = getEffectivePieceType(selfPiece, position);
          if (isValidMoveByType(board, position, { row, col }, pieceType, player)) {
            count++;
          }
        }
      }
    }
  }

  return count;
}

// 计算棋子在位置的开放线路数量
function countOpenLines(board: Board, position: Position): number {
  let count = 0;
  const { row, col } = position;

  // 检查上下左右四个方向
  const directions = [
    { dr: -1, dc: 0 }, // 上
    { dr: 1, dc: 0 },  // 下
    { dr: 0, dc: -1 }, // 左
    { dr: 0, dc: 1 }   // 右
  ];

  for (const dir of directions) {
    let openCells = 0;
    let r = row + dir.dr;
    let c = col + dir.dc;

    while (r >= 0 && r < BOARD_ROWS && c >= 0 && c < BOARD_COLS) {
      if (board[r][c] === null) {
        openCells++;
      } else {
        break;
      }
      r += dir.dr;
      c += dir.dc;
    }

    // 如果开放线路较长，加分
    if (openCells >= 2) {
      count++;
    }
  }

  return count;
}

// 检查移动后是否可以将军
function canCheckAfterMove(board: Board, fromPos: Position, toPos: Position, player: Player, opponent: Player): boolean {
  const newBoard = makeMove(board, fromPos, toPos);
  const checkStatus = isInCheck(newBoard, opponent, true);
  return checkStatus.inCheck;
}

// 计算一个位置保护的友方重要棋子数量
function countProtectedPieces(board: Board, position: Position, player: Player): number {
  let count = 0;
  const piece = board[position.row][position.col];
  if (!piece) return 0;
  const myType = getEffectivePieceType(piece, position);

  // 遍历棋盘寻找己方棋子
  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      const targetPiece = board[row][col];
      if (targetPiece && targetPiece.player === player) {
        const targetType = getEffectivePieceType(targetPiece, { row, col });
        if ([ 'general', 'chariot', 'horse' ].includes(targetType)) {
          // 检查是否在保护范围内
          const distance = Math.abs(position.row - row) + Math.abs(position.col - col);
          if (distance <= 2) {
            count++;
          }
        }
      }
    }
  }

  return count;
}

// 评估移动的分数 - 为兼容旧代码保留此函数，但进行优化
function evaluateMove(board: Board, fromPos: Position, toPos: Position, player: Player, opponent: Player, gameType: 'normal' | 'hidden' = 'normal'): number {
  // 模拟移动
  const newBoard = makeMove(board, fromPos, toPos, gameType);

  // 使用更先进的局面评估
  return evaluateBoard(newBoard, player, opponent, gameType);
}

// 评估整个棋盘的分数 - 增强版
function evaluateBoard(board: Board, player: Player, opponent: Player, gameType: 'normal' | 'hidden' = 'normal'): number {
  let score = 0;

  // 检查是否将军或被将军
  const playerInCheck = isInCheck(board, player, true, gameType);
  const opponentInCheck = isInCheck(board, opponent, true, gameType);

  // 如果对手被将死，返回最高分
  if (isCheckmate(board, opponent, true, gameType)) {
    return 100000;
  }

  // 如果自己被将死，返回最低分
  if (isCheckmate(board, player, true, gameType)) {
    return -100000;
  }

  // 基础分 - 棋子价值
  const pieceValues: Record<PieceType, number> = {
    'general': 10000,  // 将/帅
    'advisor': 220,    // 士/仕 - 提高价值
    'elephant': 270,   // 象/相 - 提高价值
    'horse': 600,      // 马 - 显著提高价值
    'chariot': 1000,   // 车 - 显著提高价值
    'cannon': 550,     // 炮 - 提高价值
    'soldier': 130     // 兵/卒 - 提高价值
  };

  // 针对不同阶段的棋子价值调整 - 增强版
  const positionValues: Record<PieceType, number[][]> = {
    'chariot': [
      [14, 14, 12, 18, 16, 18, 12, 14, 14],
      [16, 20, 18, 24, 26, 24, 18, 20, 16],
      [12, 12, 12, 18, 18, 18, 12, 12, 12],
      [12, 18, 16, 22, 22, 22, 16, 18, 12],
      [12, 14, 12, 18, 18, 18, 12, 14, 12],
      [12, 16, 14, 20, 20, 20, 14, 16, 12],
      [6, 10, 8, 14, 14, 14, 8, 10, 6],
      [4, 8, 6, 14, 12, 14, 6, 8, 4],
      [8, 4, 8, 16, 8, 16, 8, 4, 8],
      [6, 8, 6, 14, 12, 14, 6, 8, 6]
    ],
    'horse': [
      [4, 8, 16, 12, 4, 12, 16, 8, 4],
      [4, 10, 28, 16, 8, 16, 28, 10, 4],
      [12, 14, 16, 20, 18, 20, 16, 14, 12],
      [8, 24, 18, 24, 20, 24, 18, 24, 8],
      [6, 16, 14, 18, 16, 18, 14, 16, 6],
      [4, 12, 16, 14, 12, 14, 16, 12, 4],
      [2, 6, 8, 6, 10, 6, 8, 6, 2],
      [4, 2, 8, 8, 4, 8, 8, 2, 4],
      [0, 2, 4, 4, -2, 4, 4, 2, 0],
      [0, -4, 0, 0, 0, 0, 0, -4, 0]
    ],
    'soldier': [
      [0, 3, 6, 9, 12, 9, 6, 3, 0],
      [18, 36, 56, 80, 120, 80, 56, 36, 18],
      [14, 26, 42, 60, 80, 60, 42, 26, 14],
      [10, 20, 30, 34, 40, 34, 30, 20, 10],
      [6, 12, 18, 18, 20, 18, 18, 12, 6],
      [2, 0, 8, 0, 8, 0, 8, 0, 2],
      [0, 0, -2, 0, 4, 0, -2, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    'cannon': [
      [6, 4, 0, -10, -12, -10, 0, 4, 6],
      [2, 2, 0, -4, -14, -4, 0, 2, 2],
      [2, 2, 0, -10, -8, -10, 0, 2, 2],
      [0, 0, -2, 4, 10, 4, -2, 0, 0],
      [0, 0, 0, 2, 8, 2, 0, 0, 0],
      [-2, 0, 4, 2, 6, 2, 4, 0, -2],
      [0, 0, 0, 2, 4, 2, 0, 0, 0],
      [4, 0, 8, 6, 10, 6, 8, 0, 4],
      [0, 2, 4, 6, 6, 6, 4, 2, 0],
      [0, 0, 2, 6, 6, 6, 2, 0, 0]
    ],
    'advisor': [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 20, 0, 20, 0, 0, 0],
      [0, 0, 0, 0, 23, 0, 0, 0, 0],
      [0, 0, 0, 20, 0, 20, 0, 0, 0]
    ],
    'elephant': [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 20, 0, 0, 0, 20, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [18, 0, 0, 0, 25, 0, 0, 0, 18],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 20, 0, 0, 0, 20, 0, 0]
    ],
    'general': [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 3, 1, 0, 0, 0],
      [0, 0, 0, 2, 8, 2, 0, 0, 0],
      [0, 0, 0, 1, 3, 1, 0, 0, 0]
    ]
  };

  // 计算总物质分数和位置分数
  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      const piece = board[row][col];
      if (piece) {
        // 基础物质分数
        const materialValue = pieceValues[piece.type];

        // 位置价值
        let positionValue = 0;
        if (positionValues[piece.type]) {
          // 对于红方，使用正常的位置价值；对于黑方，需要翻转棋盘
          const adjustedRow = piece.player === 'red' ? row : (9 - row);
          const adjustedCol = piece.player === 'red' ? col : (8 - col);
          positionValue = positionValues[piece.type][adjustedRow][adjustedCol];
        }

        // 合计分数
        const totalValue = materialValue + positionValue;

        // 根据棋子所属方加减分
        if (piece.player === player) {
          score += totalValue;

          // 额外评估棋子的活动空间和威胁
          if (piece.type === 'chariot' || piece.type === 'horse' || piece.type === 'cannon') {
            const mobilityScore = countOpenLines(board, { row, col }) * 15;
            score += mobilityScore;

            const threatScore = countThreatenedPieces(board, { row, col }, player) * 25;
            score += threatScore;

            // 额外考虑棋子的保护
            const protectionScore = countProtectedPieces(board, { row, col }, player) * 10;
            score += protectionScore;
          }

          // 如果是兵/卒，鼓励过河和接近底线
          if (piece.type === 'soldier') {
            const hasCrossedRiver = (player === 'red' && row < 5) || (player === 'black' && row > 4);
            if (hasCrossedRiver) {
              score += 70;

              // 接近底线额外加分
              if (player === 'red') {
                score += (5 - row) * 15; // 越接近底线(0)加分越多
              } else {
                score += row * 15; // 越接近底线(9)加分越多
              }
            }

            // 横向延伸的兵更有威胁，加分鼓励横向发展
            const adjacentCols = [col-1, col+1];
            for (const c of adjacentCols) {
              if (c >= 0 && c < BOARD_COLS) {
                const adjacentPiece = board[row][c];
                if (adjacentPiece && adjacentPiece.type === 'soldier' && adjacentPiece.player === player) {
                  score += 20; // 横向连兵加分
                }
              }
            }
          }

          // 士象在九宫中更有价值
          if (piece.type === 'advisor' || piece.type === 'elephant') {
            if (isInPalace({ row, col }, player)) {
              score += 30;
            }
          }
        } else {
          score -= totalValue;

          // 考虑是否威胁对方重要棋子
          if (isPieceEndangered(board, { row, col }, opponent, gameType)) {
            score += materialValue / 1.8; // 威胁对方棋子加分，但减少比例避免过度冒险
          }

          // 考虑对方棋子的控制力
          if (piece.type === 'chariot' || piece.type === 'horse' || piece.type === 'cannon') {
            const opponentMobilityScore = countOpenLines(board, { row, col }) * 12;
            score -= opponentMobilityScore;

            // 如果对方大子没有保护，更容易被吃
            if (countProtectedPieces(board, { row, col }, opponent) === 0) {
              score += 40;
            }
          }
        }
      }
    }
  }

  // 将军加分
  if (opponentInCheck.inCheck) {
    score += 350;

    // 多子将军威力更大
    if (opponentInCheck.checkedBy && opponentInCheck.checkedBy.length > 1) {
      score += 150 * opponentInCheck.checkedBy.length;
    }
  }

  // 被将军减分
  if (playerInCheck.inCheck) {
    score -= 300;

    // 多子将军危险更大
    if (playerInCheck.checkedBy && playerInCheck.checkedBy.length > 1) {
      score -= 150 * playerInCheck.checkedBy.length;
    }
  }

  // 棋子协同作战加分
  score += evaluateCoordination(board, player) * 30;
  score -= evaluateCoordination(board, opponent) * 25;

  return score;
}

// 评估棋子协同作战能力 - 新增函数
function evaluateCoordination(board: Board, player: Player): number {
  let coordinationScore = 0;

  // 检查车马炮的协同
  const majorPieces: { piece: Piece, pos: Position }[] = [];

  // 收集所有大子
  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      const piece = board[row][col];
      if (piece && piece.player === player &&
          (piece.type === 'chariot' || piece.type === 'horse' || piece.type === 'cannon')) {
        majorPieces.push({ piece, pos: { row, col } });
      }
    }
  }

  // 评估大子之间的协同
  for (let i = 0; i < majorPieces.length; i++) {
    for (let j = i + 1; j < majorPieces.length; j++) {
      const p1 = majorPieces[i];
      const p2 = majorPieces[j];

      // 计算两个棋子之间的曼哈顿距离
      const distance = Math.abs(p1.pos.row - p2.pos.row) + Math.abs(p1.pos.col - p2.pos.col);

      // 距离适中的大子协同作战能力更强
      if (distance >= 2 && distance <= 5) {
        coordinationScore++;

        // 车马组合特别强大
        if ((p1.piece.type === 'chariot' && p2.piece.type === 'horse') ||
            (p1.piece.type === 'horse' && p2.piece.type === 'chariot')) {
          coordinationScore += 2;
        }

        // 车炮组合也很强大
        if ((p1.piece.type === 'chariot' && p2.piece.type === 'cannon') ||
            (p1.piece.type === 'cannon' && p2.piece.type === 'chariot')) {
          coordinationScore += 1;
        }
      }
    }
  }

  return coordinationScore;
}

// 添加一个包装函数，完全禁用AI思考过程的日志
export function silentGetAIMove(board: Board, player: Player): { from: Position, to: Position } {
  // 保存所有原始控制台方法
  const originalConsole = { ...console };

  // 保存原始静默模式状态
  const originalSilentMode = GLOBAL_SILENT_MODE;

  // 完全禁用所有控制台输出方法
  try {
    // 彻底屏蔽所有的console方法
    Object.keys(console).forEach(key => {
      // @ts-ignore: 动态修改console对象
      console[key] = () => {};
    });

    // 启用全局静默模式
    GLOBAL_SILENT_MODE = true;

    // 调用原始AI移动函数
    return getAIMove(board, player);
  } finally {
    // 完全恢复原始控制台
    Object.keys(originalConsole).forEach(key => {
      // @ts-ignore: 动态恢复console对象
      console[key] = originalConsole[key];
    });

    // 恢复全局静默模式到原始状态
    GLOBAL_SILENT_MODE = originalSilentMode;
  }
}

// 检查玩家移动是否允许 - 新增函数，让玩家可以自由走棋但AI仍遵循规则
export function isPlayerMoveAllowed(
  board: Board,
  fromPos: Position,
  toPos: Position,
  player: Player,
  isPlayerMove: boolean = true, // 默认为玩家移动
  silent: boolean = false
): boolean {
  // 如果是AI移动，需要检查是否会导致自己被将军
  if (!isPlayerMove) {
    return isMoveSafeFromCheck(board, fromPos, toPos, player, silent);
  }

  // 如果是玩家移动，只检查基本走法是否正确
  return isValidMove(board, fromPos, toPos);
}

// 判断暗棋第一步走法是否合法
function isValidHiddenPieceFirstMove(board: Board, from: Position, to: Position, piece: Piece): boolean {
  const targetPiece = board[to.row][to.col];
  // 不能吃自己的棋子
  if (targetPiece && targetPiece.player === piece.player) return false;

  // 检查位置是否在棋盘内
  if (!isPositionInBoard(to)) return false;

  // 获取原始位置对应的棋子类型
  const originalPos = (piece as HiddenPiece).originalPosition || from;
  const pieceType = getPieceTypeByPosition(originalPos);

  switch (pieceType) {
    case 'soldier':
      // 暗兵第一步只能向前一格
      if (piece.player === 'red') {
        return from.row - to.row === 1 && from.col === to.col;
      } else {
        return to.row - from.row === 1 && from.col === to.col;
      }
    case 'cannon':
      // 暗炮第一步可以水平或垂直移动，吃子时必须跳过一个棋子
      if (from.row === to.row || from.col === to.col) {
        if (!targetPiece) {
          // 不吃子，不能有障碍
          if (from.row === to.row) {
            const minCol = Math.min(from.col, to.col);
            const maxCol = Math.max(from.col, to.col);
            for (let col = minCol + 1; col < maxCol; col++) {
              if (board[from.row][col]) return false;
            }
          } else {
            const minRow = Math.min(from.row, to.row);
            const maxRow = Math.max(from.row, to.row);
            for (let row = minRow + 1; row < maxRow; row++) {
              if (board[row][from.col]) return false;
            }
          }
          return true;
        } else {
          // 吃子，必须正好跳过一个棋子
          let piecesInPath = 0;
          if (from.row === to.row) {
            const minCol = Math.min(from.col, to.col);
            const maxCol = Math.max(from.col, to.col);
            for (let col = minCol + 1; col < maxCol; col++) {
              if (board[from.row][col]) piecesInPath++;
            }
          } else {
            const minRow = Math.min(from.row, to.row);
            const maxRow = Math.max(from.row, to.row);
            for (let row = minRow + 1; row < maxRow; row++) {
              if (board[row][from.col]) piecesInPath++;
            }
          }
          return piecesInPath === 1;
        }
      }
      return false;
    case 'chariot':
      // 暗车第一步可以水平或垂直移动，可以直接吃掉受攻击范围内的任何棋子
      if (from.row === to.row) {
        const minCol = Math.min(from.col, to.col);
        const maxCol = Math.max(from.col, to.col);
        for (let col = minCol + 1; col < maxCol; col++) {
          if (board[from.row][col]) return false;
        }
        return true;
      } else if (from.col === to.col) {
        const minRow = Math.min(from.row, to.row);
        const maxRow = Math.max(from.row, to.row);
        for (let row = minRow + 1; row < maxRow; row++) {
          if (board[row][from.col]) return false;
        }
        return true;
      }
      return false;
    case 'horse':
      // 暗马第一步按日字形移动，不能蹩马腿
      const rowDiff = Math.abs(to.row - from.row);
      const colDiff = Math.abs(to.col - from.col);
      if ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) {
        // 检查蹩马腿
        let blockRow, blockCol;
        if (rowDiff === 2) {
          blockRow = from.row + (to.row > from.row ? 1 : -1);
          blockCol = from.col;
        } else {
          blockRow = from.row;
          blockCol = from.col + (to.col > from.col ? 1 : -1);
        }
        return !board[blockRow][blockCol];
      }
      return false;
    case 'elephant':
      // 暗象第一步按田字形移动，不能塞象眼
      if (Math.abs(to.row - from.row) === 2 && Math.abs(to.col - from.col) === 2) {
        const blockRow = (from.row + to.row) / 2;
        const blockCol = (from.col + to.col) / 2;
        return !board[blockRow][blockCol];
      }
      return false;
    case 'advisor':
      // 暗士第一步限九宫内沿斜线移动
      if (!isInPalace(to, piece.player)) return false;
      return Math.abs(to.row - from.row) === 1 && Math.abs(to.col - from.col) === 1;
    case 'general':
      // 暗将限九宫内移动
      if (!isInPalace(to, piece.player)) return false;
      return (Math.abs(to.row - from.row) === 1 && from.col === to.col) ||
             (Math.abs(to.col - from.col) === 1 && from.row === to.row);
    default:
      return false;
  }
}

// 根据位置判断应该按什么规则走
function getPieceTypeByPosition(pos: Position): PieceType {
  const { row, col } = pos;
  
  // 红方
  if (row >= 7) {
    if (row === 9) {
      if (col === 0 || col === 8) return 'chariot';
      if (col === 1 || col === 7) return 'horse';
      if (col === 2 || col === 6) return 'elephant';
      if (col === 3 || col === 5) return 'advisor';
      if (col === 4) return 'general';
    }
    if (row === 7) {
      if (col === 1 || col === 7) return 'cannon';
    }
    if (row === 6) {
      if (col === 0 || col === 2 || col === 4 || col === 6 || col === 8) return 'soldier';
    }
  }
  
  // 黑方
  if (row <= 2) {
    if (row === 0) {
      if (col === 0 || col === 8) return 'chariot';
      if (col === 1 || col === 7) return 'horse';
      if (col === 2 || col === 6) return 'elephant';
      if (col === 3 || col === 5) return 'advisor';
      if (col === 4) return 'general';
    }
    if (row === 2) {
      if (col === 1 || col === 7) return 'cannon';
    }
    if (row === 3) {
      if (col === 0 || col === 2 || col === 4 || col === 6 || col === 8) return 'soldier';
    }
  }
  
  // 默认返回兵，因为其他位置都是兵
  return 'soldier';
}

// 判断棋子移动是否合法
export function isValidMove(
  board: Board,
  from: Position,
  to: Position,
  gameType: 'normal' | 'hidden' = 'normal'
): boolean {
  // 检查位置是否在棋盘内
  if (!isPositionInBoard(from) || !isPositionInBoard(to)) {
    return false;
  }
  const piece = board[from.row][from.col];
  if (!piece) return false;
  // 揭棋模式的特殊规则
  if (gameType === 'hidden') {
    // 如果是暗子，按照其原始位置对应的棋子规则走
    if ((piece as HiddenPiece).isHidden) {
      const originalPos = (piece as HiddenPiece).originalPosition || from;
      const pieceType = getPieceTypeByPosition(originalPos);
      // 暗子走法不允许象/士过河
      return isValidMoveByType(board, from, to, pieceType, piece.player, false);
    }
    // 如果是明子，允许相（象）和仕（士）过河
    // 修正：明子也用 getEffectivePieceType
    const realType = getEffectivePieceType(piece, from);
    return isValidMoveNormal(board, from, to, realType === 'advisor' || realType === 'elephant');
  }
  // 普通模式的规则
  // 修正：普通模式也用 getEffectivePieceType
  const realType = getEffectivePieceType(piece, from);
  return isValidMoveNormal(board, from, to, realType === 'advisor' || realType === 'elephant');
}

// 辅助函数：获取棋子的有效类型（未翻开的暗子用原始位置规则，否则用真实类型）
function getEffectivePieceType(piece: Piece, pos: Position): PieceType {
  if ((piece as any).isHidden) {
    // @ts-ignore
    const originalPos = (piece as any).originalPosition || pos;
    return getPieceTypeByPosition(originalPos);
  }
  return piece.type;
}