import type { Metadata } from 'next';
import Link from 'next/link';

import './globals.css';

export const metadata: Metadata = {
  title: 'Checkravyuh Web',
  description: 'Learner-facing web client for mastering chess opening traps.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="site-header__inner">
            <Link href="/" className="brand-lockup">
              <span className="brand-mark">Checkravyuh</span>
              <span className="brand-subtitle">Shared learner ecosystem</span>
            </Link>
            <nav className="site-nav" aria-label="Primary">
              <Link href="/">Dashboard</Link>
              <Link href="/traps">Traps</Link>
              <Link href="/practice/blackburne_shilling">Practice</Link>
              <Link href="/review">Review</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}