'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AnimatedBoard } from '../../../components/animated-board';
import { fetchJson, type TrapDetail, type TrapTrainingResponse } from '../../../lib/api';

export default function WatchPage() {
  const params = useParams<{ id: string }>();
  const trapId = params.id;
  const [trap, setTrap] = useState<TrapDetail | null>(null);
  const [training, setTraining] = useState<TrapTrainingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadWatchMode() {
      try {
        const [trapData, trainingData] = await Promise.all([
          fetchJson<TrapDetail>(`/traps/${trapId}`),
          fetchJson<TrapTrainingResponse>(`/traps/${trapId}/training`),
        ]);

        if (!isMounted) {
          return;
        }

        setTrap(trapData);
        setTraining(trainingData);
        setError(null);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : 'Unable to load watch mode.');
      }
    }

    if (trapId) {
      void loadWatchMode();
    }

    return () => {
      isMounted = false;
    };
  }, [trapId]);

  return (
    <main className="page-container">
      {trap && training ? (
        <>
          <section className="panel-card">
            <div className="eyebrow">Watch</div>
            <h1 style={{ fontSize: '3rem', margin: '12px 0 12px' }}>{trap.title}</h1>
            <p className="muted-copy" style={{ lineHeight: 1.7, maxWidth: 820 }}>
              Watch the full trap sequence auto-play from start to finish. Every move highlights the
              square change and keeps the explanation visible beside the board.
            </p>
            <div className="action-row" style={{ marginTop: 20 }}>
              <Link href={`/tour/${trap.id}`} className="action-button">
                Guided tour
              </Link>
              <Link href={`/practice/${trap.id}`} className="action-button secondary">
                Practice yourself
              </Link>
              <Link href={`/analysis/${trap.id}`} className="action-button secondary">
                Analysis board
              </Link>
              <Link href={`/traps/${trap.id}`} className="action-button secondary">
                Back to overview
              </Link>
            </div>
          </section>

          <section style={{ marginTop: 24 }}>
            <AnimatedBoard frames={training.watch.frames} />
          </section>
        </>
      ) : error ? (
        <section className="panel-card" style={{ background: '#f8e1db', color: '#702d22' }}>
          {error}
        </section>
      ) : (
        <section className="panel-card">Loading watch mode...</section>
      )}
    </main>
  );
}