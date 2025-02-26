export type Player = 'black' | 'white';
export type CellValue = Player | null;
export type Board = CellValue[][];

export interface Position {
  row: number;
  col: number;
}

export interface Move extends Position {
  player: Player;
  number: number;
}

export const COLUMNS = Array.from({ length: 15 }, (_, i) => String.fromCharCode(65 + i));
export const ROWS = Array.from({ length: 15 }, (_, i) => (15 - i).toString());

export interface WinningLine {
  positions: Position[];
  player: Player;
}