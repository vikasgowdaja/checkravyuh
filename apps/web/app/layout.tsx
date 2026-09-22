import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import './globals.css';

export const metadata: Metadata = {
  title: 'Checkravyuh',
  description: 'Learner-facing web client for mastering chess opening traps.',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="site-header__inner">
            <Link href="/" className="brand-lockup">
              <Image
                src="/checkravyuh-logo.png"
                alt="Checkravyuh logo"
                width={44}
                height={44}
                className="brand-logo"
                priority
              />
              <span className="brand-text">
                <span className="brand-mark">Checkravyuh</span>
                <span className="brand-subtitle">Shared learner ecosystem</span>
              </span>
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