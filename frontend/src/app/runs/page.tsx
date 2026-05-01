import styles from '../app.module.css';

const runs = [
  { title: 'Research brief', status: 'Completed', detail: 'Returned on schedule with citations and a short summary.' },
  { title: 'Support triage', status: 'Running', detail: 'Drafting replies for the newest queue items.' },
  { title: 'Meeting prep', status: 'Queued', detail: 'Waiting for the weekly cron trigger.' },
];

export default function RunsPage() {
  return (
    <div className={styles.page}>
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <div className={styles.sectionLabel}>Runs</div>
            <h1 className={styles.sectionTitle}>Execution history at a glance</h1>
          </div>
          <span className={styles.pill}>Traceable</span>
        </div>
        <p className={styles.sectionText}>
          This page keeps enough context for the user to understand what ran, what is running, and what is waiting.
        </p>
      </section>

      <section className={styles.runList}>
        {runs.map((run) => (
          <article key={run.title} className={styles.listItem}>
            <div className={styles.metaRow}>
              <div>
                <p className={styles.routeTitle}>{run.title}</p>
                <p className={styles.cardText}>{run.detail}</p>
              </div>
              <span className={styles.pill}>{run.status}</span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
