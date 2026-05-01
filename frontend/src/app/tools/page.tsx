import styles from '../app.module.css';

const tools = ['Web search', 'File handling', 'API calls', 'Knowledge query'];

export default function ToolsPage() {
  return (
    <div className={styles.page}>
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <div className={styles.sectionLabel}>Tools</div>
            <h1 className={styles.sectionTitle}>Useful actions, not a crowded toolkit</h1>
          </div>
          <span className={styles.pill}>Built-in</span>
        </div>
        <p className={styles.sectionText}>
          The app exposes the main actions agents need without turning the interface into a developer console.
        </p>
      </section>

      <section className={styles.grid2}>
        {tools.map((tool) => (
          <article key={tool} className={styles.summaryCard}>
            <p className={styles.cardTitle}>{tool}</p>
            <p className={styles.cardText}>Available to curated agents and workflows as part of the backend logic.</p>
          </article>
        ))}
      </section>
    </div>
  );
}
