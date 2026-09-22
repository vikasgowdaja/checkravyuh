'use client';

import dynamic from 'next/dynamic';

import type { BoardFrame, BoardPiece } from '../lib/api';
import type { BoardRenderMode } from '../lib/board-render-mode';
import {
  getDisplayFiles,
  getDisplayRanks,
  squareToBoardPosition,
  type BoardOrientation,
} from '../lib/board-view';

const BoardScene3D = dynamic(
  () => import('./board-scene-3d').then((module) => module.BoardScene3D),
  {
    ssr: false,
    loading: () => <div className="board-canvas board-canvas-fallback" aria-hidden="true" />,
  }
);

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

export function ChessBoard({
  frame,
  orientation = 'white',
  renderMode = '2d',
}: {
  frame: BoardFrame;
  orientation?: BoardOrientation;
  renderMode?: BoardRenderMode;
}) {
  const displayFiles = getDisplayFiles(orientation);
  const displayRanks = getDisplayRanks(orientation);

  if (renderMode === '2d') {
    return (
      <div className="board-panel">
        <div className="board-grid">
          <div className="board-squares">
            {displayRanks.flatMap((rank, rankIndex) =>
              displayFiles.map((file, fileIndex) => {
                const isLightSquare = (file.charCodeAt(0) - 97 + (8 - rank)) % 2 === 0;

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

  return (
    <div className="board-panel">
      <div className="board-grid board-grid-3d">
        <BoardScene3D frame={frame} orientation={orientation} />

        <div className="board-label-grid" aria-hidden="true">
          {displayRanks.flatMap((rank, rankIndex) =>
            displayFiles.map((file, fileIndex) => {
              return (
                <div key={`${file}-${rank}`} className="board-label-cell">
                  {fileIndex === 0 ? <span className="board-rank-label">{rank}</span> : null}
                  {rankIndex === displayRanks.length - 1 ? <span className="board-file-label">{file}</span> : null}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}