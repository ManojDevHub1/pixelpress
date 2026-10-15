import React, { useEffect, useRef } from 'react';

interface PrivacyDialogProps {
  kind: 'how' | 'privacy' | null;
  triggerElement: HTMLElement | null;
  onClose: () => void;
}

export const PrivacyDialog: React.FC<PrivacyDialogProps> = ({
  kind,
  triggerElement,
  onClose,
}) => {
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!kind) return;

    // Focus close button on open
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Focus trap
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      triggerElement?.focus();
    };
  }, [kind, onClose, triggerElement]);

  if (!kind) return null;

  const isPrivacy = kind === 'privacy';

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modalTitle"
      >
        <div className="modal-head">
          <h2 id="modalTitle">
            {isPrivacy ? 'Your files stay in this tab.' : 'How PixelPress works'}
          </h2>
          <button
            ref={closeButtonRef}
            className="modal-close"
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="modal-content">
          {isPrivacy ? (
            <>
              <p>
                PixelPress runs 100% in your browser using client-side image APIs. Selected image bytes are never sent to a server, and this app makes zero network requests for analytics or tracking.
              </p>
              <ul>
                <li>Image decoding, resizing, and encoding occur entirely on your local machine.</li>
                <li>Temporary memory object URLs are revoked upon removal or clearing the queue.</li>
                <li>No backend, database, or third-party telemetry scripts are installed.</li>
                <li>Disconnecting your internet will not interrupt any functionality.</li>
              </ul>
              <div style={{ marginTop: '16px' }}>
                <span className="tag">No backend · No database · No API</span>
              </div>
            </>
          ) : (
            <>
              <p>The workflow is intentionally streamlined and batch-friendly:</p>
              <ul>
                <li><strong>1. Add files:</strong> Choose or drag JPG, PNG, or WebP images (up to 10 files, 20 MB each).</li>
                <li><strong>2. Configure:</strong> Adjust quality for lossy formats (WebP/JPEG), enable optional resizing, or select a matte background for JPEG transparency.</li>
                <li><strong>3. Compare & Download:</strong> Inspect before/after dimensions and byte savings, then download single files or an organized batch ZIP archive.</li>
              </ul>
              <p style={{ marginTop: '12px' }}>
                Note: Native browser PNG export is lossless. For photos, WebP and JPEG yield significant size reductions.
              </p>
            </>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button type="button" className="button button-primary" onClick={onClose}>
            Got it
          </button>
        </div>
      </section>
    </div>
  );
};
