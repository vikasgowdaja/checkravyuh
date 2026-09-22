'use client';

import { useMemo, useState } from 'react';

import { ChessBoard } from './chess-board';
import type { BoardFrame } from '../lib/api';
import type { BoardRenderMode } from '../lib/board-render-mode';
import {
  getDisplayFiles,
  getDisplayRanks,
  squareToBoardPosition,
  type BoardOrientation,
} from '../lib/board-view';
import type { BoardDrawing } from '../lib/analysis';

type DrawTool = 'arrow' | 'highlight';

type AnalysisBoardSurfaceProps = {
  frame: BoardFrame;
  orientation: BoardOrientation;
  renderMode: BoardRenderMode;
  drawing: BoardDrawing;
  drawTool: DrawTool;
  onToggleHighlight: (square: string) => void;
  onAddArrow: (from: string, to: string) => void;
};

function squareCenterPercent(square: string, orientation: BoardOrientation) {
  const { x, y } = squareToBoardPosition(square, orientation);

  return {
    x: (x + 0.5) * 12.5,
    y: (y + 0.5) * 12.5,
  };
}

export function AnalysisBoardSurface({
  frame,
  orientation,
  renderMode,
  drawing,
  drawTool,
  onToggleHighlight,
  onAddArrow,
}: AnalysisBoardSurfaceProps) {
  const displayFiles = getDisplayFiles(orientation);
  const displayRanks = getDisplayRanks(orientation);
  const [arrowStart, setArrowStart] = useState<string | null>(null);
  const [dragArrowStart, setDragArrowStart] = useState<string | null>(null);

  const squareList = useMemo(
    () => displayRanks.flatMap((rank) => displayFiles.map((file) => `${file}${rank}`)),
    [displayFiles, displayRanks]
  );

  return (
    <div className="analysis-board-surface">
      <ChessBoard frame={frame} orientation={orientation} renderMode={renderMode} />

      <svg className="analysis-drawing-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {drawing.highlights.map((highlight) => {
          const { x, y } = squareCenterPercent(highlight.square, orientation);

          return (
            <rect
              key={`${highlight.square}-${highlight.color}`}
              x={x - 6.25}
              y={y - 6.25}
              width={12.5}
              height={12.5}
              className={`analysis-square-highlight ${highlight.color}`}
              rx={2.4}
            />
          );
        })}

        {drawing.arrows.map((arrow, index) => {
          const from = squareCenterPercent(arrow.from, orientation);
          const to = squareCenterPercent(arrow.to, orientation);

          return (
            <g key={`${arrow.from}-${arrow.to}-${index}`} className={`analysis-arrow ${arrow.color}`}>
              <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
              <circle cx={to.x} cy={to.y} r={1.3} />
            </g>
          );
        })}
      </svg>

      <div
        className="analysis-overlay-grid"
        onContextMenu={(event) => {
          event.preventDefault();
        }}
      >
        {squareList.map((square) => (
          <button
            key={square}
            type="button"
            className="analysis-overlay-cell"
            aria-label={`analysis square ${square}`}
            onMouseDown={(event) => {
              if (event.button === 2) {
                setDragArrowStart(square);
                return;
              }

              if (drawTool === 'highlight' || event.shiftKey) {
                onToggleHighlight(square);
                return;
              }

              if (drawTool === 'arrow') {
                if (!arrowStart) {
                  setArrowStart(square);
                } else {
                  onAddArrow(arrowStart, square);
                  setArrowStart(null);
                }
              }
            }}
            onMouseUp={(event) => {
              if (event.button === 2 && dragArrowStart) {
                onAddArrow(dragArrowStart, square);
                setDragArrowStart(null);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}
