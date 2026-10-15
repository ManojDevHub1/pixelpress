import React from 'react';
import { ImageItem } from '../features/image-processing/image-types';
import { formatBytes } from '../lib/format-bytes';

interface QueueItemProps {
  item: ImageItem;
  isActive: boolean;
  disabled: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onDownload: (item: ImageItem) => void;
}

export const QueueItem: React.FC<QueueItemProps> = ({
  item,
  isActive,
  disabled,
  onSelect,
  onRemove,
  onDownload,
}) => {
  const isDone = item.status === 'done' && item.resultBlob;
  const isLarger = isDone && item.resultBlob!.size > item.file.size;

  let statusText = 'Ready to compress';
  if (item.status === 'processing') {
    statusText = 'Processing…';
  } else if (item.status === 'error') {
    statusText = 'Could not process';
  } else if (isDone) {
    statusText = `${formatBytes(item.resultBlob!.size)}${item.isStale ? ' (Stale)' : ' · ready'}`;
  }

  return (
    <li
      className={`queue-item ${isActive ? 'active' : ''}`}
      role="listitem"
    >
      <button
        type="button"
        className="queue-select"
        onClick={() => onSelect(item.id)}
        disabled={disabled}
        aria-current={isActive ? 'true' : undefined}
        aria-label={`Inspect ${item.file.name}`}
      >
        <img
          src={item.previewUrl}
          alt=""
          className="queue-thumb"
          loading="lazy"
        />
        <span className="queue-meta">
          <span className="queue-name" title={item.file.name}>
            {item.file.name}
          </span>
          <span className="queue-size">{formatBytes(item.file.size)}</span>
          <span
            className={`queue-status ${
              item.status === 'done'
                ? isLarger
                  ? 'error'
                  : 'done'
                : item.status === 'error'
                ? 'error'
                : ''
            }`}
          >
            {statusText}
          </span>
        </span>
      </button>

      <div className="queue-actions">
        {isDone && (
          <button
            type="button"
            className="icon-button"
            onClick={() => onDownload(item)}
            title={`Download ${item.outputName}`}
            aria-label={`Download ${item.outputName}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 15V3m0 12l-4-4m4 4l4-4" />
              <path d="M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17" />
            </svg>
          </button>
        )}

        <button
          type="button"
          className="icon-button"
          onClick={() => onRemove(item.id)}
          disabled={disabled}
          title={`Remove ${item.file.name}`}
          aria-label={`Remove ${item.file.name}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3" />
          </svg>
        </button>
      </div>
    </li>
  );
};
