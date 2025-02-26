import { Board, Player, Position, WinningLine } from '@/game';

export const BOARD_SIZE = 15;

export function createEmptyBoard(): Board {
  return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
}

export function checkWin(board: Board, lastMove: Position, player: Player): WinningLine | null {
  const directions = [
    [1, 0],   // horizontal
    [0, 1],   // vertical
    [1, 1],   // diagonal
    [1, -1],  // anti-diagonal
  ];

  for (const [dx, dy] of directions) {
    let positions: Position[] = [lastMove];

    // Check forward direction
    for (let i = 1; i < 5; i++) {
      const row = lastMove.row + dx * i;
      const col = lastMove.col + dy * i;
      if (!isValidPosition(row, col) || board[row][col] !== player) break;
      positions.push({ row, col });
    }

    // Check backward direction
    for (let i = 1; i < 5; i++) {
      const row = lastMove.row - dx * i;
      const col = lastMove.col - dy * i;
      if (!isValidPosition(row, col) || board[row][col] !== player) break;
      positions.push({ row, col });
    }

    if (positions.length >= 5) {
      return {
        positions: positions.slice(0, 5),
        player
      };
    }
  }

  return null;
}

export function isValidPosition(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

interface Pattern {
  own: number;
  empty: number;
  opponent: number;
  score: number;
}

const THREAT_PATTERNS: Pattern[] = [
  { own: 4, empty: 1, opponent: 0, score: 100000 },  // Win in one move
  { own: 3, empty: 2, opponent: 0, score: 10000 },   // Open four
  { own: 2, empty: 3, opponent: 0, score: 1000 },    // Open three
  { own: 1, empty: 4, opponent: 0, score: 100 },     // Open two
  { own: 3, empty: 1, opponent: 1, score: 900 },     // Blocked four
  { own: 2, empty: 2, opponent: 1, score: 400 },     // Blocked three
  { own: 1, empty: 3, opponent: 1, score: 50 },      // Blocked two
];

function evaluateDirection(board: Board, pos: Position, dx: number, dy: number, player: Player): number {
  let score = 0;
  const opponent = player === 'black' ? 'white' : 'black';

  for (let start = -4; start <= 0; start++) {
    let ownCount = 0;
    let emptyCount = 0;
    let oppCount = 0;

    for (let i = 0; i < 5; i++) {
      const row = pos.row + (start + i) * dx;
      const col = pos.col + (start + i) * dy;

      if (!isValidPosition(row, col)) {
        oppCount++;
        continue;
      }

      const cell = board[row][col];
      if (cell === player) ownCount++;
      else if (cell === opponent) oppCount++;
      else emptyCount++;
    }

    for (const pattern of THREAT_PATTERNS) {
      if (ownCount === pattern.own &&
          emptyCount === pattern.empty &&
          oppCount === pattern.opponent) {
        score += pattern.score;
        break;
      }
    }

    if (ownCount >= 2 && emptyCount >= 2) {
      score += Math.pow(ownCount, 2) * 10;
    }
  }

  return score;
}

function evaluatePosition(board: Board, pos: Position, player: Player): number {
  if (board[pos.row][pos.col] !== null) return -1;

  const directions = [
    [1, 0],   // horizontal
    [0, 1],   // vertical
    [1, 1],   // diagonal
    [1, -1],  // anti-diagonal
  ];

  let totalScore = 0;

  const centerDist = Math.abs(pos.row - BOARD_SIZE/2) + Math.abs(pos.col - BOARD_SIZE/2);
  totalScore += (BOARD_SIZE - centerDist) * 3;

  for (const [dx, dy] of directions) {
    const dirScore = evaluateDirection(board, pos, dx, dy, player);
    totalScore += dirScore;

    const oppScore = evaluateDirection(board, pos, dx, dy, player === 'black' ? 'white' : 'black');
    if (oppScore >= 1000) {
      totalScore += oppScore * 1.2;
    }
  }

  let localPieces = 0;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      const row = pos.row + dx;
      const col = pos.col + dy;
      if (isValidPosition(row, col) && board[row][col] !== null) {
        localPieces++;
      }
    }
  }
  totalScore += localPieces * 50;

  return totalScore;
}

function simulateMove(board: Board, pos: Position, player: Player): Board {
  const newBoard = board.map(row => [...row]);
  newBoard[pos.row][pos.col] = player;
  return newBoard;
}

export function getAIMove(board: Board): Position {
  const player: Player = 'white';
  let bestScore = -1;
  let bestMoves: Position[] = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === null) {
        const pos = { row, col };
        const simBoard = simulateMove(board, pos, player);
        if (checkWin(simBoard, pos, player)) {
          return pos;
        }
      }
    }
  }

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === null) {
        const pos = { row, col };
        const score = evaluatePosition(board, pos, player);

        if (score > bestScore) {
          bestScore = score;
          bestMoves = [pos];
        } else if (score === bestScore) {
          bestMoves.push(pos);
        }
      }
    }
  }

  if (bestMoves.length > 1) {
    bestMoves.sort((a, b) => {
      const distA = Math.abs(a.row - BOARD_SIZE/2) + Math.abs(a.col - BOARD_SIZE/2);
      const distB = Math.abs(b.row - BOARD_SIZE/2) + Math.abs(b.col - BOARD_SIZE/2);
      return distA - distB;
    });
    const topN = Math.min(3, bestMoves.length);
    return bestMoves[Math.floor(Math.random() * topN)];
  }

  return bestMoves[0];
}
