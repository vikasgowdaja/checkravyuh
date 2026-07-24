'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { fetchJson, type OpeningSummary } from '../../lib/api';
import { buildCurriculumSections } from '../../lib/curriculum-groups';

export default function OpeningsPage() {
  const [openings, setOpenings] = useState<OpeningSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const curriculumSections = useMemo(() => buildCurriculumSections(openings), [openings]);

  useEffect(() => {
    let isMounted = true;

    async function loadOpenings() {
      try {
        const openingsData = await fetchJson<OpeningSummary[]>('/openings');

        if (!isMounted) {
          return;
        }

        setOpenings(openingsData);
        setError(null);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : 'Unable to load openings.');
      }
    }

    void loadOpenings();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="page-container">
      <section className="panel-card">
        <div className="eyebrow">Curriculum map</div>
        <h1 style={{ fontSize: '3rem', margin: '12px 0 12px' }}>Choose the side and opening family you want to train.</h1>
        <p className="muted-copy" style={{ lineHeight: 1.6, maxWidth: 760 }}>
          The live curriculum is grouped into Against White and Against Black lanes. Against White is
          playable now, and Against Black is scaffolded by families like 1.e4 e5 and 1.d4 d5 so you can
          grow the catalog without changing the learner routes.
        </p>
      </section>

      {error ? (
        <section className="panel-card" style={{ marginTop: 22, background: '#f8e1db', color: '#702d22' }}>
          {error}
        </section>
      ) : null}

      {curriculumSections.map((section) => (
        <section key={section.id} className="panel-card" style={{ marginTop: 24 }}>
          <div className="eyebrow">{section.title}</div>
          <h2 style={{ fontSize: '2.2rem', margin: '12px 0 10px' }}>{section.title}</h2>
          <p className="muted-copy" style={{ lineHeight: 1.6, maxWidth: 760 }}>{section.description}</p>
          <div className="pill-row" style={{ marginTop: 16 }}>
            <span className="soft-pill">
              {section.status === 'live' ? `${section.liveTrapCount} live traps` : 'Planned curriculum'}
            </span>
            <span className="soft-pill">{section.families.length} opening families</span>
          </div>

          <div className="card-grid" style={{ marginTop: 20 }}>
            {section.families.map((family) => (
              <article key={family.id} className="panel-card" style={{ padding: 22 }}>
                <div className="eyebrow">{family.moves}</div>
                <h3 style={{ margin: '10px 0 10px' }}>{family.title}</h3>
                <p className="muted-copy" style={{ lineHeight: 1.6 }}>{family.description}</p>

                <div className="pill-row" style={{ marginTop: 16 }}>
                  <span className="soft-pill">
                    {family.isLive ? `${family.openings.length} openings` : 'Coming soon'}
                  </span>
                  <span className="soft-pill">
                    {family.trapCount > 0 ? `${family.trapCount} traps` : 'No live traps yet'}
                  </span>
                  {family.trapIdeas.length > 0 ? <span className="soft-pill">{family.trapIdeas.length} bucket ideas</span> : null}
                </div>

                {family.isLive ? (
                  <>
                    <div className="eyebrow" style={{ marginTop: 18 }}>Playable openings</div>
                    <div className="card-grid" style={{ marginTop: 12 }}>
                      {family.openings.map((opening) => (
                        <div key={opening.id} className="panel-card" style={{ padding: 18 }}>
                          <div className="eyebrow">{opening.eco}</div>
                          <strong style={{ display: 'block', marginTop: 8 }}>{opening.name}</strong>
                          <p className="muted-copy" style={{ lineHeight: 1.6 }}>{opening.description}</p>
                          <div className="pill-row" style={{ marginTop: 12 }}>
                            <span className="soft-pill">{opening.trapCount} traps</span>
                            <span className="soft-pill">{opening.difficulty}</span>
                          </div>
                          <div className="action-row" style={{ marginTop: 16 }}>
                            <Link href={`/traps/${opening.trapIds[0]}`} className="action-button">
                              Open first trap
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : family.trapIdeas.length === 0 ? (
                  <p className="muted-copy" style={{ marginTop: 18, marginBottom: 0 }}>
                    This family is scaffolded so you can add White-side trap lines against Black here later.
                  </p>
                ) : null}

                {family.trapIdeas.length > 0 ? (
                  <>
                    <div className="eyebrow" style={{ marginTop: 18 }}>Bucket traps</div>
                    <div className="card-grid" style={{ marginTop: 12 }}>
                      {family.trapIdeas.map((trapIdea) => (
                        <article key={trapIdea.id} className="panel-card" style={{ padding: 18 }}>
                          <div className="eyebrow">{trapIdea.line}</div>
                          <strong style={{ display: 'block', marginTop: 8 }}>{trapIdea.title}</strong>
                          <p className="muted-copy" style={{ lineHeight: 1.6 }}>{trapIdea.summary}</p>
                          <div className="pill-row" style={{ marginTop: 12 }}>
                            <span className="soft-pill">{trapIdea.status === 'live' ? 'Live lesson' : 'Planned lesson'}</span>
                            {trapIdea.themes.map((theme) => (
                              <span key={theme} className="soft-pill">{theme}</span>
                            ))}
                          </div>
                          <div className="action-row" style={{ marginTop: 16 }}>
                            {trapIdea.trapId ? (
                              <Link href={`/practice/${trapIdea.trapId}`} className="action-button secondary">
                                Practice trap
                              </Link>
                            ) : (
                              <span className="soft-pill">Curriculum bucket only</span>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  </>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}