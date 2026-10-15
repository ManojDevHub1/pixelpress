import React from 'react';
import { ImageItem } from '../features/image-processing/image-types';
import { QueueItem } from './QueueItem';

interface FileQueueProps {
  files: ImageItem[];
  selectedId: string | null;
  disabled: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onDownload: (item: ImageItem) => void;
}

export const FileQueue: React.FC<FileQueueProps> = ({
  files,
  selectedId,
  disabled,
  onSelect,
  onRemove,
  onDownload,
}) => {
  return (
    <section className="panel queue-panel" aria-label="Image queue">
      <div className="panel-head">
        <h3 className="panel-title">File queue</h3>
        <span className="panel-kicker">
          {files.length} {files.length === 1 ? 'file' : 'files'}
        </span>
      </div>

      <ul className="queue-list" role="list">
        {files.map((item) => (
          <QueueItem
            key={item.id}
            item={item}
            isActive={item.id === selectedId}
            disabled={disabled}
            onSelect={onSelect}
            onRemove={onRemove}
            onDownload={onDownload}
          />
        ))}
      </ul>
    </section>
  );
};
