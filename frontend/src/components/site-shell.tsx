'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './site-shell.module.css';

const NAV_ITEMS = [
  { href: '/', label: 'Home', hint: 'Overview' },
  { href: '/agents', label: 'Agents', hint: 'Approved' },
  { href: '/workflows', label: 'Workflows', hint: 'Curated' },
  { href: '/schedule', label: 'Schedule', hint: 'Cron' },
  { href: '/runs', label: 'Runs', hint: 'History' },
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className={styles.shell}>
      <header className={styles.navbar}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandMark} />
          <span>
            <span className={styles.brandName}>Signal Forge</span>
            <span className={styles.brandTag}>Curated agents and scheduled workflows</span>
          </span>
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}>
                <span>{item.label}</span>
                <span className={styles.navHint}>{item.hint}</span>
              </Link>
            );
          })}
        </nav>
      </header>

      <main className={styles.content}>{children}</main>
    </div>
  );
}
