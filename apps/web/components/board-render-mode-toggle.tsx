'use client';

import type { BoardRenderMode } from '../lib/board-render-mode';

export function BoardRenderModeToggle({
  mode,
  onChange,
  compact,
}: {
  mode: BoardRenderMode;
  onChange: (mode: BoardRenderMode) => void;
  compact?: boolean;
}) {
  return (
    <div className={`board-mode-toggle ${compact ? 'compact' : ''}`} role="group" aria-label="Board view mode">
      <button
        type="button"
        className={`board-mode-option ${mode === '2d' ? 'active' : ''}`}
        aria-pressed={mode === '2d'}
        onClick={() => {
          onChange('2d');
        }}
      >
        2D board
      </button>
      <button
        type="button"
        className={`board-mode-option ${mode === '3d' ? 'active' : ''}`}
        aria-pressed={mode === '3d'}
        onClick={() => {
          onChange('3d');
        }}
      >
        3D board
      </button>
    </div>
  );
}