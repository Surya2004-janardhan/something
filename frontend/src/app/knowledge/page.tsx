import styles from '../app.module.css';

const knowledgeItems = [
  'Upload documents to a knowledge base.',
  'Search the uploaded content from agents.',
  'Keep context focused without a big configuration screen.',
];

export default function KnowledgePage() {
  return (
    <div className={styles.page}>
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <div className={styles.sectionLabel}>Knowledge</div>
            <h1 className={styles.sectionTitle}>Simple knowledge base support</h1>
          </div>
          <span className={styles.pill}>RAG ready</span>
        </div>
        <p className={styles.sectionText}>
          The backend has knowledge base routes, and this page explains the feature in a clean way for users.
        </p>
      </section>

      <section className={styles.routeList}>
        {knowledgeItems.map((item) => (
          <article key={item} className={styles.listItem}>
            <p className={styles.cardText}>{item}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
