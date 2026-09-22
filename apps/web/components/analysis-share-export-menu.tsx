'use client';

import { useMemo, useState } from 'react';

import type { AnalysisGame, MoveAnnotation } from '../lib/analysis';
import { buildAnnotatedPgn } from '../lib/analysis';

type AnalysisShareExportMenuProps = {
  game: AnalysisGame;
  annotations: MoveAnnotation[];
  currentFen: string;
  shareLink: string;
  onOpenAnalysisBoard: () => void;
};

export function AnalysisShareExportMenu({
  game,
  annotations,
  currentFen,
  shareLink,
  onOpenAnalysisBoard,
}: AnalysisShareExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const pgn = useMemo(
    () => buildAnnotatedPgn({ game, annotations }),
    [annotations, game]
  );

  async function copyText(value: string) {
    await navigator.clipboard.writeText(value);
  }

  function downloadPgn() {
    const blob = new Blob([pgn], { type: 'application/x-chess-pgn' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${game.gameId}.pgn`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="analysis-menu-wrap">
      <button
        type="button"
        className="action-button secondary compact-button"
        onClick={() => {
          setIsOpen((value) => !value);
        }}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        ...
      </button>

      {isOpen ? (
        <div className="analysis-menu" role="menu">
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsBookmarked((value) => !value);
            }}
          >
            {isBookmarked ? 'Bookmarked' : 'Bookmark this game'}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              void copyText(shareLink);
            }}
          >
            Copy game link
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              void copyText(pgn);
            }}
          >
            Copy PGN
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={downloadPgn}
          >
            Download PGN
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              void copyText(currentFen);
            }}
          >
            Copy FEN
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={onOpenAnalysisBoard}
          >
            Analysis board
          </button>
        </div>
      ) : null}
    </div>
  );
}
