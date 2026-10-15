import React from 'react';
import { ImageItem, ImageMimeType } from '../features/image-processing/image-types';
import { formatBytes } from '../lib/format-bytes';
import { extensionFor } from '../lib/filename';

interface ComparePanelProps {
  item: ImageItem | null;
  targetFormat: ImageMimeType;
  onDownload: (item: ImageItem) => void;
}

export const ComparePanel: React.FC<ComparePanelProps> = ({
  item,
  targetFormat,
  onDownload,
}) => {
  if (!item) {
    return (
      <section className="panel preview-panel" aria-label="Original and compressed preview">
        <div className="panel-head">
          <h3 className="panel-title">Compare output</h3>
          <span className="tag">{extensionFor(targetFormat).toUpperCase()}</span>
        </div>
        <div className="preview-grid">
          <div className="preview-side">
            <div className="preview-label">
              <span>Original</span>
              <small>—</small>
            </div>
            <div className="image-stage">
              <div className="empty-preview">
                <strong>Choose an image</strong>
                The original preview appears here.
              </div>
            </div>
          </div>
          <div className="preview-side">
            <div className="preview-label">
              <span>Compressed</span>
              <small>Not ready</small>
            </div>
            <div className="image-stage">
              <div className="empty-preview">
                <strong>Your result</strong>
                Run compression to see the output.
              </div>
            </div>
          </div>
        </div>
        <div className="preview-foot">
          <span>Select a file in the queue to inspect it.</span>
        </div>
      </section>
    );
  }

  const isDone = item.status === 'done' && item.resultBlob && item.resultUrl;
  const isError = item.status === 'error';

  let deltaBytes = 0;
  let percentChange = 0;
  let isSmaller = false;
  let isLarger = false;

  if (isDone) {
    deltaBytes = item.file.size - item.resultBlob!.size;
    percentChange = item.file.size
      ? Math.round((Math.abs(deltaBytes) / item.file.size) * 100)
      : 0;
    isSmaller = deltaBytes > 0;
    isLarger = deltaBytes < 0;
  }

  return (
    <section className="panel preview-panel" aria-label="Original and compressed preview">
      <div className="panel-head">
        <h3 className="panel-title">Compare output</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {item.isStale && (
            <span className="tag" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
              Stale Settings
            </span>
          )}
          <span className="tag">{extensionFor(targetFormat).toUpperCase()}</span>
        </div>
      </div>

      <div className="preview-grid">
        <div className="preview-side">
          <div className="preview-label">
            <span>Original</span>
            <small>{item.width} × {item.height} · {formatBytes(item.file.size)}</small>
          </div>
          <div className="image-stage">
            <img
              src={item.previewUrl}
              alt={`Original image ${item.file.name}`}
            />
          </div>
        </div>

        <div className="preview-side">
          <div className="preview-label">
            <span>Compressed</span>
            <small>
              {isDone
                ? `${item.outWidth} × ${item.outHeight} · ${formatBytes(item.resultBlob!.size)}`
                : isError
                ? 'Error'
                : 'Not ready'}
            </small>
          </div>
          <div className="image-stage">
            {isDone ? (
              <img
                src={item.resultUrl!}
                alt={`Compressed result ${item.outputName}`}
              />
            ) : (
              <div className="empty-preview">
                <strong>{isError ? 'Output unavailable' : 'Ready to compress'}</strong>
                <span>{isError ? item.error : 'Click "Compress images" to process.'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="preview-foot">
        <div>
          {isDone ? (
            <span>
              {isSmaller && 'Compression complete. Visual quality preserved.'}
              {isLarger && 'Output is larger than original. Try WebP or lower quality.'}
              {!isSmaller && !isLarger && 'Output file size is identical to input.'}
            </span>
          ) : (
            <span>{isError ? item.error : 'Ready to run compression.'}</span>
          )}
        </div>

        <div className="preview-foot-actions">
          {isDone && (
            <>
              {isSmaller && (
                <span className="result-chip">
                  {percentChange}% smaller
                </span>
              )}
              {isLarger && (
                <span className="result-chip larger">
                  +{percentChange}% larger
                </span>
              )}
              {!isSmaller && !isLarger && (
                <span className="tag">Same size</span>
              )}

              <button
                type="button"
                className="button button-secondary"
                onClick={() => onDownload(item)}
                style={{ minHeight: '36px', padding: '0 12px', fontSize: '12px' }}
              >
                Download
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
