import styles from '../app.module.css';

const agents = [
  {
    title: 'Research Brief Agent',
    text: 'Summarizes a topic, gathers evidence, and returns a concise brief.',
    tags: ['Research', 'Citations', 'Fast'],
  },
  {
    title: 'Support Triage Agent',
    text: 'Classifies incoming requests and prepares an answer draft.',
    tags: ['Support', 'Triage', 'Draft'],
  },
  {
    title: 'Meeting Prep Agent',
    text: 'Turns context into an agenda, highlights, and next steps.',
    tags: ['Meetings', 'Agenda', 'Notes'],
  },
  {
    title: 'Workflow Refiner Agent',
    text: 'Converts a rough task list into a structured execution plan.',
    tags: ['Planning', 'Steps', 'Clarity'],
  },
];

export default function AgentsPage() {
  return (
    <div className={styles.page}>
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <div className={styles.sectionLabel}>Agents</div>
            <h1 className={styles.sectionTitle}>Approved agents only</h1>
          </div>
          <span className={styles.pill}>No creation flow</span>
        </div>
        <p className={styles.sectionText}>
          Users choose from the curated agents below. Each one is ready to run, and the backend handles the actual
          execution logic.
        </p>
      </section>

      <section className={styles.routeList}>
        {agents.map((agent) => (
          <article key={agent.title} className={styles.listItem}>
            <div className={styles.metaRow}>
              <div>
                <p className={styles.routeTitle}>{agent.title}</p>
                <p className={styles.cardText}>{agent.text}</p>
              </div>
              <span className={styles.pill}>Ready</span>
            </div>
            <div className={styles.tagRow}>
              {agent.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
