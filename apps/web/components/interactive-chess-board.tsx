'use client';

import { useMemo, useState } from 'react';

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

type LegalTarget = {
  to: string;
  isCapture: boolean;
};

export function InteractiveChessBoard({
  frame,
  activeColor,
  orientation = 'white',
  selectedSquare,
  legalTargets,
  disabled,
  onSquareActivate,
  onMoveAttempt,
}: {
  frame: BoardFrame;
  activeColor: 'white' | 'black';
  orientation?: 'white' | 'black';
  selectedSquare: string | null;
  legalTargets: LegalTarget[];
  disabled?: boolean;
  onSquareActivate: (square: string) => void;
  onMoveAttempt: (from: string, to: string) => void;
}) {
  const [draggedSquare, setDraggedSquare] = useState<string | null>(null);

  const pieceBySquare = useMemo(
    () => new Map(frame.pieces.map((piece) => [piece.square, piece])),
    [frame.pieces]
  );
  const highlightSquares = new Set(frame.highlightSquares ?? []);
  const legalTargetSet = new Set(legalTargets.map((target) => target.to));
  const captureTargetSet = new Set(
    legalTargets.filter((target) => target.isCapture).map((target) => target.to)
  );
  const displayFiles = orientation === 'black' ? [...files].reverse() : [...files];
  const displayRanks = orientation === 'black' ? [...ranks].reverse() : [...ranks];

  return (
    <div className="board-panel">
      <div className="board-grid interactive">
        <div className="board-squares interactive">
          {displayRanks.flatMap((rank, rankIndex) =>
            displayFiles.map((file, fileIndex) => {
              const square = `${file}${rank}`;
              const piece = pieceBySquare.get(square);
              const isLightSquare = (files.indexOf(file) + (8 - rank)) % 2 === 0;
              const isSelected = selectedSquare === square;
              const isLegalTarget = legalTargetSet.has(square);
              const isCaptureTarget = captureTargetSet.has(square);
              const isHighlighted = highlightSquares.has(square);
              const isOwnPiece = piece?.color === activeColor;

              return (
                <button
                  key={square}
                  type="button"
                  className={[
                    'board-cell',
                    isLightSquare ? 'light' : 'dark',
                    isSelected ? 'selected' : '',
                    isHighlighted ? 'history' : '',
                    draggedSquare === square ? 'drag-source' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => {
                    if (!disabled) {
                      onSquareActivate(square);
                    }
                  }}
                  onDragOver={(event) => {
                    if (!disabled && draggedSquare) {
                      event.preventDefault();
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault();

                    if (!disabled && draggedSquare) {
                      onMoveAttempt(draggedSquare, square);
                      setDraggedSquare(null);
                    }
                  }}
                  aria-label={`${square}${piece ? ` ${piece.color} ${piece.kind}` : ''}`}
                >
                  {isLegalTarget ? (
                    <span className={`board-target ${isCaptureTarget ? 'capture' : ''}`} />
                  ) : null}

                  {piece ? (
                    <span
                      className={`board-piece-glyph ${piece.color} ${isOwnPiece && !disabled ? 'interactive' : ''}`}
                      draggable={Boolean(isOwnPiece && !disabled)}
                      onDragStart={(event) => {
                        if (!isOwnPiece || disabled) {
                          event.preventDefault();
                          return;
                        }

                        event.dataTransfer.setData('text/plain', square);
                        event.dataTransfer.effectAllowed = 'move';
                        setDraggedSquare(square);
                        onSquareActivate(square);
                      }}
                      onDragEnd={() => {
                        setDraggedSquare(null);
                      }}
                    >
                      {pieceGlyphs[piece.color][piece.kind]}
                    </span>
                  ) : null}

                  {fileIndex === 0 ? <span className="board-rank-label">{rank}</span> : null}
                  {rankIndex === displayRanks.length - 1 ? <span className="board-file-label">{file}</span> : null}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}