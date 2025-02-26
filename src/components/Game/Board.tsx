import React from 'react';
import { Cell } from './Cell';
import { Board as BoardType, Position, COLUMNS, ROWS, WinningLine } from '@/game';

interface BoardProps {
  board: BoardType;
  onMove: (position: Position) => void;
  disabled: boolean;
  lastMove?: Position | null;
  winningLine?: WinningLine | null;
}

export function Board({ board, onMove, disabled, lastMove, winningLine }: BoardProps) {
  const isWinningPiece = (row: number, col: number) => {
    if (!winningLine) return false;
    return winningLine.positions.some(pos => pos.row === row && pos.col === col);
  };

  return (
    <div className="inline-block bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl">
      <div className="flex">
        <div className="w-10" />
        {COLUMNS.map((col) => (
          <div key={col} className="w-10 h-10 flex items-center justify-center font-medium text-gray-600">
            {col}
          </div>
        ))}
      </div>
      <div className="grid gap-0">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            <div className="w-10 h-10 flex items-center justify-center font-medium text-gray-600">
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
                isWinningPiece={isWinningPiece(rowIndex, colIndex)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
