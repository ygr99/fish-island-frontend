import { Piece, PIECE_NAMES } from '@/gameChineseChess';

interface ChessPieceProps {
  piece: Piece;
  size: number;
  isSelected?: boolean;
  isStartPosition?: boolean;
}

export function ChessPiece({
  piece,
  size,
  isSelected = false,
  isStartPosition = false,
}: ChessPieceProps) {
  const { type, player, isHidden } = piece;

  // 暗棋的样式
  if (isHidden) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-full transition-all duration-300 ${
          isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
        }`}
        style={{
          width: size,
          height: size,
          backgroundColor: '#e5e7eb',
          border: '2px solid #9ca3af',
          boxShadow: isSelected ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : 'none',
        }}
      >
        <span className="text-gray-600 font-medium">暗</span>
      </div>
    );
  }

  // 明棋的样式
  return (
    <div
      className={`relative flex items-center justify-center rounded-full transition-all duration-300 ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      }`}
      style={{
        width: size,
        height: size,
        backgroundColor: player === 'red' ? '#fee2e2' : '#e5e7eb',
        border: `2px solid ${player === 'red' ? '#dc2626' : '#000000'}`,
        boxShadow: isSelected ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : 'none',
      }}
    >
      <span
        className="text-lg font-bold"
        style={{ color: player === 'red' ? '#dc2626' : '#000000' }}
      >
        {PIECE_NAMES[player][type]}
      </span>
    </div>
  );
}
