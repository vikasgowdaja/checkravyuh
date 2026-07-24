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

        setTrainingError(loadError instanceof Error ? loadError.message : 'Unable to load training.');
      }
    }

    void loadSelectedTraining();

    return () => {
      isMounted = false;
    };
  }, [selectedTrapId]);

  return (
    <main className="traps-page">
      {catalogError ? (
        <div className="traps-error">{catalogError}</div>
      ) : null}

      {/* Trap toolbar - thin, always visible */}
      {selectedTrap ? (
        <div className="trap-toolbar">
          <div className="trap-toolbar-info">
            <strong>{selectedTrap.title}</strong>
            <span className="trap-toolbar-meta">
              {selectedTrap.opening.name} &middot; {selectedTrap.difficulty} &middot; {selectedTrap.estimatedMinutes} min
            </span>
          </div>
          <div className="trap-toolbar-actions">
            <Link href={`/practice/${selectedTrap.id}`} className="action-button compact-button">
              Practice
            </Link>
            <Link href={`/tour/${selectedTrap.id}`} className="action-button secondary compact-button">
              Tour
            </Link>
            <Link href={`/watch/${selectedTrap.id}`} className="action-button secondary compact-button">
              Watch
            </Link>
          </div>
        </div>
      ) : null}

      {/* Main workspace: left nav + board + practice sidebar */}
      <div className="traps-layout">
        {/* Left: trap list navigation only */}
        <aside className="traps-nav">
          {trapGroups.map((opening) => (
            <section key={opening.id} className="traps-nav-group">
              <div className="traps-nav-group-title">{opening.name}</div>
              {opening.traps.map((trap) => {
                const isActive = trap.id === selectedTrapId;

                return (
                  <button
                    key={trap.id}
                    type="button"
                    className={`traps-nav-item ${isActive ? 'active' : ''}`}
                    aria-pressed={isActive}
                    onClick={() => {
                      setSelectedTrapId(trap.id);
                    }}
                  >
                    {trap.title}
                    {isActive ? <span className="traps-nav-dot" /> : null}
                  </button>
                );
              })}
            </section>
          ))}
        </aside>

        {/* Center + Right: Board and practice instructions (GuidedTrainer owns both) */}
        <div className="traps-workspace">
          {trapError || trainingError ? (
            <div className="traps-error">{trapError ?? trainingError}</div>
          ) : selectedTrap && selectedTraining ? (
            <GuidedTrainer
              key={selectedTrap.id}
              trapId={selectedTrap.id}
              mode="practice"
              turns={selectedTraining.practice.turns}
            />
          ) : (
            <div className="traps-loading">Loading board...</div>
          )}
        </div>
      </div>

      {/* Below board: secondary trap details */}
      {selectedTrap ? (
        <section className="trap-details">
          <div className="trap-details-header">
            <div className="eyebrow">Trap details</div>
            <h2 className="trap-details-title">{selectedTrap.title}</h2>
            <p className="trap-details-meta">
              {selectedTrap.opening.name} &middot; {selectedTrap.difficulty} &middot; {selectedTrap.engineEvaluation}
            </p>
          </div>

          <div className="trap-details-grid">
            <div className="trap-details-section">
              <div className="eyebrow">Summary</div>
              <p>{selectedTrap.summary}</p>
            </div>

            <div className="trap-details-section">
              <div className="eyebrow">Winning line</div>
              <div className="move-sequence">
                {selectedTrap.winningContinuation.map((move) => (
                  <span key={move} className="move-chip">{move}</span>
                ))}
              </div>
            </div>

            <div className="trap-details-section">
              <div className="eyebrow">When it works</div>
              <p>{selectedTrap.whenItWorks}</p>
            </div>

            <div className="trap-details-section">
              <div className="eyebrow">Common mistakes</div>
              <ul>
                {selectedTrap.commonMistakes.map((mistake) => (
                  <li key={mistake}>{mistake}</li>
                ))}
              </ul>
            </div>

            <div className="trap-details-section">
              <div className="eyebrow">Motifs</div>
              <div className="pill-row">
                {selectedTrap.tacticalMotifs.map((motif) => (
                  <span key={motif} className="tag-chip">{motif}</span>
                ))}
              </div>
            </div>

            <div className="trap-details-section">
              <div className="eyebrow">Idea</div>
              <p>{selectedTrap.idea}</p>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
