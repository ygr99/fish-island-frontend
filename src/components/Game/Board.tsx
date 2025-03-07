import React, { useRef, useEffect, useState } from 'react';
import { Cell } from './Cell';
import { Board as BoardType, Position, COLUMNS, ROWS, WinningLine } from '@/game';
import { BOARD_SIZE } from '@/utils/gameLogic';

interface BoardProps {
  board: BoardType;
  onMove: (position: Position) => void;
  disabled: boolean;
  lastMove?: Position | null;
  opponentLastMove?: Position | null;
  winningLine?: WinningLine | null;
}

export function Board({ board, onMove, disabled, lastMove, opponentLastMove, winningLine }: BoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(40);

  useEffect(() => {
    const calculateCellSize = () => {
      if (!boardRef.current) return;

      // Get the parent container width
      const containerWidth = boardRef.current.parentElement?.clientWidth || 600;

      // Calculate available space for the board
      // Subtract padding (2 * 16px) and coordinate labels space (40px)
      const availableSpace = containerWidth - 32 - 40;

      // Calculate cell size based on available space and board size (15x15)
      const newCellSize = Math.floor(availableSpace / BOARD_SIZE);

      setCellSize(newCellSize);
    };

    calculateCellSize();
    window.addEventListener('resize', calculateCellSize);

    return () => window.removeEventListener('resize', calculateCellSize);
  }, []);

  const isWinningPiece = (row: number, col: number) => {
    if (!winningLine) return false;
    return winningLine.positions.some(pos => pos.row === row && pos.col === col);
  };

  const labelSize = cellSize;

  return (
    <div ref={boardRef} className="inline-block bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl">
      <div className="flex">
        <div style={{ width: labelSize }} />
        {COLUMNS.map((col) => (
          <div
            key={col}
            style={{ width: cellSize, height: labelSize }}
            className="flex items-center justify-center font-medium text-gray-600 text-sm"
          >
            {col}
          </div>
        ))}
      </div>
      <div className="grid gap-0">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            <div
              style={{ width: labelSize, height: cellSize }}
              className="flex items-center justify-center font-medium text-gray-600 text-sm"
            >
              {ROWS[rowIndex]}
            </div>
            {row.map((cell, colIndex) => (
              <Cell
                key={`${rowIndex}-${colIndex}`}
                value={cell}
                position={{ row: rowIndex, col: colIndex }}
                onClick={() => {
                  if (!disabled && !cell) {
                    onMove({ row: rowIndex, col: colIndex });
                  }
                }}
                isDisabled={disabled}
                isLastMove={lastMove?.row === rowIndex && lastMove?.col === colIndex}
                isOpponentLastMove={opponentLastMove?.row === rowIndex && opponentLastMove?.col === colIndex}
                isWinningPiece={isWinningPiece(rowIndex, colIndex)}
                size={cellSize}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
