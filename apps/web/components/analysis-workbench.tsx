'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { AnalysisAnnotationPanel } from './analysis-annotation-panel';
import { AnalysisBoardSurface } from './analysis-board-surface';
import { AnalysisMoveList } from './analysis-move-list';
import { AnalysisMoveNavigation } from './analysis-move-navigation';
import { AnalysisShareExportMenu } from './analysis-share-export-menu';
import { BoardRenderModeToggle } from './board-render-mode-toggle';
import type { BoardFrame } from '../lib/api';
import {
  clampMoveIndex,
  clearPositionDrawings,
  getMoveForIndex,
  getPositionDrawing,
  parsePgnToAnalysisGame,
  toggleSquareHighlight,
  upsertMoveAnnotation,
  upsertPositionDrawing,
  type MoveGlyph,
} from '../lib/analysis';
import { useBoardRenderMode } from '../lib/board-render-mode';
import { fenToBoardFrame } from '../lib/chess-position';

export function AnalysisWorkbench({
  gameId,
  title,
  pgn,
  startingFen,
  whitePlayer,
  blackPlayer,
  whiteRating,
  blackRating,
  initialMoveIndex = 0,
}: {
  gameId: string;
  title: string;
  pgn: string;
  startingFen?: string;
  whitePlayer: string;
  blackPlayer: string;
  whiteRating?: number;
  blackRating?: number;
  initialMoveIndex?: number;
}) {
  const { mode: boardRenderMode, setMode: setBoardRenderMode } = useBoardRenderMode();
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [drawTool, setDrawTool] = useState<'arrow' | 'highlight'>('arrow');
  const [annotations, setAnnotations] = useState<Array<{ moveId: string; glyph: MoveGlyph | null; comment: string }>>([]);
  const [drawings, setDrawings] = useState<
    Array<{ positionIndex: number; arrows: Array<{ from: string; to: string; color: 'blue' | 'green' | 'red' | 'yellow' }>; highlights: Array<{ square: string; color: 'yellow' | 'green' | 'red' | 'blue' }> }>
  >([]);

  const game = useMemo(
    () =>
      parsePgnToAnalysisGame({
        gameId,
        pgn,
        startingFen,
        headers: {
          event: title,
          white: whitePlayer,
          black: blackPlayer,
        },
      }),
    [gameId, pgn, startingFen, title, whitePlayer, blackPlayer]
  );

  useEffect(() => {
    setCurrentMoveIndex(clampMoveIndex(initialMoveIndex, game.moves.length));
  }, [game.moves.length, initialMoveIndex]);

  useEffect(() => {
    if (!isAutoPlaying) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrentMoveIndex((value) => {
        if (value >= game.moves.length) {
          setIsAutoPlaying(false);
          return value;
        }

        return value + 1;
      });
    }, 1100);

    return () => {
      window.clearInterval(timer);
    };
  }, [game.moves.length, isAutoPlaying]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target;

      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setCurrentMoveIndex((value) => clampMoveIndex(value - 1, game.moves.length));
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setCurrentMoveIndex((value) => clampMoveIndex(value + 1, game.moves.length));
      }

      if (event.key === 'Home') {
        event.preventDefault();
        setCurrentMoveIndex(0);
      }

      if (event.key === 'End') {
        event.preventDefault();
        setCurrentMoveIndex(game.moves.length);
      }

      if (event.key === ' ') {
        event.preventDefault();
        setIsAutoPlaying((value) => !value);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [game.moves.length]);

  const currentMove = getMoveForIndex(game, currentMoveIndex);
  const currentFen = game.positions[currentMoveIndex] ?? game.initialFen;
  const currentFrame: BoardFrame = fenToBoardFrame(currentFen, {
    id: `${gameId}-${currentMoveIndex}`,
    label: currentMove ? `Move ${currentMove.ply}` : 'Initial position',
    prompt: currentMove ? currentMove.san : 'Initial board setup',
    narration: currentMove
      ? `${currentMove.color === 'white' ? 'White' : 'Black'} played ${currentMove.san}.`
      : 'Navigate to inspect any position in this game.',
    movePlayed: currentMove?.san,
    highlightSquares: currentMove ? [currentMove.from, currentMove.to] : [],
  });

  const currentDrawing = getPositionDrawing(drawings, currentMoveIndex);
  const moveCount = game.moves.length;

  const shareLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/analysis/${gameId}?ply=${currentMoveIndex}`;

  return (
    <section className="analysis-workbench">
      <div className="panel-card analysis-header">
        <div>
          <div className="eyebrow">Analysis board</div>
          <h1 style={{ margin: '8px 0 10px' }}>{title}</h1>
          <p className="muted-copy" style={{ margin: 0 }}>
            {whitePlayer} {whiteRating ? `(${whiteRating})` : ''} vs {blackPlayer} {blackRating ? `(${blackRating})` : ''}
          </p>
        </div>
        <div className="analysis-header-actions">
          <Link href={`/traps/${gameId}`} className="action-button secondary compact-button">
            Back to game
          </Link>
          <AnalysisShareExportMenu
            game={game}
            annotations={annotations}
            currentFen={currentFen}
            shareLink={shareLink}
            onOpenAnalysisBoard={() => {
              setCurrentMoveIndex(0);
              setIsAutoPlaying(false);
            }}
          />
        </div>
      </div>

      <div className="analysis-layout">
        <div className="analysis-board-column">
          <AnalysisBoardSurface
            frame={currentFrame}
            orientation={orientation}
            renderMode={boardRenderMode}
            drawing={currentDrawing}
            drawTool={drawTool}
            onToggleHighlight={(square) => {
              setDrawings((value) =>
                upsertPositionDrawing({
                  existing: value,
                  positionIndex: currentMoveIndex,
                  updater: (entry) =>
                    toggleSquareHighlight({
                      drawing: entry,
                      square,
                      color: 'yellow',
                    }),
                })
              );
            }}
            onAddArrow={(from, to) => {
              setDrawings((value) =>
                upsertPositionDrawing({
                  existing: value,
                  positionIndex: currentMoveIndex,
                  updater: (entry) => ({
                    ...entry,
                    arrows: [...entry.arrows, { from, to, color: 'blue' }],
                  }),
                })
              );
            }}
          />

          <div className="panel-card">
            <div className="analysis-toolbar-row">
              <AnalysisMoveNavigation
                currentMoveIndex={currentMoveIndex}
                totalMoves={moveCount}
                isAutoPlaying={isAutoPlaying}
                onFirst={() => {
                  setCurrentMoveIndex(0);
                  setIsAutoPlaying(false);
                }}
                onPrevious={() => {
                  setCurrentMoveIndex((value) => clampMoveIndex(value - 1, moveCount));
                  setIsAutoPlaying(false);
                }}
                onNext={() => {
                  setCurrentMoveIndex((value) => clampMoveIndex(value + 1, moveCount));
                  setIsAutoPlaying(false);
                }}
                onLast={() => {
                  setCurrentMoveIndex(moveCount);
                  setIsAutoPlaying(false);
                }}
                onToggleAutoPlay={() => {
                  setIsAutoPlaying((value) => !value);
                }}
              />
            </div>
            <div className="analysis-toolbar-row" style={{ marginTop: 12 }}>
              <BoardRenderModeToggle mode={boardRenderMode} onChange={setBoardRenderMode} compact />
              <button
                type="button"
                className={`action-button secondary compact-button ${drawTool === 'arrow' ? 'active-tool' : ''}`}
                onClick={() => {
                  setDrawTool('arrow');
                }}
              >
                Arrow tool
              </button>
              <button
                type="button"
                className={`action-button secondary compact-button ${drawTool === 'highlight' ? 'active-tool' : ''}`}
                onClick={() => {
                  setDrawTool('highlight');
                }}
              >
                Highlight tool
              </button>
              <button
                type="button"
                className="action-button secondary compact-button"
                onClick={() => {
                  setDrawings((value) => clearPositionDrawings(value, currentMoveIndex));
                }}
              >
                Clear drawings
              </button>
              <button
                type="button"
                className="action-button secondary compact-button"
                onClick={() => {
                  setOrientation((value) => (value === 'white' ? 'black' : 'white'));
                }}
              >
                Flip board
              </button>
            </div>
          </div>

          <div className="panel-card analysis-result-card">
            <div className="eyebrow">Game result</div>
            <h2 style={{ margin: '8px 0' }}>{game.headers.result}</h2>
            <p className="muted-copy" style={{ margin: 0 }}>
              {game.termination}. {moveCount} plies analyzed.
            </p>
            <div className="pill-row" style={{ marginTop: 12 }}>
              <span className="soft-pill">White: {whitePlayer}</span>
              <span className="soft-pill">Black: {blackPlayer}</span>
              <span className="soft-pill">Time remaining: N/A</span>
            </div>
          </div>
        </div>

        <div className="analysis-side-column">
          <AnalysisMoveList
            game={game}
            currentMoveIndex={currentMoveIndex}
            annotations={annotations}
            onSelectMove={(index) => {
              setCurrentMoveIndex(clampMoveIndex(index, moveCount));
              setIsAutoPlaying(false);
            }}
          />

          <AnalysisAnnotationPanel
            selectedMove={currentMove}
            annotations={annotations}
            onSave={(glyph, comment) => {
              if (!currentMove) {
                return;
              }

              setAnnotations((value) =>
                upsertMoveAnnotation({
                  existing: value,
                  moveId: currentMove.id,
                  glyph,
                  comment,
                })
              );
            }}
          />
        </div>
      </div>
    </section>
  );
}
