import React from 'react';
import { ProgressState } from '../hooks/useCompression';

interface ProgressStatusProps {
  progress: ProgressState;
  visible: boolean;
}

export const ProgressStatus: React.FC<ProgressStatusProps> = ({ progress, visible }) => {
  if (!visible || progress.total === 0) return null;

  const percent = Math.min(
    100,
    Math.round((progress.current / Math.max(1, progress.total)) * 100)
  );

  return (
    <div className="progress-wrap" role="region" aria-label="Compression progress">
      <div className="progress-head">
        <span>
          {progress.current < progress.total
            ? `Processing ${progress.currentName || 'files'}…`
            : 'Compression complete.'}
        </span>
        <span aria-live="polite">
          {progress.current} / {progress.total}
        </span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="progress-bar" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};
