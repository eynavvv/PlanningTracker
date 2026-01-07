import ArtifactChecklist from './ArtifactChecklist';
import GoNoGoGate from './GoNoGoGate';
import styles from './PhaseCard.module.css';

export default function PhaseCard({ phase, allArtifacts, onToggleArtifact, onGateDecision }) {
    const isGoNoGo = phase.gate?.type === 'GO_NO_GO';

    // Calculate if gate is open
    const missingArtifacts = isGoNoGo
        ? phase.gate.requiredArtifacts.filter(reqId => {
            // Find artifacts across all phases
            const artifact = allArtifacts.find(a => a.id === reqId);
            return !artifact || artifact.status !== 'done';
        })
        : [];

    const isGateOpen = missingArtifacts.length === 0;

    return (
        <div className={styles.card}>
            <header className={styles.header}>
                <span className={styles.week}>{phase.weekrange}</span>
                <h2 className={styles.title}>{phase.name}</h2>
                <div className={styles.meta}>
                    <span className={styles.label}>Owners:</span>
                    {phase.owner.map(o => <span key={o} className={styles.tag}>{o}</span>)}
                </div>
            </header>

            <p className={styles.description}>{phase.description}</p>

            <ArtifactChecklist
                artifacts={allArtifacts.filter(a => phase.artifacts.some(pa => pa.id === a.id))}
                onToggle={onToggleArtifact}
            />

            {isGoNoGo && (
                <GoNoGoGate
                    isOpen={isGateOpen}
                    onDecision={onGateDecision}
                    missingArtifacts={missingArtifacts}
                />
            )}
        </div>
    );
}
