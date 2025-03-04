import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { swipeDirectionToKeyMap } from '@/utils/game2048Utils';
import { useSwipe } from '@/hook/useSwipe';

interface Tile {
  id: string;
  value: number;
  row: number;
  col: number;
  isNew?: boolean;
  isMerged?: boolean;
}

interface Game2048Props {
  onScoreUpdate: (score: number) => void;
  onGameOver: (isOver: boolean) => void;
  onGameWon: (isWon: boolean) => void;
}

const Game2048: React.FC<Game2048Props> = ({ onScoreUpdate, onGameOver, onGameWon }) => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [grid, setGrid] = useState<number[][]>(Array(4).fill(0).map(() => Array(4).fill(0)));
  const [hasWon, setHasWon] = useState(false);

  // Initialize the game
  useEffect(() => {
    startGame();
  }, []);

  const startGame = () => {
    const newGrid = Array(4).fill(0).map(() => Array(4).fill(0));
    const initialTiles: Tile[] = [];

    // Add two initial tiles
    addRandomTile(newGrid, initialTiles);
    addRandomTile(newGrid, initialTiles);

    setGrid(newGrid);
    setTiles(initialTiles);
    setScore(0);
    setHasWon(false);
    onScoreUpdate(0);
    onGameOver(false);
    onGameWon(false);
  };

  const addRandomTile = (currentGrid: number[][], currentTiles: Tile[]) => {
    const emptyCells: [number, number][] = [];

    // Find all empty cells
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (currentGrid[row][col] === 0) {
          emptyCells.push([row, col]);
        }
      }
    }

    if (emptyCells.length > 0) {
      const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const value = Math.random() < 0.9 ? 2 : 4;
      currentGrid[row][col] = value;

      currentTiles.push({
        id: `${row}-${col}-${Date.now()}`,
        value,
        row,
        col,
        isNew: true
      });
    }
  };

  const moveLeft = (currentGrid: number[][], currentTiles: Tile[]) => {
    let moved = false;
    let newScore = score;
    const newGrid = currentGrid.map(row => [...row]);
    const mergedPositions: Set<string> = new Set();

    for (let row = 0; row < 4; row++) {
      for (let col = 1; col < 4; col++) {
        if (newGrid[row][col] !== 0) {
          let newCol = col;

          // Move tile as far left as possible
          while (newCol > 0 && newGrid[row][newCol - 1] === 0) {
            newGrid[row][newCol - 1] = newGrid[row][newCol];
            newGrid[row][newCol] = 0;
            newCol--;
            moved = true;
          }

          // Check if we can merge with the tile to the left
          if (newCol > 0 &&
              newGrid[row][newCol - 1] === newGrid[row][newCol] &&
              !mergedPositions.has(`${row}-${newCol - 1}`)) {
            newGrid[row][newCol - 1] *= 2;
            newGrid[row][newCol] = 0;
            newScore += newGrid[row][newCol - 1];
            mergedPositions.add(`${row}-${newCol - 1}`);
            moved = true;
          }
        }
      }
    }

    // Update tiles based on the new grid
    const newTiles: Tile[] = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (newGrid[row][col] !== 0) {
          newTiles.push({
            id: `${row}-${col}-${Date.now()}`,
            value: newGrid[row][col],
            row,
            col,
            isMerged: mergedPositions.has(`${row}-${col}`)
          });
        }
      }
    }

    return { newGrid, newTiles, newScore, moved };
  };

  const moveRight = (currentGrid: number[][], currentTiles: Tile[]) => {
    let moved = false;
    let newScore = score;
    const newGrid = currentGrid.map(row => [...row]);
    const mergedPositions: Set<string> = new Set();

    for (let row = 0; row < 4; row++) {
      for (let col = 2; col >= 0; col--) {
        if (newGrid[row][col] !== 0) {
          let newCol = col;

          // Move tile as far right as possible
          while (newCol < 3 && newGrid[row][newCol + 1] === 0) {
            newGrid[row][newCol + 1] = newGrid[row][newCol];
            newGrid[row][newCol] = 0;
            newCol++;
            moved = true;
          }

          // Check if we can merge with the tile to the right
          if (newCol < 3 &&
              newGrid[row][newCol + 1] === newGrid[row][newCol] &&
              !mergedPositions.has(`${row}-${newCol + 1}`)) {
            newGrid[row][newCol + 1] *= 2;
            newGrid[row][newCol] = 0;
            newScore += newGrid[row][newCol + 1];
            mergedPositions.add(`${row}-${newCol + 1}`);
            moved = true;
          }
        }
      }
    }

    // Update tiles based on the new grid
    const newTiles: Tile[] = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (newGrid[row][col] !== 0) {
          newTiles.push({
            id: `${row}-${col}-${Date.now()}`,
            value: newGrid[row][col],
            row,
            col,
            isMerged: mergedPositions.has(`${row}-${col}`)
          });
        }
      }
    }

    return { newGrid, newTiles, newScore, moved };
  };

  const moveUp = (currentGrid: number[][], currentTiles: Tile[]) => {
    let moved = false;
    let newScore = score;
    const newGrid = currentGrid.map(row => [...row]);
    const mergedPositions: Set<string> = new Set();

    for (let col = 0; col < 4; col++) {
      for (let row = 1; row < 4; row++) {
        if (newGrid[row][col] !== 0) {
          let newRow = row;

          // Move tile as far up as possible
          while (newRow > 0 && newGrid[newRow - 1][col] === 0) {
            newGrid[newRow - 1][col] = newGrid[newRow][col];
            newGrid[newRow][col] = 0;
            newRow--;
            moved = true;
          }

          // Check if we can merge with the tile above
          if (newRow > 0 &&
              newGrid[newRow - 1][col] === newGrid[newRow][col] &&
              !mergedPositions.has(`${newRow - 1}-${col}`)) {
            newGrid[newRow - 1][col] *= 2;
            newGrid[newRow][col] = 0;
            newScore += newGrid[newRow - 1][col];
            mergedPositions.add(`${newRow - 1}-${col}`);
            moved = true;
          }
        }
      }
    }

    // Update tiles based on the new grid
    const newTiles: Tile[] = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (newGrid[row][col] !== 0) {
          newTiles.push({
            id: `${row}-${col}-${Date.now()}`,
            value: newGrid[row][col],
            row,
            col,
            isMerged: mergedPositions.has(`${row}-${col}`)
          });
        }
      }
    }

    return { newGrid, newTiles, newScore, moved };
  };

  const moveDown = (currentGrid: number[][], currentTiles: Tile[]) => {
    let moved = false;
    let newScore = score;
    const newGrid = currentGrid.map(row => [...row]);
    const mergedPositions: Set<string> = new Set();

    for (let col = 0; col < 4; col++) {
      for (let row = 2; row >= 0; row--) {
        if (newGrid[row][col] !== 0) {
          let newRow = row;

          // Move tile as far down as possible
          while (newRow < 3 && newGrid[newRow + 1][col] === 0) {
            newGrid[newRow + 1][col] = newGrid[newRow][col];
            newGrid[newRow][col] = 0;
            newRow++;
            moved = true;
          }

          // Check if we can merge with the tile below
          if (newRow < 3 &&
              newGrid[newRow + 1][col] === newGrid[newRow][col] &&
              !mergedPositions.has(`${newRow + 1}-${col}`)) {
            newGrid[newRow + 1][col] *= 2;
            newGrid[newRow][col] = 0;
            newScore += newGrid[newRow + 1][col];
            mergedPositions.add(`${newRow + 1}-${col}`);
            moved = true;
          }
        }
      }
    }

    // Update tiles based on the new grid
    const newTiles: Tile[] = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (newGrid[row][col] !== 0) {
          newTiles.push({
            id: `${row}-${col}-${Date.now()}`,
            value: newGrid[row][col],
            row,
            col,
            isMerged: mergedPositions.has(`${row}-${col}`)
          });
        }
      }
    }

    return { newGrid, newTiles, newScore, moved };
  };

  const checkForGameOver = (currentGrid: number[][]) => {
    // Check if there are any empty cells
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (currentGrid[row][col] === 0) {
          return false;
        }
      }
    }

    // Check if there are any possible merges
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const value = currentGrid[row][col];

        // Check right
        if (col < 3 && currentGrid[row][col + 1] === value) {
          return false;
        }

        // Check down
        if (row < 3 && currentGrid[row + 1][col] === value) {
          return false;
        }
      }
    }

    return true;
  };

  const checkForWin = (currentGrid: number[][]) => {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (currentGrid[row][col] === 2048) {
          return true;
        }
      }
    }
    return false;
  };

  const handleMove = useCallback((direction: string) => {
    let result;

    switch (direction) {
      case 'ArrowLeft':
        result = moveLeft(grid, tiles);
        break;
      case 'ArrowRight':
        result = moveRight(grid, tiles);
        break;
      case 'ArrowUp':
        result = moveUp(grid, tiles);
        break;
      case 'ArrowDown':
        result = moveDown(grid, tiles);
        break;
      default:
        return;
    }

    if (result.moved) {
      const { newGrid, newTiles, newScore } = result;

      // Add a new random tile
      addRandomTile(newGrid, newTiles);

      setGrid(newGrid);
      setTiles(newTiles);
      setScore(newScore);
      onScoreUpdate(newScore);

      // Check for win
      if (!hasWon && checkForWin(newGrid)) {
        setHasWon(true);
        onGameWon(true);
      }

      // Check for game over
      if (checkForGameOver(newGrid)) {
        onGameOver(true);
      }
    }
  }, [grid, tiles, score, hasWon, onScoreUpdate, onGameOver, onGameWon]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        handleMove(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleMove]);

  // Handle touch events
  const { ref } = useSwipe((direction) => {
    const key = swipeDirectionToKeyMap[direction];
    if (key) {
      handleMove(key);
    }
  });

  // Get tile background color based on value
  const getTileColor = (value: number) => {
    const colors: Record<number, string> = {
      2: 'bg-amber-100',
      4: 'bg-amber-200',
      8: 'bg-orange-300',
      16: 'bg-orange-400',
      32: 'bg-orange-500',
      64: 'bg-orange-600',
      128: 'bg-yellow-300',
      256: 'bg-yellow-400',
      512: 'bg-yellow-500',
      1024: 'bg-yellow-600',
      2048: 'bg-yellow-700',
    };
    return colors[value] || 'bg-yellow-800';
  };

  // Get tile text color based on value
  const getTextColor = (value: number) => {
    return value <= 4 ? 'text-gray-700' : 'text-white';
  };

  // Get font size based on value length
  const getFontSize = (value: number) => {
    const valueStr = value.toString();
    if (valueStr.length <= 1) return 'text-4xl';
    if (valueStr.length === 2) return 'text-3xl';
    if (valueStr.length === 3) return 'text-2xl';
    return 'text-xl';
  };

  return (
    <div
      ref={ref}
      className="relative bg-amber-300 rounded-lg p-2 sm:p-4 shadow-lg"
      style={{
        aspectRatio: '1/1',
        maxWidth: '500px',
        margin: '0 auto'
      }}
    >
      {/* Grid background */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 h-full w-full">
        {Array(16).fill(0).map((_, index) => (
          <div
            key={index}
            className="bg-amber-400 rounded-md"
          />
        ))}
      </div>

      {/* Tiles */}
      <div className="absolute inset-0 p-2 sm:p-4">
        <div className="relative h-full w-full">
          <AnimatePresence>
            {tiles.map((tile) => (
              <motion.div
                key={tile.id}
                initial={{ scale: tile.isNew ? 0 : 1 }}
                animate={{
                  scale: 1,
                  x: `calc(${tile.col * 100}% + ${tile.col * 8}px)`,
                  y: `calc(${tile.row * 100}% + ${tile.row * 8}px)`,
                }}
                exit={{ scale: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
                className={`absolute flex items-center justify-center rounded-md
                  ${getTileColor(tile.value)} ${getTextColor(tile.value)}
                  font-bold w-[calc(25%-6px)] h-[calc(25%-6px)]`}
              >
                {tile.isMerged && (
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1.1 }}
                    transition={{ duration: 0.1 }}
                    className={`${getFontSize(tile.value)}`}
                  >
                    {tile.value}
                  </motion.div>
                )}
                {!tile.isMerged && (
                  <div className={`${getFontSize(tile.value)}`}>
                    {tile.value}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Game2048;
