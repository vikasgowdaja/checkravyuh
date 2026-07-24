'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { fetchJson, type LessonResponse, type TrapDetail } from '../../../lib/api';

export default function TrapPage() {
  const params = useParams<{ id: string }>();
  const trapId = params.id;
  const [trap, setTrap] = useState<TrapDetail | null>(null);
  const [lesson, setLesson] = useState<LessonResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadTrap() {
      try {
        const [trapData, lessonData] = await Promise.all([
          fetchJson<TrapDetail>(`/traps/${trapId}`),
          fetchJson<LessonResponse>(`/traps/${trapId}/lesson`),
        ]);

        if (!isMounted) {
          return;
        }

        setTrap(trapData);
        setLesson(lessonData);
        setError(null);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : 'Unable to load trap details.');
      }
    }

    if (trapId) {
      void loadTrap();
    }

    return () => {
      isMounted = false;
    };
  }, [trapId]);

  return (
    <main className="page-container">
      {trap ? (
        <>
          <section className="hero-grid">
            <article className="panel-card">
              <div className="eyebrow">{trap.opening.name}</div>
              <h1 style={{ fontSize: '3rem', margin: '10px 0 12px' }}>{trap.title}</h1>
              <p className="muted-copy" style={{ lineHeight: 1.7 }}>{trap.summary}</p>
              <div className="pill-row" style={{ marginTop: 16 }}>
                <span className="soft-pill">{trap.difficulty}</span>
                <span className="soft-pill">{trap.estimatedMinutes} min</span>
                <span className="soft-pill">{trap.engineEvaluation}</span>
              </div>
              <div className="action-row" style={{ marginTop: 22 }}>
                <Link href={`/watch/${trap.id}`} className="action-button secondary">
                  Watch
                </Link>
                <Link href={`/tour/${trap.id}`} className="action-button secondary">
                  Tour
                </Link>
                <Link href={`/practice/${trap.id}`} className="action-button">
                  Practice
                </Link>
                <Link href="/traps" className="action-button secondary">
                  Back to traps
                </Link>
              </div>
            </article>

            <aside className="panel-card">
              <div className="eyebrow">Trigger position</div>
              <p className="muted-copy" style={{ lineHeight: 1.6, marginTop: 12 }}>{trap.whenItWorks}</p>
              <div className="pill-row" style={{ marginTop: 14 }}>
                {trap.tacticalMotifs.map((motif) => (
                  <span key={motif} className="tag-chip">
                    {motif}
                  </span>
                ))}
              </div>
              <p className="muted-copy" style={{ lineHeight: 1.6, marginTop: 18 }}>
                Rating range: {trap.ratingRange.min} to {trap.ratingRange.max}
              </p>
            </aside>
          </section>

          <section className="split-grid" style={{ marginTop: 24 }}>
            <article className="panel-card">
              <div className="eyebrow">Trap structure</div>
              <div className="card-grid" style={{ marginTop: 16 }}>
                {[
                  ['Overview', trap.overview],
                  ['Idea', trap.idea],
                  ['When it works', trap.whenItWorks],
                  ['Warning', trap.warning],
                ].map(([title, content]) => (
                  <div key={title} className="panel-card" style={{ padding: 18 }}>
                    <strong>{title}</strong>
                    <p className="muted-copy" style={{ lineHeight: 1.6 }}>{content}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel-card">
              <div className="eyebrow">Winning continuation</div>
              <div className="move-sequence" style={{ marginTop: 16 }}>
                {trap.winningContinuation.map((move) => (
                  <span key={move} className="move-chip">
                    {move}
                  </span>
                ))}
              </div>
              <div className="eyebrow" style={{ marginTop: 20 }}>Common mistakes</div>
              <ul style={{ paddingLeft: 18, lineHeight: 1.7 }}>
                {trap.commonMistakes.map((mistake) => (
                  <li key={mistake}>{mistake}</li>
                ))}
              </ul>
            </article>
          </section>

          <section className="panel-card" style={{ marginTop: 24 }}>
            <div className="eyebrow">Learning path</div>
            <div className="card-grid" style={{ marginTop: 16 }}>
              {[
                {
                  title: 'Overview',
                  content: 'Study the strategic idea, trigger, and tactical finish before drilling it.',
                  href: `/traps/${trap.id}`,
                  cta: 'Current page',
                },
                {
                  title: 'Watch',
                  content: 'See the entire sequence auto-play with square highlights and move-by-move explanation.',
                  href: `/watch/${trap.id}`,
                  cta: 'Play animation',
                },
                {
                  title: 'Tour',
                  content: 'Answer each black move with hints and immediate backend validation.',
                  href: `/tour/${trap.id}`,
                  cta: 'Start guided tour',
                },
                {
                  title: 'Practice',
                  content: 'Execute the full trap yourself and finish with accuracy and time tracking.',
                  href: `/practice/${trap.id}`,
                  cta: 'Practice now',
                },
              ].map((modeCard) => (
                <Link key={modeCard.title} href={modeCard.href} className="panel-card" style={{ padding: 18 }}>
                  <div className="eyebrow">{modeCard.title}</div>
                  <strong style={{ display: 'block', marginTop: 6 }}>{modeCard.cta}</strong>
                  <p className="muted-copy" style={{ lineHeight: 1.6, marginBottom: 0 }}>
                    {modeCard.content}
                  </p>
                </Link>
              ))}
            </div>

            <div className="eyebrow" style={{ marginTop: 24 }}>Lesson steps</div>
            <div className="card-grid" style={{ marginTop: 16 }}>
              {(lesson?.steps ?? []).map((step) => (
                <div key={step.stepNumber} className="panel-card" style={{ padding: 18 }}>
                  <div className="eyebrow">Step {step.stepNumber}</div>
                  <strong style={{ display: 'block', marginTop: 6 }}>{step.title}</strong>
                  <p className="muted-copy" style={{ lineHeight: 1.6 }}>{step.content}</p>
                  {step.hint ? <span className="soft-pill">Hint: {step.hint}</span> : null}
                </div>
              ))}
            </div>
          </section>
        </>
      ) : error ? (
        <section className="panel-card" style={{ background: '#f8e1db', color: '#702d22' }}>
          {error}
        </section>
      ) : (
        <section className="panel-card">Loading trap details...</section>
      )}
    </main>
  );
}