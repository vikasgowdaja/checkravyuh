'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { GuidedTrainer } from '../../../components/guided-trainer';
import { fetchJson, type TrapDetail, type TrapTrainingResponse } from '../../../lib/api';

export default function TourPage() {
  const params = useParams<{ id: string }>();
  const trapId = params.id;
  const [trap, setTrap] = useState<TrapDetail | null>(null);
  const [training, setTraining] = useState<TrapTrainingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadTourMode() {
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

        setError(loadError instanceof Error ? loadError.message : 'Unable to load guided tour.');
      }
    }

    if (trapId) {
      void loadTourMode();
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
            <div className="eyebrow">Tour</div>
            <h1 style={{ fontSize: '3rem', margin: '12px 0 12px' }}>{trap.title}</h1>
            <p className="muted-copy" style={{ lineHeight: 1.7, maxWidth: 820 }}>
              This guided mode shows White&apos;s move, asks you for the correct Black reply, and gives
              immediate feedback with hints when you miss the pattern.
            </p>
            <div className="action-row" style={{ marginTop: 20 }}>
              <Link href={`/watch/${trap.id}`} className="action-button secondary">
                Watch first
              </Link>
              <Link href={`/practice/${trap.id}`} className="action-button">
                Move to practice
              </Link>
              <Link href={`/traps/${trap.id}`} className="action-button secondary">
                Back to overview
              </Link>
            </div>
          </section>

          <section style={{ marginTop: 24 }}>
            <GuidedTrainer trapId={trap.id} mode="tour" turns={training.tour.turns} />
          </section>
        </>
      ) : error ? (
        <section className="panel-card" style={{ background: '#f8e1db', color: '#702d22' }}>
          {error}
        </section>
      ) : (
        <section className="panel-card">Loading guided tour...</section>
      )}
    </main>
  );
}