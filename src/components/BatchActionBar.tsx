import React from 'react';
import { ImageItem } from '../features/image-processing/image-types';
import { formatBytes } from '../lib/format-bytes';

interface BatchActionBarProps {
  files: ImageItem[];
  processing: boolean;
  onCompress: () => void;
  onDownloadZip: () => void;
}

export const BatchActionBar: React.FC<BatchActionBarProps> = ({
  files,
  processing,
  onCompress,
  onDownloadZip,
}) => {
  const totalInput = files.reduce((acc, f) => acc + f.file.size, 0);
  const completedItems = files.filter((f) => f.status === 'done' && f.resultBlob);
  const totalOutput = completedItems.reduce((acc, f) => acc + (f.resultBlob?.size || 0), 0);

  const hasResults = completedItems.length > 0;
  const allCompleted = files.length > 0 && completedItems.length === files.length;

  let spaceChangeText = '—';
  if (hasResults) {
    const inputForCompleted = completedItems.reduce((acc, f) => acc + f.file.size, 0);
    const delta = inputForCompleted - totalOutput;
    const pct = inputForCompleted ? Math.round((Math.abs(delta) / inputForCompleted) * 100) : 0;
    if (delta > 0) {
      spaceChangeText = `${pct}% smaller`;
    } else if (delta < 0) {
      spaceChangeText = `+${pct}% larger`;
    } else {
      spaceChangeText = 'No change';
    }
  }

  return (
    <div className="actionbar">
      <div className="action-summary">
        <div className="summary-cell">
          <strong>{formatBytes(totalInput)}</strong>
          <span>Original total</span>
        </div>
        <div className="summary-cell">
          <strong>{hasResults ? formatBytes(totalOutput) : '—'}</strong>
          <span>Output total</span>
        </div>
        <div className="summary-cell">
          <strong>{spaceChangeText}</strong>
          <span>Space change</span>
        </div>
      </div>

      <div className="action-buttons">
        <button
          type="button"
          className="button button-secondary"
          disabled={!hasResults || processing}
          onClick={onDownloadZip}
        >
          {allCompleted
            ? 'Download all (.zip)'
            : `Download ${completedItems.length} ready (.zip)`}
        </button>

        <button
          type="button"
          className="button button-primary"
          disabled={files.length === 0 || processing}
          onClick={onCompress}
        >
          {processing
            ? 'Processing…'
            : hasResults
            ? `Re-compress ${files.length} ${files.length === 1 ? 'image' : 'images'}`
            : `Compress ${files.length} ${files.length === 1 ? 'image' : 'images'} ↗`}
        </button>
      </div>
    </div>
  );
};
