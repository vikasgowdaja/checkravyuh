'use client';

import dynamic from 'next/dynamic';

import type { BoardFrame } from '../lib/api';
import { getDisplayFiles, getDisplayRanks, type BoardOrientation } from '../lib/board-view';

const BoardScene3D = dynamic(
  () => import('./board-scene-3d').then((module) => module.BoardScene3D),
  {
    ssr: false,
    loading: () => <div className="board-canvas board-canvas-fallback" aria-hidden="true" />,
  }
);

export function ChessBoard({
  frame,
  orientation = 'white',
}: {
  frame: BoardFrame;
  orientation?: BoardOrientation;
}) {
  const displayFiles = getDisplayFiles(orientation);
  const displayRanks = getDisplayRanks(orientation);

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