import styles from './Timeline.module.css';

export default function Timeline({ phases, currentPhaseId, onSelectPhase }) {
    return (
        <nav className={styles.nav}>
            <ol className={styles.list}>
                {phases.map((phase, index) => {
                    const isActive = phase.id === currentPhaseId;
                    const isPast = phase.id < currentPhaseId;

                    return (
                        <li key={phase.id} className={styles.item}>
                            <button
                                className={`${styles.button} ${isActive ? styles.active : ''} ${isPast ? styles.past : ''}`}
                                onClick={() => onSelectPhase(phase.id)}
                            >
                                <span className={styles.pip}>
                                    {isPast ? '✓' : index + 1}
                                </span>
                                <span className={styles.label}>{phase.name}</span>
                            </button>
                            {index < phases.length - 1 && (
                                <div className={`${styles.line} ${isPast ? styles.lineFilled : ''}`} />
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
