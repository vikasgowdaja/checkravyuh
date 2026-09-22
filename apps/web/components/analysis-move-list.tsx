'use client';

import { useEffect, useMemo, useRef } from 'react';

import type { AnalysisGame, MoveAnnotation } from '../lib/analysis';

type AnalysisMoveListProps = {
  game: AnalysisGame;
  currentMoveIndex: number;
  annotations: MoveAnnotation[];
  onSelectMove: (moveIndex: number) => void;
};

type MovePair = {
  moveNumber: number;
  whiteIndex: number;
  blackIndex: number | null;
};

function toMovePairs(totalMoves: number) {
  const pairs: MovePair[] = [];

  for (let whiteIndex = 1; whiteIndex <= totalMoves; whiteIndex += 2) {
    pairs.push({
      moveNumber: Math.ceil(whiteIndex / 2),
      whiteIndex,
      blackIndex: whiteIndex + 1 <= totalMoves ? whiteIndex + 1 : null,
    });
  }

  return pairs;
}

export function AnalysisMoveList({
  game,
  currentMoveIndex,
  annotations,
  onSelectMove,
}: AnalysisMoveListProps) {
  const currentMoveRef = useRef<HTMLButtonElement | null>(null);
  const annotationByMove = useMemo(
    () => new Map(annotations.map((entry) => [entry.moveId, entry] as const)),
    [annotations]
  );
  const movePairs = useMemo(() => toMovePairs(game.moves.length), [game.moves.length]);

  useEffect(() => {
    currentMoveRef.current?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    });
  }, [currentMoveIndex]);

  return (
    <section className="panel-card analysis-move-list-card">
      <div className="eyebrow">Move list</div>
      <div className="analysis-move-list" role="list" aria-label="Moves">
        {movePairs.map((pair) => {
          const whiteMove = game.moves[pair.whiteIndex - 1];
          const blackMove = pair.blackIndex ? game.moves[pair.blackIndex - 1] : null;

          const whiteAnnotation = whiteMove ? annotationByMove.get(whiteMove.id) : null;
          const blackAnnotation = blackMove ? annotationByMove.get(blackMove.id) : null;

          return (
            <div key={pair.moveNumber} className="analysis-move-row" role="listitem">
              <span className="analysis-move-number">{pair.moveNumber}.</span>
              {whiteMove ? (
                <button
                  ref={currentMoveIndex === pair.whiteIndex ? currentMoveRef : null}
                  type="button"
                  className={`analysis-move-item ${currentMoveIndex === pair.whiteIndex ? 'current' : ''}`}
                  onClick={() => {
                    onSelectMove(pair.whiteIndex);
                  }}
                >
                  {whiteMove.san}
                  {whiteAnnotation?.glyph ?? ''}
                </button>
              ) : (
                <span />
              )}
              {blackMove ? (
                <button
                  ref={currentMoveIndex === pair.blackIndex ? currentMoveRef : null}
                  type="button"
                  className={`analysis-move-item ${currentMoveIndex === pair.blackIndex ? 'current' : ''}`}
                  onClick={() => {
                    if (pair.blackIndex) {
                      onSelectMove(pair.blackIndex);
                    }
                  }}
                >
                  {blackMove.san}
                  {blackAnnotation?.glyph ?? ''}
                </button>
              ) : (
                <span />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
