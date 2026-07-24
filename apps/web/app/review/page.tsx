'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { fetchJson, type ReviewResponse } from '../../lib/api';

export default function ReviewPage() {
  const [review, setReview] = useState<ReviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadReview() {
      try {
        const reviewData = await fetchJson<ReviewResponse>('/review/today');

        if (!isMounted) {
          return;
        }

        setReview(reviewData);
        setError(null);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : 'Unable to load review queue.');
      }
    }

    void loadReview();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="page-container">
      <section className="panel-card">
        <div className="eyebrow">Daily review</div>
        <h1 style={{ fontSize: '3rem', margin: '12px 0 12px' }}>Keep the trap patterns fresh.</h1>
        <p className="muted-copy" style={{ lineHeight: 1.6 }}>
          This queue is served by the same backend that powers lessons and practice. Each review card
          becomes a launch point back into trap detail or animated board work.
        </p>
      </section>

      {error ? (
        <section className="panel-card" style={{ marginTop: 22, background: '#f8e1db', color: '#702d22' }}>
          {error}
        </section>
      ) : null}

      <section className="summary-grid" style={{ marginTop: 24 }}>
        <article className="panel-card">
          <div className="eyebrow">Due today</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: 10 }}>{review?.dueToday ?? 0}</div>
        </article>
        <article className="panel-card">
          <div className="eyebrow">Streak</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: 10 }}>{review?.streak ?? 0}</div>
        </article>
      </section>

      <section className="card-grid" style={{ marginTop: 24 }}>
        {(review?.queue ?? []).map((item) => (
          <article key={item.trapId} className="panel-card">
            <div className="eyebrow">Review due {item.nextReview}</div>
            <h2 style={{ margin: '12px 0 10px' }}>{item.title}</h2>
            <p className="muted-copy">Mastery {item.mastery}%</p>
            <div className="action-row" style={{ marginTop: 18 }}>
              <Link href={`/practice/${item.trapId}`} className="action-button">
                Practice now
              </Link>
              <Link href={`/traps/${item.trapId}`} className="action-button secondary">
                Read lesson
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}