export const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export const ranks = [8, 7, 6, 5, 4, 3, 2, 1] as const;

export type BoardOrientation = 'white' | 'black';

export function getDisplayFiles(orientation: BoardOrientation) {
  return orientation === 'black' ? [...files].reverse() : [...files];
}

export function getDisplayRanks(orientation: BoardOrientation) {
  return orientation === 'black' ? [...ranks].reverse() : [...ranks];
}

export function isLightSquare(file: (typeof files)[number], rank: number) {
  return (files.indexOf(file) + (8 - rank)) % 2 === 0;
}

export function squareToBoardPosition(square: string, orientation: BoardOrientation) {
  const file = square[0] as (typeof files)[number];
  const rank = Number(square[1]);
  const fileIndex = files.indexOf(file);

  if (fileIndex === -1 || Number.isNaN(rank)) {
    return {
      x: 0,
      y: 0,
    };
  }

  if (orientation === 'black') {
    return {
      x: 7 - fileIndex,
      y: rank - 1,
    };
  }

  return {
    x: fileIndex,
    y: 8 - rank,
  };
}

export function squareToWorldPosition(square: string, orientation: BoardOrientation) {
  const { x, y } = squareToBoardPosition(square, orientation);

  return {
    x: x - 3.5,
    z: y - 3.5,
  };
}