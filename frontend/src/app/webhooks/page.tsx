import styles from '../app.module.css';

const events = ['run.started', 'run.completed', 'run.failed', 'workflow.schedule.triggered'];

export default function WebhooksPage() {
  return (
    <div className={styles.page}>
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <div className={styles.sectionLabel}>Webhooks</div>
            <h1 className={styles.sectionTitle}>Event hooks for downstream systems</h1>
          </div>
          <span className={styles.pill}>External events</span>
        </div>
        <p className={styles.sectionText}>
          Users can subscribe external services to workflow and run events without dealing with a complicated config.
        </p>
      </section>

      <section className={styles.routeList}>
        {events.map((event) => (
          <article key={event} className={styles.listItem}>
            <p className={styles.cardTitle}>{event}</p>
            <p className={styles.cardText}>Delivered with a signed payload and retry support on the backend.</p>
          </article>
        ))}
      </section>
    </div>
  );
}
