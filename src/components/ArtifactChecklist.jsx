import { useState } from 'react';
import styles from './ArtifactChecklist.module.css';

export default function ArtifactChecklist({ artifacts, onToggle }) {
    if (!artifacts || artifacts.length === 0) return null;

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Required Artifacts</h3>
            <ul className={styles.list}>
                {artifacts.map((artifact) => (
                    <li key={artifact.id} className={`${styles.item} ${artifact.status === 'done' ? styles.done : ''}`}>
                        <label className={styles.label}>
                            <input
                                type="checkbox"
                                checked={artifact.status === 'done'}
                                onChange={() => onToggle(artifact.id)}
                                className={styles.checkbox}
                            />
                            <span className={styles.checkmark}></span>
                            <div className={styles.content}>
                                <span className={styles.name}>{artifact.name}</span>
                                <span className={styles.owner}>{artifact.owner}</span>
                            </div>
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    );
}
