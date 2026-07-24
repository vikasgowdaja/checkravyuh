'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { GuidedTrainer } from '../../components/guided-trainer';
import {
  fetchJson,
  type OpeningSummary,
  type TrapDetail,
  type TrapSummary,
  type TrapTrainingResponse,
} from '../../lib/api';

type TrapGroup = OpeningSummary & {
  traps: TrapSummary[];
};

export default function TrapsPage() {
  const [openings, setOpenings] = useState<OpeningSummary[]>([]);
  const [traps, setTraps] = useState<TrapSummary[]>([]);
  const [selectedTrapId, setSelectedTrapId] = useState<string | null>(null);
  const [selectedTrap, setSelectedTrap] = useState<TrapDetail | null>(null);
  const [selectedTraining, setSelectedTraining] = useState<TrapTrainingResponse | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [trapError, setTrapError] = useState<string | null>(null);
  const [trainingError, setTrainingError] = useState<string | null>(null);

  const trapGroups = useMemo<TrapGroup[]>(() => {
    const trapById = new Map(traps.map((trap) => [trap.id, trap] as const));

    return openings
      .filter((opening) => opening.trapIds.length > 0)
      .map((opening) => ({
        ...opening,
        traps: opening.trapIds
          .map((trapId) => trapById.get(trapId))
          .filter((trap): trap is TrapSummary => Boolean(trap)),
      }))
      .filter((opening) => opening.traps.length > 0);
  }, [openings, traps]);

  const flatTraps = useMemo(() => trapGroups.flatMap((opening) => opening.traps), [trapGroups]);

  const selectedTrapSummary = useMemo(
    () => flatTraps.find((trap) => trap.id === selectedTrapId) ?? null,
    [flatTraps, selectedTrapId]
  );

  useEffect(() => {
    let isMounted = true;

    async function loadTrapCatalog() {
      try {
        const [openingsData, trapsData] = await Promise.all([
          fetchJson<OpeningSummary[]>('/openings'),
          fetchJson<TrapSummary[]>('/traps'),
        ]);

        if (!isMounted) {
          return;
        }

        setOpenings(openingsData);
        setTraps(trapsData);
        setCatalogError(null);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setCatalogError(loadError instanceof Error ? loadError.message : 'Unable to load trap catalog.');
      }
    }

    void loadTrapCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (flatTraps.length === 0) {
      return;
    }

    if (!selectedTrapId || !flatTraps.some((trap) => trap.id === selectedTrapId)) {
      setSelectedTrapId(flatTraps[0].id);
    }
  }, [flatTraps, selectedTrapId]);

  useEffect(() => {
    if (!selectedTrapId) {
      return;
    }

    let isMounted = true;
    setSelectedTrap(null);
    setTrapError(null);

    async function loadSelectedTrap() {
      try {
        const trapData = await fetchJson<TrapDetail>(`/traps/${selectedTrapId}`);

        if (!isMounted) {
          return;
        }

        setSelectedTrap(trapData);
        setTrapError(null);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setTrapError(loadError instanceof Error ? loadError.message : 'Unable to load trap details.');
      }
    }

    void loadSelectedTrap();

    return () => {
      isMounted = false;
    };
  }, [selectedTrapId]);

  useEffect(() => {
    if (!selectedTrapId) {
      return;
    }

    let isMounted = true;
    setSelectedTraining(null);
    setTrainingError(null);

    async function loadSelectedTraining() {
      try {
        const trainingData = await fetchJson<TrapTrainingResponse>(`/traps/${selectedTrapId}/training`);

        if (!isMounted) {
          return;
        }

        setSelectedTraining(trainingData);
        setTrainingError(null);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setTrainingError(loadError instanceof Error ? loadError.message : 'Unable to load hands-on training.');
      }
    }

    void loadSelectedTraining();

    return () => {
      isMounted = false;
    };
  }, [selectedTrapId]);

  return (
    <main className="page-container">
      {catalogError ? (
        <section className="panel-card" style={{ background: '#f8e1db', color: '#702d22' }}>
          {catalogError}
        </section>
      ) : null}

      <section className="catalog-layout" style={{ marginTop: catalogError ? 24 : 0 }}>
        <aside className="catalog-sidebar panel-card">
          <div className="eyebrow">Trap options</div>
          <h1 className="catalog-sidebar-title">Traps</h1>
          <p className="muted-copy catalog-sidebar-copy">
            Simple access on the left. Pick one trap and work with its details and hands-on space on the right.
          </p>
          <div className="pill-row" style={{ marginTop: 16 }}>
            <span className="soft-pill">{traps.length} traps</span>
            <span className="soft-pill">{trapGroups.length} openings</span>
          </div>

          <div className="catalog-sidebar-groups">
            {trapGroups.map((opening) => (
              <section key={opening.id} className="catalog-sidebar-group">
                <div className="catalog-sidebar-group-header">
                  <div>
                    <div className="eyebrow">{opening.eco}</div>
                    <strong>{opening.name}</strong>
                  </div>
                  <span className="catalog-sidebar-count">{opening.traps.length}</span>
                </div>
                <div className="catalog-sidebar-list">
                  {opening.traps.map((trap) => {
                    const isActive = trap.id === selectedTrapId;

                    return (
                      <button
                        key={trap.id}
                        type="button"
                        className={`catalog-sidebar-item ${isActive ? 'active' : ''}`}
                        aria-pressed={isActive}
                        onClick={() => {
                          setSelectedTrapId(trap.id);
                        }}
                      >
                        <span className="catalog-sidebar-item-title">{trap.title}</span>
                        <span className="catalog-sidebar-item-meta">{trap.difficulty}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <Link href="/openings" className="action-button secondary" style={{ marginTop: 20, alignSelf: 'flex-start' }}>
            View curriculum map
          </Link>
        </aside>

        <div className="catalog-main">
          {trapError ? (
            <section className="panel-card" style={{ background: '#f8e1db', color: '#702d22' }}>
              {trapError}
            </section>
          ) : selectedTrap ? (
            <>
              <section className="catalog-overview panel-card">
                <div className="eyebrow">Overview</div>
                <h2 style={{ fontSize: '3rem', margin: '12px 0 12px' }}>{selectedTrap.title}</h2>
                <p className="muted-copy" style={{ lineHeight: 1.6, maxWidth: 760 }}>
                  {selectedTrapSummary?.opening ?? selectedTrap.opening.name} trap overview with direct study,
                  practice, tour, and watch actions.
                </p>
                <div className="pill-row" style={{ marginTop: 16 }}>
                  <span className="soft-pill">{selectedTrap.opening.name}</span>
                  <span className="soft-pill">{selectedTrap.difficulty}</span>
                  <span className="soft-pill">{selectedTrap.estimatedMinutes} min</span>
                  <span className="soft-pill">{selectedTrap.engineEvaluation}</span>
                </div>
              </section>

              <section className="split-grid">
                <article className="panel-card">
                  <div className="eyebrow">Selected trap</div>
                  <h3 style={{ fontSize: '2rem', margin: '12px 0 12px' }}>{selectedTrap.title}</h3>
                  <p className="muted-copy" style={{ lineHeight: 1.7 }}>{selectedTrap.summary}</p>
                  <p className="muted-copy" style={{ lineHeight: 1.6, marginTop: 18, marginBottom: 0 }}>
                    {selectedTrap.whenItWorks}
                  </p>
                </article>

                <aside className="panel-card">
                  <div className="eyebrow">Hands-on</div>
                  <h3 style={{ margin: '12px 0 10px' }}>Practice space for this trap</h3>
                  <p className="muted-copy" style={{ lineHeight: 1.6 }}>
                    Move from reading into action immediately. Open the animated walkthrough, guided tour,
                    or hands-on practice for the selected trap.
                  </p>
                  <div className="action-row" style={{ marginTop: 18 }}>
                    <Link href={`/practice/${selectedTrap.id}`} className="action-button">
                      Practice
                    </Link>
                    <Link href={`/tour/${selectedTrap.id}`} className="action-button secondary">
                      Tour
                    </Link>
                    <Link href={`/watch/${selectedTrap.id}`} className="action-button secondary">
                      Watch
                    </Link>
                    <Link href={`/traps/${selectedTrap.id}`} className="action-button secondary">
                      Full detail
                    </Link>
                  </div>
                  <div className="eyebrow" style={{ marginTop: 20 }}>Winning continuation</div>
                  <div className="move-sequence" style={{ marginTop: 12 }}>
                    {selectedTrap.winningContinuation.map((move) => (
                      <span key={move} className="move-chip">
                        {move}
                      </span>
                    ))}
                  </div>
                </aside>
              </section>

              <section className="card-grid">
                {[
                  ['Overview', selectedTrap.overview],
                  ['Idea', selectedTrap.idea],
                  ['When it works', selectedTrap.whenItWorks],
                  ['Warning', selectedTrap.warning],
                ].map(([title, content]) => (
                  <article key={title} className="panel-card" style={{ padding: 18 }}>
                    <div className="eyebrow">{title}</div>
                    <p className="muted-copy" style={{ lineHeight: 1.6, marginBottom: 0 }}>
                      {content}
                    </p>
                  </article>
                ))}
              </section>

              <section className="panel-card">
                <div className="eyebrow">Common mistakes</div>
                <ul style={{ paddingLeft: 18, lineHeight: 1.7, marginBottom: 0 }}>
                  {selectedTrap.commonMistakes.map((mistake) => (
                    <li key={mistake}>{mistake}</li>
                  ))}
                </ul>
                <div className="pill-row" style={{ marginTop: 18 }}>
                  {selectedTrap.tacticalMotifs.map((motif) => (
                    <span key={motif} className="tag-chip">
                      {motif}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <div className="panel-card">
                  <div className="eyebrow">Hands-on board</div>
                  <h3 style={{ margin: '12px 0 10px' }}>Practice this trap without leaving the catalog.</h3>
                  <p className="muted-copy" style={{ lineHeight: 1.6, marginBottom: 0 }}>
                    This uses the same backend-validated training flow as the dedicated practice route,
                    so you can start drilling the selected trap directly from this page.
                  </p>
                </div>

                <div style={{ marginTop: 20 }}>
                  {trainingError ? (
                    <section className="panel-card" style={{ background: '#f8e1db', color: '#702d22' }}>
                      {trainingError}
                    </section>
                  ) : selectedTraining ? (
                    <GuidedTrainer
                      key={selectedTrap.id}
                      trapId={selectedTrap.id}
                      mode="practice"
                      turns={selectedTraining.practice.turns}
                    />
                  ) : (
                    <section className="panel-card">Loading hands-on trainer...</section>
                  )}
                </div>
              </section>
            </>
          ) : (
            <section className="panel-card">Loading trap details...</section>
          )}
        </div>
      </section>
    </main>
  );
}