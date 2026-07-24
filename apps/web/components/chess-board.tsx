'use client';

import type { BoardFrame, BoardPiece } from '../lib/api';

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
const ranks = [8, 7, 6, 5, 4, 3, 2, 1] as const;

const pieceGlyphs: Record<BoardPiece['color'], Record<BoardPiece['kind'], string>> = {
  white: {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙',
  },
  black: {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟',
  },
};

function squareToBoardPosition(square: string, orientation: 'white' | 'black') {
  const file = square[0];
  const rank = Number(square[1]);
  const fileIndex = files.indexOf(file as (typeof files)[number]);

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

export function ChessBoard({
  frame,
  orientation = 'white',
}: {
  frame: BoardFrame;
  orientation?: 'white' | 'black';
}) {
  const displayFiles = orientation === 'black' ? [...files].reverse() : [...files];
  const displayRanks = orientation === 'black' ? [...ranks].reverse() : [...ranks];

  return (
    <div className="board-panel">
      <div className="board-grid">
        <div className="board-squares">
          {displayRanks.flatMap((rank, rankIndex) =>
            displayFiles.map((file, fileIndex) => {
              const isLightSquare = (files.indexOf(file) + (8 - rank)) % 2 === 0;

              return (
                <div
                  key={`${file}-${rank}`}
                  className={`board-square ${isLightSquare ? 'light' : 'dark'}`}
                >
                  {fileIndex === 0 ? <span className="board-rank-label">{rank}</span> : null}
                  {rankIndex === displayRanks.length - 1 ? <span className="board-file-label">{file}</span> : null}
                </div>
              );
            })
          )}
        </div>

        {(frame.highlightSquares ?? []).map((square) => {
          const { x, y } = squareToBoardPosition(square, orientation);

          return (
            <div
              key={square}
              className="board-highlight"
              style={{ transform: `translate(${x * 100}%, ${y * 100}%)` }}
            />
          );
        })}

        {frame.pieces.map((piece) => {
          const { x, y } = squareToBoardPosition(piece.square, orientation);

          return (
            <div
              key={piece.id}
              className={`board-piece ${piece.color}`}
              style={{ transform: `translate(${x * 100}%, ${y * 100}%)` }}
            >
              {pieceGlyphs[piece.color][piece.kind]}
            </div>
          );
        })}
      </div>
    </div>
  );
}