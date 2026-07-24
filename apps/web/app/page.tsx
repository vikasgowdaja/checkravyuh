'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import {
  fetchJson,
  featuredTrapId,
  type ApiStatus,
  type CatalogPreview,
  type OpeningSummary,
  type ReviewResponse,
} from '../lib/api';
import { buildCurriculumSections } from '../lib/curriculum-groups';

export default function Page() {
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [catalogPreview, setCatalogPreview] = useState<CatalogPreview | null>(null);
  const [openings, setOpenings] = useState<OpeningSummary[]>([]);
  const [review, setReview] = useState<ReviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const curriculumSections = useMemo(() => buildCurriculumSections(openings), [openings]);
  const liveSection = curriculumSections.find((section) => section.status === 'live');
  const plannedSection = curriculumSections.find((section) => section.status === 'planned');

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const [statusData, catalogData, openingsData, reviewData] = await Promise.all([
          fetchJson<ApiStatus>('/'),
          fetchJson<CatalogPreview>('/catalog/preview'),
          fetchJson<OpeningSummary[]>('/openings'),
          fetchJson<ReviewResponse>('/review/today'),
        ]);

        if (!isMounted) {
          return;
        }

        setApiStatus(statusData);
        setCatalogPreview(catalogData);
        setOpenings(openingsData);
        setReview(reviewData);
        setError(null);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : 'Unable to load dashboard data.');
      }
    }

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="page-container">
      <section className="hero-grid">
        <div className="panel-card">
          <div className="eyebrow">Learner Dashboard</div>
          <h1 style={{ fontSize: '3.5rem', lineHeight: 1.02, margin: '12px 0 14px' }}>
            Trap curriculum grouped by side and opening family.
          </h1>
          <p className="muted-copy" style={{ fontSize: '1.06rem', lineHeight: 1.7, maxWidth: 760 }}>
            Against White is live now with playable black-side lessons. Against Black is scaffolded by
            opening families like 1.e4 e5 and 1.d4 d5 so the catalog can expand without a route rewrite.
          </p>
          <div className="action-row" style={{ marginTop: 22 }}>
            <Link href="/traps" className="action-button">
              Explore traps
            </Link>
            <Link href={`/watch/${featuredTrapId}`} className="action-button secondary">
              Watch featured trap
            </Link>
            <Link href={`/tour/${featuredTrapId}`} className="action-button secondary">
              Start guided tour
            </Link>
          </div>
        </div>

        <aside className="panel-card">
          <div className="eyebrow">Shared API status</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: 10 }}>
            {apiStatus?.status === 'ok' ? 'Connected' : 'Waiting'}
          </div>
          <p className="muted-copy" style={{ lineHeight: 1.6 }}>
            {apiStatus?.message ?? 'Start the NestJS API to hydrate the learner dashboard.'}
          </p>
          <div className="summary-grid" style={{ marginTop: 18 }}>
            <div>
              <div className="eyebrow">Phase</div>
              <strong>{apiStatus?.phase ?? 'Unknown'}</strong>
            </div>
            <div>
              <div className="eyebrow">Modules</div>
              <strong>{apiStatus?.modules.length ?? 0}</strong>
            </div>
            <div>
              <div className="eyebrow">Traps</div>
              <strong>{catalogPreview?.trapCount ?? 0}</strong>
            </div>
            <div>
              <div className="eyebrow">Due today</div>
              <strong>{review?.dueToday ?? 0}</strong>
            </div>
          </div>
        </aside>
      </section>

      {error ? (
        <section className="panel-card" style={{ marginTop: 22, background: '#f8e1db', color: '#702d22' }}>
          {error}
        </section>
      ) : null}

      <section className="summary-grid" style={{ marginTop: 24 }}>
        {[
          { label: 'Version 1 scope', value: '10 traps' },
          { label: 'Live side', value: liveSection?.title ?? 'Against White' },
          { label: 'Planned side', value: plannedSection?.title ?? 'Against Black' },
          { label: 'Review streak', value: String(review?.streak ?? 0) },
          { label: 'Live opening families', value: String(liveSection?.families.length ?? 0) },
        ].map((item) => (
          <article key={item.label} className="panel-card">
            <div className="eyebrow">{item.label}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: 10 }}>{item.value}</div>
          </article>
        ))}
      </section>

      <section className="split-grid" style={{ marginTop: 28 }}>
        <article className="panel-card">
          <div className="eyebrow">Featured trap</div>
          <h2 style={{ fontSize: '2rem', margin: '12px 0 10px' }}>
            {catalogPreview?.traps[0]?.title ?? 'Blackburne Shilling Trap'}
          </h2>
          <p className="muted-copy" style={{ lineHeight: 1.6 }}>
            Start with a guided route: overview, lesson, animated board practice, and review.
          </p>
          <div className="pill-row" style={{ marginTop: 16 }}>
            {(catalogPreview?.traps[0]
              ? [catalogPreview.traps[0].opening, catalogPreview.traps[0].difficulty]
              : ['Italian Game', 'intermediate']
            ).map((item) => (
              <span key={item} className="tag-chip">
                {item}
              </span>
            ))}
          </div>
          <div className="action-row" style={{ marginTop: 20 }}>
            <Link href={`/watch/${featuredTrapId}`} className="action-button secondary">
              Watch
            </Link>
            <Link href={`/tour/${featuredTrapId}`} className="action-button secondary">
              Tour
            </Link>
            <Link href={`/traps/${featuredTrapId}`} className="action-button">
              Trap details
            </Link>
            <Link href={`/practice/${featuredTrapId}`} className="action-button secondary">
              Practice
            </Link>
          </div>
        </article>

        <article className="panel-card">
          <div className="eyebrow">Review queue</div>
          <h2 style={{ fontSize: '2rem', margin: '12px 0 14px' }}>Keep the tactical pattern alive.</h2>
          <div className="card-grid">
            {(review?.queue ?? []).map((item) => (
              <Link key={item.trapId} href={`/traps/${item.trapId}`} className="panel-card" style={{ padding: 18 }}>
                <div className="eyebrow">{item.nextReview}</div>
                <strong style={{ display: 'block', marginTop: 6 }}>{item.title}</strong>
                <p className="muted-copy" style={{ marginBottom: 0 }}>Mastery {item.mastery}%</p>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}