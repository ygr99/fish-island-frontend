import React from 'react';
import {CellValue, Position} from '@/game';

interface CellProps {
  value: CellValue;
  onClick: () => void;
  isDisabled: boolean;
  isLastMove?: boolean;
  isWinningPiece?: boolean;
  position: Position;
}

export function Cell({value, onClick, isDisabled, isLastMove, isWinningPiece, position}: CellProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-10 h-10 border border-amber-200
        relative flex items-center justify-center
        ${!value && !isDisabled ? 'hover:bg-amber-100' : ''}
        transition-colors
        ${value ? 'cursor-default' : isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {value && (
        <div
          className={`
            w-8 h-8 rounded-full relative
            ${value === 'black'
            ? 'bg-gray-900 shadow-lg'
            : 'bg-white border-2 border-gray-900 shadow-md'
          }
            transform transition-transform
            ${value === 'black' ? 'hover:scale-105' : 'hover:scale-105'}
            ${isWinningPiece ? 'ring-2 ring-red-500 ring-offset-2 animate-pulse' : ''}
          `}
        >
          {isLastMove && (
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500"/>
          )}
        </div>
      )}
    </button>
  );
}
