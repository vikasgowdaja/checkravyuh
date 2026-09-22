'use client';

import { useEffect, useState } from 'react';

export type BoardRenderMode = '2d' | '3d';

const boardRenderModeStorageKey = 'checkravyuh-board-render-mode';

function isBoardRenderMode(value: string | null): value is BoardRenderMode {
  return value === '2d' || value === '3d';
}

export function getStoredBoardRenderMode(defaultMode: BoardRenderMode = '2d') {
  if (typeof window === 'undefined') {
    return defaultMode;
  }

  const storedMode = window.localStorage.getItem(boardRenderModeStorageKey);
  return isBoardRenderMode(storedMode) ? storedMode : defaultMode;
}

export function useBoardRenderMode(defaultMode: BoardRenderMode = '2d') {
  const [mode, setMode] = useState<BoardRenderMode>(defaultMode);

  useEffect(() => {
    setMode(getStoredBoardRenderMode(defaultMode));

    function syncFromStorage(event: StorageEvent) {
      if (event.key !== boardRenderModeStorageKey) {
        return;
      }

      if (isBoardRenderMode(event.newValue)) {
        setMode(event.newValue);
      }
    }

    window.addEventListener('storage', syncFromStorage);
    return () => {
      window.removeEventListener('storage', syncFromStorage);
    };
  }, [defaultMode]);

  function updateMode(nextMode: BoardRenderMode) {
    setMode(nextMode);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(boardRenderModeStorageKey, nextMode);
    }
  }

  return {
    mode,
    setMode: updateMode,
  };
}