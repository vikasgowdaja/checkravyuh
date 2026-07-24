'use client';

import { type Move, type Square } from 'chess.js';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

import { InteractiveChessBoard } from './interactive-chess-board';
import { createChessFromFrame } from '../lib/chess-position';
import { postJson, type BoardFrame, type GuidedTurn, type MoveValidationResponse } from '../lib/api';

type FeedbackState =
  | {
      kind: 'correct';
      message: string;
    }
  | {
      kind: 'incorrect';
      message: string;
      hint?: string;
    }
  | {
      kind: 'completed';
      message: string;
      seconds: number;
      accuracy: number;
    };

type PromotionChoice = {
  from: string;
  to: string;
  choices: Move[];
};

type LegalTarget = {
  to: string;
  isCapture: boolean;
};

function promotionLabel(move: Move) {
  switch (move.promotion) {
    case 'q':
      return 'Promote to Queen';
    case 'r':
      return 'Promote to Rook';
    case 'b':
      return 'Promote to Bishop';
    case 'n':
      return 'Promote to Knight';
    default:
      return move.san;
  }
}

export function GuidedTrainer({
  trapId,
  mode,
  turns,
}: {
  trapId: string;
  mode: 'tour' | 'practice';
  turns: GuidedTurn[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayFrame, setDisplayFrame] = useState<BoardFrame | null>(turns[0]?.boardBefore ?? null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [turnAttempts, setTurnAttempts] = useState<Record<string, number>>({});
  const [firstTryCorrectCount, setFirstTryCorrectCount] = useState(0);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalTargets, setLegalTargets] = useState<LegalTarget[]>([]);
  const [promotionChoice, setPromotionChoice] = useState<PromotionChoice | null>(null);
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('black');
  const autoAdvanceTimeoutRef = useRef<number | null>(null);

  const currentTurn = turns[currentIndex] ?? null;
  const boardState = useMemo(() => {
    if (!currentTurn) {
      return {
        game: null,
        error: null,
      };
    }

    try {
      return {
        game: createChessFromFrame(currentTurn.boardBefore, 'black'),
        error: null,
      };
    } catch (error) {
      return {
        game: null,
        error: error instanceof Error ? error.message : 'Unable to load chess position.',
      };
    }
  }, [currentTurn]);
  const interactionDisabled = isSubmitting || feedback?.kind === 'correct' || feedback?.kind === 'completed';

  useEffect(() => {
    setCurrentIndex(0);
    setDisplayFrame(turns[0]?.boardBefore ?? null);
    setFeedback(null);
    setTurnAttempts({});
    setFirstTryCorrectCount(0);
    setStartedAt(Date.now());
    setIsSubmitting(false);
    setSelectedSquare(null);
    setLegalTargets([]);
    setPromotionChoice(null);
    setBoardOrientation('black');

    return () => {
      if (autoAdvanceTimeoutRef.current !== null) {
        window.clearTimeout(autoAdvanceTimeoutRef.current);
      }
    };
  }, [turns]);

  useEffect(() => {
    setSelectedSquare(null);
    setLegalTargets([]);
    setPromotionChoice(null);
  }, [currentIndex]);

  const completedTurns = useMemo(() => {
    if (!feedback) {
      return currentIndex;
    }

    return feedback.kind === 'correct' || feedback.kind === 'completed' ? currentIndex + 1 : currentIndex;
  }, [currentIndex, feedback]);

  const engineStatus = useMemo(() => {
    if (!boardState.game) {
      return null;
    }

    const game = boardState.game;
    const legalMoveCount = game.moves().length;

    if (game.isCheckmate()) {
      return `Checkmate on the board. ${legalMoveCount} legal moves remain.`;
    }

    if (game.isStalemate()) {
      return 'Stalemate reached.';
    }

    if (game.isDraw()) {
      return 'Drawn position.';
    }

    if (game.isCheck()) {
      return `Black is in check. ${legalMoveCount} legal replies available.`;
    }

    return `${legalMoveCount} legal moves available for Black.`;
  }, [boardState.game]);

  function clearSelection() {
    setSelectedSquare(null);
    setLegalTargets([]);
    setPromotionChoice(null);
  }

  function clearAutoAdvance() {
    if (autoAdvanceTimeoutRef.current !== null) {
      window.clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
  }

  function selectSquare(square: string) {
    if (!boardState.game || interactionDisabled) {
      return;
    }

    const game = boardState.game;
    const piece = game.get(square as Square);

    if (!piece || piece.color !== game.turn()) {
      clearSelection();
      return;
    }

    const nextTargets = game.moves({ square: square as Square, verbose: true }).map((move) => ({
      to: move.to,
      isCapture: Boolean(move.captured),
    }));

    setSelectedSquare(square);
    setLegalTargets(nextTargets);
    setPromotionChoice(null);
  }

  async function submitMove(move: Move) {
    if (!currentTurn) {
      return;
    }

    clearSelection();

    const attemptsForTurn = (turnAttempts[currentTurn.id] ?? 0) + 1;

    setTurnAttempts((existingAttempts) => ({
      ...existingAttempts,
      [currentTurn.id]: attemptsForTurn,
    }));
    setIsSubmitting(true);

    try {
      const result = await postJson<MoveValidationResponse>(`/traps/${trapId}/${mode}/validate`, {
        turnId: currentTurn.id,
        move: move.san,
      });

      if (!result.correct) {
        setFeedback({
          kind: 'incorrect',
          message: result.feedback,
          hint: result.hint,
        });
        setIsSubmitting(false);
        return;
      }

      if (attemptsForTurn === 1) {
        setFirstTryCorrectCount((value) => value + 1);
      }

      setDisplayFrame(result.boardAfter ?? currentTurn.boardAfter);

      if (result.isComplete) {
        clearAutoAdvance();
        const seconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
        const projectedFirstTryTotal = firstTryCorrectCount + (attemptsForTurn === 1 ? 1 : 0);
        const accuracy = Math.round((projectedFirstTryTotal / turns.length) * 100);

        setFeedback({
          kind: 'completed',
          message: 'Trap executed successfully.',
          seconds,
          accuracy,
        });
        setIsSubmitting(false);
        return;
      }

      setFeedback({
        kind: 'correct',
        message: result.feedback,
      });

      const nextTurn = turns[currentIndex + 1];

      if (nextTurn) {
        clearAutoAdvance();
        autoAdvanceTimeoutRef.current = window.setTimeout(() => {
          setCurrentIndex((value) => value + 1);
          setDisplayFrame(nextTurn.boardBefore);
          setFeedback(null);
          clearSelection();
          autoAdvanceTimeoutRef.current = null;
        }, 1300);
      }
    } catch (error) {
      setFeedback({
        kind: 'incorrect',
        message: error instanceof Error ? error.message : 'Validation failed.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function resolveMoveAttempt(from: string, to: string) {
    if (!boardState.game || interactionDisabled) {
      return;
    }

    const availableMoves = boardState.game
      .moves({ square: from as Square, verbose: true })
      .filter((move) => move.to === to);

    if (availableMoves.length === 0) {
      const piece = boardState.game.get(to as Square);

      if (piece && piece.color === boardState.game.turn()) {
        selectSquare(to);
      }

      return;
    }

    if (availableMoves.length > 1 && availableMoves.some((move) => Boolean(move.promotion))) {
      setPromotionChoice({
        from,
        to,
        choices: availableMoves,
      });
      return;
    }

    void submitMove(availableMoves[0]);
  }

  function handleSquareActivate(square: string) {
    if (!boardState.game || interactionDisabled) {
      return;
    }

    if (selectedSquare) {
      resolveMoveAttempt(selectedSquare, square);
      return;
    }

    selectSquare(square);
  }

  function handleContinue() {
    const nextTurn = turns[currentIndex + 1];

    if (!nextTurn) {
      return;
    }

    setCurrentIndex((value) => value + 1);
    setDisplayFrame(nextTurn.boardBefore);
    setFeedback(null);
    clearSelection();
    clearAutoAdvance();
  }

  function handleReplay() {
    clearAutoAdvance();
    setCurrentIndex(0);
    setDisplayFrame(turns[0]?.boardBefore ?? null);
    setFeedback(null);
    setTurnAttempts({});
    setFirstTryCorrectCount(0);
    setStartedAt(Date.now());
    clearSelection();
  }

  if (!currentTurn || !displayFrame) {
    return (
      <section className="panel-card">
        <h2 style={{ marginTop: 0 }}>Training is loading</h2>
        <p className="muted-copy">Fetching the scripted trap sequence.</p>
      </section>
    );
  }

  if (boardState.error) {
    return (
      <section className="panel-card" style={{ background: '#f8e1db', color: '#702d22' }}>
        {boardState.error}
      </section>
    );
  }

  return (
    <section className="practice-layout">
      <InteractiveChessBoard
        frame={displayFrame}
        activeColor="black"
        orientation={boardOrientation}
        selectedSquare={selectedSquare}
        legalTargets={legalTargets}
        disabled={interactionDisabled}
        onSquareActivate={handleSquareActivate}
        onMoveAttempt={resolveMoveAttempt}
      />

      <div className="practice-sidebar">
        <div className="panel-card">
          <div className="eyebrow">{mode === 'tour' ? 'Guided tour' : 'Practice'}</div>
          <h2 style={{ margin: '10px 0 12px' }}>{currentTurn.prompt}</h2>
          <p className="muted-copy">
            White just played {currentTurn.whiteMove}. Select or drag the black piece you want to move.
          </p>

          <div className="pill-row" style={{ marginTop: 18 }}>
            <span className="soft-pill">
              Turn {currentIndex + 1} / {turns.length}
            </span>
            <span className="soft-pill">Completed {completedTurns}</span>
            {engineStatus ? <span className="soft-pill">{engineStatus}</span> : null}
            <button
              className="action-button secondary compact-button"
              onClick={() => {
                setBoardOrientation((current) => (current === 'black' ? 'white' : 'black'));
              }}
            >
              Flip board
            </button>
          </div>

          <p className="muted-copy" style={{ marginTop: 18, marginBottom: 0 }}>
            First click selects a piece and shows only legal targets. The second click, or a drag-and-drop,
            attempts the move. Illegal moves are blocked before the backend checks whether you found the trap line.
          </p>
          <p className="muted-copy" style={{ marginTop: 12, marginBottom: 0 }}>
            Black is shown from the learner side by default, and White&apos;s scripted reply advances automatically after a correct move.
          </p>

          {promotionChoice ? (
            <div className="panel-card" style={{ marginTop: 18, padding: 18 }}>
              <div className="eyebrow">Choose promotion</div>
              <div className="option-grid" style={{ marginTop: 12 }}>
                {promotionChoice.choices.map((choice) => (
                  <button
                    key={`${choice.from}-${choice.to}-${choice.promotion}`}
                    className="action-button option-button"
                    onClick={() => {
                      void submitMove(choice);
                    }}
                  >
                    {promotionLabel(choice)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {feedback ? (
            <div className={`feedback-card ${feedback.kind}`} style={{ marginTop: 18 }}>
              <strong>
                {feedback.kind === 'incorrect'
                  ? 'Incorrect'
                  : feedback.kind === 'completed'
                    ? 'Success'
                    : 'Correct'}
              </strong>
              <p style={{ marginBottom: 0 }}>{feedback.message}</p>
              {feedback.kind === 'incorrect' && feedback.hint ? (
                <p style={{ marginBottom: 0 }}>Hint: {feedback.hint}</p>
              ) : null}
              {feedback.kind === 'completed' ? (
                <div className="summary-grid" style={{ marginTop: 16 }}>
                  <div className="panel-card" style={{ padding: 16 }}>
                    <div className="eyebrow">Accuracy</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: 8 }}>
                      {feedback.accuracy}%
                    </div>
                  </div>
                  <div className="panel-card" style={{ padding: 16 }}>
                    <div className="eyebrow">Time</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: 8 }}>
                      {feedback.seconds}s
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="action-row" style={{ marginTop: 18 }}>
            {feedback?.kind === 'correct' ? (
              <span className="soft-pill">White is replying automatically...</span>
            ) : null}
            {feedback?.kind === 'completed' ? (
              <>
                <button className="action-button" onClick={handleReplay}>
                  Replay training
                </button>
                <Link href="/review" className="action-button secondary">
                  Review queue
                </Link>
              </>
            ) : null}
          </div>
        </div>

        <div className="panel-card">
          <div className="eyebrow">Progress</div>
          <div className="timeline-list" style={{ marginTop: 14 }}>
            {turns.map((turn, index) => {
              const isSolved = index < completedTurns;
              const isCurrent = index === currentIndex && !isSolved;

              return (
                <div
                  key={turn.id}
                  className={`timeline-row ${isSolved ? 'done' : isCurrent ? 'current' : ''}`}
                >
                  <strong>{turn.whiteMove}</strong>
                  <span>{isSolved ? turn.correctMove : '?'}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}