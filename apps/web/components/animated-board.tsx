'use client';

import { useEffect, useMemo, useState } from 'react';

import { ChessBoard } from './chess-board';
import type { BoardFrame } from '../lib/api';

export function AnimatedBoard({ frames }: { frames: BoardFrame[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('black');

  const currentFrame = frames[currentIndex];

  useEffect(() => {
    if (!isPlaying || frames.length < 2) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setCurrentIndex((index) => {
        if (index >= frames.length - 1) {
          window.clearInterval(intervalId);
          setIsPlaying(false);
          return index;
        }

        return index + 1;
      });
    }, 1400);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [frames.length, isPlaying]);

  const moveList = useMemo(
    () => frames.map((frame) => frame.movePlayed).filter((move): move is string => Boolean(move)),
    [frames]
  );

  if (frames.length === 0) {
    return (
      <div className="panel-card">
        <h2 style={{ marginTop: 0 }}>Watch sequence unavailable</h2>
        <p className="muted-copy">The scripted trap line could not be loaded.</p>
      </div>
    );
  }

  return (
    <section className="practice-layout">
      <ChessBoard frame={currentFrame} orientation={boardOrientation} />

      <div className="practice-sidebar">
        <div className="panel-card">
          <div className="eyebrow">{currentFrame.label}</div>
          <h2 style={{ margin: '10px 0 12px' }}>{currentFrame.prompt}</h2>
          <p className="muted-copy">{currentFrame.narration}</p>
          <div className="pill-row" style={{ marginTop: 18 }}>
            <span className="soft-pill">{currentFrame.movePlayed ?? 'Position setup'}</span>
            <span className="soft-pill">Frame {currentIndex + 1} / {frames.length}</span>
            <button
              className="action-button secondary compact-button"
              onClick={() => {
                setBoardOrientation((current) => (current === 'black' ? 'white' : 'black'));
              }}
            >
              Flip board
            </button>
          </div>
          <div className="control-row" style={{ marginTop: 18 }}>
            <button
              className="action-button secondary"
              disabled={currentIndex === 0}
              onClick={() => {
                setIsPlaying(false);
                setCurrentIndex((value) => Math.max(0, value - 1));
              }}
            >
              Previous
            </button>
            <button
              className="action-button"
              onClick={() => {
                if (currentIndex === frames.length - 1) {
                  setCurrentIndex(0);
                  setIsPlaying(true);
                  return;
                }

                setIsPlaying((value) => !value);
              }}
            >
              {isPlaying ? 'Pause demo' : currentIndex === frames.length - 1 ? 'Replay demo' : 'Auto play'}
            </button>
            <button
              className="action-button secondary"
              disabled={currentIndex === frames.length - 1}
              onClick={() => {
                setIsPlaying(false);
                setCurrentIndex((value) => Math.min(frames.length - 1, value + 1));
              }}
            >
              Next move
            </button>
          </div>
        </div>

        <div className="panel-card">
          <div className="eyebrow">Move sequence</div>
          <div className="move-sequence" style={{ marginTop: 12 }}>
            {moveList.map((move) => (
              <span key={move} className="move-chip">
                {move}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}