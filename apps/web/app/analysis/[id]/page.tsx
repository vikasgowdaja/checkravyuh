'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { AnalysisWorkbench } from '../../../components/analysis-workbench';
import { fetchJson, type TrapDetail } from '../../../lib/api';

export default function AnalysisPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const trapId = params.id;
  const [trap, setTrap] = useState<TrapDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initialMoveIndex = useMemo(() => {
    const raw = searchParams.get('ply');
    const parsed = raw ? Number(raw) : 0;

    if (!Number.isFinite(parsed)) {
      return 0;
    }

    return Math.max(0, Math.trunc(parsed));
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;

    async function loadAnalysis() {
      try {
        const trapData = await fetchJson<TrapDetail>(`/traps/${trapId}`);

        if (!isMounted) {
          return;
        }

        setTrap(trapData);
        setError(null);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : 'Unable to load analysis game.');
      }
    }

    if (trapId) {
      void loadAnalysis();
    }

    return () => {
      isMounted = false;
    };
  }, [trapId]);

  return (
    <main className="page-container">
      {trap ? (
        <AnalysisWorkbench
          gameId={trap.id}
          title={trap.title}
          pgn={trap.pgn}
          startingFen={trap.startingFen}
          whitePlayer="Learner"
          blackPlayer="Trap trainer"
          initialMoveIndex={initialMoveIndex}
        />
      ) : error ? (
        <section className="panel-card" style={{ background: '#f8e1db', color: '#702d22' }}>
          {error}
        </section>
      ) : (
        <section className="panel-card">Loading analysis board...</section>
      )}
    </main>
  );
}
