import styles from '../app.module.css';

const scheduleExamples = [
  { label: 'Weekday briefing', cron: '0 9 * * 1-5' },
  { label: 'Support sweep', cron: '*/30 * * * *' },
  { label: 'Monday meeting prep', cron: '0 8 * * 1' },
];

export default function SchedulePage() {
  return (
    <div className={styles.page}>
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <div className={styles.sectionLabel}>Schedule</div>
            <h1 className={styles.sectionTitle}>Set cron jobs for curated workflows</h1>
          </div>
          <span className={styles.pill}>Simple setup</span>
        </div>
        <p className={styles.sectionText}>
          Choose a workflow, add a cron expression, and toggle it on. That is the whole scheduling flow.
        </p>
      </section>

      <section className={styles.scheduleCard}>
        <div className={styles.grid2}>
          <label className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>Workflow</span>
            <select className={styles.select} defaultValue="research">
              <option value="research">Research brief</option>
              <option value="support">Support triage</option>
              <option value="meeting">Meeting prep</option>
            </select>
          </label>

          <label className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>Cron expression</span>
            <input className={styles.input} defaultValue="0 9 * * 1-5" />
          </label>
        </div>

        <div className={styles.fieldGroup} style={{ marginTop: 12 }}>
          <span className={styles.fieldLabel}>Run input</span>
          <textarea className={styles.textarea} defaultValue="Create a short actionable brief with clear next steps." />
        </div>

        <div className={styles.buttonRow} style={{ marginTop: 14 }}>
          <button className={styles.primaryButton}>Save schedule</button>
          <button className={styles.secondaryButton}>Preview next runs</button>
        </div>
      </section>

      <section className={styles.grid3}>
        {scheduleExamples.map((item) => (
          <article key={item.label} className={styles.summaryCard}>
            <p className={styles.cardTitle}>{item.label}</p>
            <p className={styles.cardText}>{item.cron}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
