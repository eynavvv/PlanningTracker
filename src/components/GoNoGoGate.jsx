import styles from './GoNoGoGate.module.css';

export default function GoNoGoGate({ isOpen, onDecision, missingArtifacts }) {
    return (
        <div className={`${styles.gate} ${isOpen ? styles.open : styles.closed}`}>
            <div className={styles.header}>
                <div className={styles.icon}>
                    {isOpen ? '🚀' : '🛑'}
                </div>
                <div className={styles.info}>
                    <h3>Go / No-Go Decision</h3>
                    <p>
                        {isOpen
                            ? "All artifacts are ready. The team can proceed to development."
                            : "Prerequisites not met. Complete all artifacts to pass."}
                    </p>
                </div>
            </div>

            {!isOpen && missingArtifacts.length > 0 && (
                <div className={styles.blockers}>
                    <span>Missing:</span>
                    {missingArtifacts.map(id => (
                        <span key={id} className={styles.tag}>{id.replace('_', ' ')}</span>
                    ))}
                </div>
            )}

            <div className={styles.actions}>
                <button
                    className={styles.button}
                    disabled={!isOpen}
                    onClick={onDecision}
                >
                    {isOpen ? 'Approve & Start Dev' : 'Cannot Proceed'}
                </button>
            </div>
        </div>
    );
}
