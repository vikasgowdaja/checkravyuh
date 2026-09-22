'use client';

type AnalysisMoveNavigationProps = {
  currentMoveIndex: number;
  totalMoves: number;
  isAutoPlaying: boolean;
  onFirst: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onLast: () => void;
  onToggleAutoPlay: () => void;
};

export function AnalysisMoveNavigation({
  currentMoveIndex,
  totalMoves,
  isAutoPlaying,
  onFirst,
  onPrevious,
  onNext,
  onLast,
  onToggleAutoPlay,
}: AnalysisMoveNavigationProps) {
  return (
    <div className="analysis-nav" role="toolbar" aria-label="Game navigation">
      <button
        type="button"
        className="action-button secondary compact-button"
        onClick={onFirst}
        disabled={currentMoveIndex === 0}
        aria-label="Go to first position"
      >
        |&lt;
      </button>
      <button
        type="button"
        className="action-button secondary compact-button"
        onClick={onPrevious}
        disabled={currentMoveIndex === 0}
        aria-label="Go to previous move"
      >
        &lt;
      </button>
      <button
        type="button"
        className="action-button compact-button"
        onClick={onToggleAutoPlay}
        disabled={totalMoves < 2}
        aria-label={isAutoPlaying ? 'Pause autoplay' : 'Start autoplay'}
      >
        {isAutoPlaying ? 'Pause' : 'Play'}
      </button>
      <button
        type="button"
        className="action-button secondary compact-button"
        onClick={onNext}
        disabled={currentMoveIndex === totalMoves}
        aria-label="Go to next move"
      >
        &gt;
      </button>
      <button
        type="button"
        className="action-button secondary compact-button"
        onClick={onLast}
        disabled={currentMoveIndex === totalMoves}
        aria-label="Go to final position"
      >
        &gt;|
      </button>
      <span className="soft-pill">Move {currentMoveIndex} / {totalMoves}</span>
    </div>
  );
}
