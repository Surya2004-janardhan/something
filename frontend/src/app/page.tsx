import Link from 'next/link';
import styles from './app.module.css';

const quickRoutes = [
  {
    href: '/agents',
    title: 'Approved agents',
    text: 'Choose from curated agents instead of building new ones from scratch.',
    tags: ['Read only', 'Template based'],
  },
  {
    href: '/workflows',
    title: 'Curated workflows',
    text: 'Use predefined workflows that can be scheduled and run on demand.',
    tags: ['No builder', 'Predefined'],
  },
  {
    href: '/schedule',
    title: 'Cron schedules',
    text: 'Set recurring jobs for workflows with a simple cron expression.',
    tags: ['Cron', 'Enabled toggle'],
  },
];

export default function HomePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.kicker}>
            <span className={styles.badge}>Curated workbench</span>
            <span>Defined agents, predefined workflows, and cron scheduling</span>
          </div>
          <h1 className={styles.title}>A focused system for agent runs and scheduled workflows.</h1>
          <p className={styles.subtitle}>
            Users do not build workflows here. They pick approved agents, choose from curated workflows, and set
            schedules in a simple way. The interface stays compact and the backend does the heavy lifting.
          </p>
          <div className={styles.heroActions}>
            <Link href="/agents" className={styles.primaryButton}>
              Explore agents
            </Link>
            <Link href="/workflows" className={styles.secondaryButton}>
              View workflows
            </Link>
            <Link href="/schedule" className={styles.ghostButton}>
              Set schedule
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <div className={styles.sectionLabel}>Routes</div>
            <h2 className={styles.sectionTitle}>Choose one clear action</h2>
          </div>
          <span className={styles.pill}>Clear navigation</span>
        </div>

        <div className={styles.grid3}>
          {quickRoutes.map((route) => (
            <Link key={route.href} href={route.href} className={styles.routeCard}>
              <p className={styles.routeTitle}>{route.title}</p>
              <p className={styles.cardText}>{route.text}</p>
              <div className={styles.tagRow}>
                {route.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
