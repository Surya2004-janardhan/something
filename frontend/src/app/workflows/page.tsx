import styles from '../app.module.css';

const workflows = [
  {
    title: 'Research brief',
    description: 'Collect context, synthesize it, and package a final brief for review.',
    cron: '0 9 * * 1-5',
    steps: ['Research', 'Refine', 'Package'],
  },
  {
    title: 'Support triage',
    description: 'Classify messages, summarize issues, and draft a reply.',
    cron: '*/30 * * * *',
    steps: ['Classify', 'Draft', 'Escalate'],
  },
  {
    title: 'Meeting prep',
    description: 'Generate the agenda and prep notes for a team meeting.',
    cron: '0 8 * * 1',
    steps: ['Agenda', 'Notes', 'Action items'],
  },
];

export default function WorkflowsPage() {
  return (
    <div className={styles.page}>
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <div className={styles.sectionLabel}>Workflows</div>
            <h1 className={styles.sectionTitle}>Curated workflows, no builder</h1>
          </div>
          <span className={styles.pill}>Schedule only</span>
        </div>
        <p className={styles.sectionText}>
          These workflows are predefined. Users can run them or attach a cron schedule, but they do not create new
          workflow graphs here.
        </p>
      </section>

      <section className={styles.routeList}>
        {workflows.map((workflow) => (
          <article key={workflow.title} className={styles.listItem}>
            <div className={styles.metaRow}>
              <div>
                <p className={styles.routeTitle}>{workflow.title}</p>
                <p className={styles.cardText}>{workflow.description}</p>
              </div>
              <span className={styles.pill}>{workflow.cron}</span>
            </div>
            <div className={styles.tagRow}>
              {workflow.steps.map((step) => (
                <span key={step} className={styles.tag}>
                  {step}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
