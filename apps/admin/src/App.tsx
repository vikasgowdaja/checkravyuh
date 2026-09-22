import { useEffect, useState } from 'react';

import { appTitle } from './app-title';

type AppSection = 'overview' | 'catalog' | 'system';

type ApiStatus = {
  name: string;
  status: string;
  message: string;
  phase: string;
  modules: string[];
};

type CatalogTrap = {
  id: string;
  title: string;
  opening: string;
  difficulty: string;
  status: string;
};

type CatalogPreview = {
  openingCount: number;
  trapCount: number;
  latestRelease: string;
  traps: CatalogTrap[];
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

const sectionLabels: Record<AppSection, string> = {
  overview: 'Overview',
  catalog: 'Catalog',
  system: 'System',
};

const commandList = ['npm run api:dev', 'npm run admin:dev', 'npm run api:test', 'npm run admin:test'];

const cardStyle = {
  padding: 20,
  borderRadius: 18,
  background: 'rgba(255,255,255,0.78)',
  boxShadow: '0 12px 28px rgba(31, 26, 20, 0.08)',
} as const;

export function App() {
  const [activeSection, setActiveSection] = useState<AppSection>('overview');
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [catalogPreview, setCatalogPreview] = useState<CatalogPreview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setError(null);

        const [statusResponse, catalogResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/`),
          fetch(`${apiBaseUrl}/catalog/preview`),
        ]);

        if (!statusResponse.ok || !catalogResponse.ok) {
          throw new Error('The API responded, but one or more dashboard requests failed.');
        }

        const statusPayload = (await statusResponse.json()) as ApiStatus;
        const catalogPayload = (await catalogResponse.json()) as CatalogPreview;

        setApiStatus(statusPayload);
        setCatalogPreview(catalogPayload);
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load the admin dashboard data.';
        setError(message);
      }
    }

    void loadDashboard();
  }, []);

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '40px 24px 64px',
        fontFamily: 'Segoe UI, sans-serif',
        background:
          'radial-gradient(circle at top left, #f8f2e8 0%, #efe7d8 35%, #d8c9af 100%)',
        color: '#1f1a14',
      }}
    >
      <section style={{ maxWidth: 1120, margin: '0 auto' }}>
        <p style={{ letterSpacing: '0.16em', textTransform: 'uppercase', fontSize: 12 }}>
          Milestone 0 Shell
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ maxWidth: 760 }}>
            <img
              src="/checkravyuh-logo.png"
              alt="Checkravyuh"
              style={{ width: 220, maxWidth: '100%', height: 'auto', display: 'block', marginBottom: 12 }}
            />
            <h1 style={{ fontSize: '3rem', margin: '8px 0 12px' }}>{appTitle}</h1>
            <p style={{ lineHeight: 1.6, fontSize: '1.05rem', margin: 0 }}>
              The admin shell is now connected to the same backend that the Android and future
              mobile app will use. It shows live system status and a backend-provided preview of
              the opening trap catalog instead of a purely static placeholder.
            </p>
          </div>
          <div
            style={{
              ...cardStyle,
              minWidth: 240,
              background: apiStatus?.status === 'ok' ? 'rgba(255,255,255,0.82)' : '#f8e1db',
            }}
          >
            <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              API Connection
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: 8 }}>
              {apiStatus?.status === 'ok' ? 'Connected' : 'Offline'}
            </div>
            <p style={{ margin: '10px 0 0', lineHeight: 1.5 }}>
              {apiStatus?.message ?? 'Start the NestJS API to load dashboard data.'}
            </p>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28 }}>
          {(Object.keys(sectionLabels) as AppSection[]).map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              style={{
                border: 'none',
                borderRadius: 999,
                padding: '12px 18px',
                cursor: 'pointer',
                fontWeight: 700,
                background: activeSection === section ? '#1f1a14' : 'rgba(255,255,255,0.78)',
                color: activeSection === section ? '#f6efe5' : '#1f1a14',
                boxShadow: '0 10px 24px rgba(31, 26, 20, 0.08)',
              }}
            >
              {sectionLabels[section]}
            </button>
          ))}
        </nav>

        {error ? (
          <div
            style={{
              marginTop: 24,
              padding: 18,
              borderRadius: 16,
              background: '#f8e1db',
              color: '#702d22',
            }}
          >
            {error}
          </div>
        ) : null}

        {activeSection === 'overview' ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
              marginTop: 24,
            }}
          >
            <article style={cardStyle}>
              <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Phase
              </div>
              <h2 style={{ margin: '10px 0 0', fontSize: '1.9rem' }}>
                {apiStatus?.phase ?? 'Unknown'}
              </h2>
            </article>
            <article style={cardStyle}>
              <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Enabled Modules
              </div>
              <h2 style={{ margin: '10px 0 0', fontSize: '1.9rem' }}>
                {apiStatus?.modules.length ?? 0}
              </h2>
            </article>
            <article style={cardStyle}>
              <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Trap Preview Count
              </div>
              <h2 style={{ margin: '10px 0 0', fontSize: '1.9rem' }}>
                {catalogPreview?.trapCount ?? 0}
              </h2>
            </article>
            <article style={cardStyle}>
              <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Latest Release
              </div>
              <h2 style={{ margin: '10px 0 0', fontSize: '1.9rem' }}>
                {catalogPreview?.latestRelease ?? 'Unavailable'}
              </h2>
            </article>
          </div>
        ) : null}

        {activeSection === 'catalog' ? (
          <div style={{ marginTop: 24, display: 'grid', gap: 16 }}>
            {catalogPreview?.traps.map((trap) => (
              <article
                key={trap.id}
                style={{
                  ...cardStyle,
                  display: 'grid',
                  gridTemplateColumns: '2fr 1.2fr 1fr 1.2fr',
                  gap: 16,
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    Trap
                  </div>
                  <h2 style={{ margin: '8px 0 0' }}>{trap.title}</h2>
                </div>
                <div>
                  <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    Opening
                  </div>
                  <p style={{ margin: '8px 0 0' }}>{trap.opening}</p>
                </div>
                <div>
                  <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    Difficulty
                  </div>
                  <p style={{ margin: '8px 0 0', textTransform: 'capitalize' }}>{trap.difficulty}</p>
                </div>
                <div>
                  <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    Status
                  </div>
                  <p style={{ margin: '8px 0 0', textTransform: 'capitalize' }}>{trap.status}</p>
                </div>
              </article>
            )) ?? null}
          </div>
        ) : null}

        {activeSection === 'system' ? (
          <div style={{ marginTop: 24, display: 'grid', gap: 16 }}>
            <article style={cardStyle}>
              <h2 style={{ marginTop: 0 }}>Current Run Loop</h2>
              <p style={{ lineHeight: 1.6 }}>
                Run the API and admin servers together to see a connected local application shell.
                This backend is intended to be shared by both the web frontend and the Android or
                mobile app. The mobile client still requires Flutter to be installed before it can
                be launched.
              </p>
              <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
                {commandList.map((command) => (
                  <code
                    key={command}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: '#1f1a14',
                      color: '#f6efe5',
                      fontSize: 14,
                    }}
                  >
                    {command}
                  </code>
                ))}
              </div>
            </article>
          </div>
        ) : null}
      </section>
    </main>
  );
}