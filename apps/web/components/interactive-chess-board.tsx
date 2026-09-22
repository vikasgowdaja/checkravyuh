'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';

import type { BoardFrame } from '../lib/api';
import { getDisplayFiles, getDisplayRanks, type BoardOrientation } from '../lib/board-view';

type LegalTarget = {
  to: string;
  isCapture: boolean;
};

const BoardScene3D = dynamic(
  () => import('./board-scene-3d').then((module) => module.BoardScene3D),
  {
    ssr: false,
    loading: () => <div className="board-canvas board-canvas-fallback" aria-hidden="true" />,
  }
);

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
  orientation?: BoardOrientation;
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
  const displayFiles = getDisplayFiles(orientation);
  const displayRanks = getDisplayRanks(orientation);

  return (
    <div className="board-panel">
      <div className="board-grid board-grid-3d interactive">
        <BoardScene3D
          frame={frame}
          orientation={orientation}
          selectedSquare={selectedSquare}
          legalTargets={legalTargets}
        />

        <div className="board-squares board-squares-overlay interactive">
          {displayRanks.flatMap((rank, rankIndex) =>
            displayFiles.map((file, fileIndex) => {
              const square = `${file}${rank}`;
              const piece = pieceBySquare.get(square);
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

                  {piece && isOwnPiece && !disabled ? (
                    <span
                      className="board-drag-handle"
                      draggable
                      aria-hidden="true"
                      onDragStart={(event) => {
                        event.dataTransfer.setData('text/plain', square);
                        event.dataTransfer.effectAllowed = 'move';
                        setDraggedSquare(square);
                        onSquareActivate(square);
                      }}
                      onDragEnd={() => {
                        setDraggedSquare(null);
                      }}
                    />
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