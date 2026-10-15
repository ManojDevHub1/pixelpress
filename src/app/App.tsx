import React, { useState, useRef } from 'react';
import { AppHeader } from '../components/AppHeader';
import { Dropzone } from '../components/Dropzone';
import { FileQueue } from '../components/FileQueue';
import { ComparePanel } from '../components/ComparePanel';
import { OutputSettings } from '../components/OutputSettings';
import { BatchActionBar } from '../components/BatchActionBar';
import { ProgressStatus } from '../components/ProgressStatus';
import { PrivacyDialog } from '../components/PrivacyDialog';
import { Toast } from '../components/Toast';
import { useImageQueue } from '../hooks/useImageQueue';
import { useCompression } from '../hooks/useCompression';

export const App: React.FC = () => {
  const {
    files,
    selectedId,
    selectedItem,
    selectFile,
    addFiles,
    removeFile,
    clearQueue,
    updateItem,
    markStale,
  } = useImageQueue();

  const {
    settings,
    updateSettings,
    processing,
    progress,
    compressAll,
    downloadSingle,
    downloadZip,
  } = useCompression();

  const [modalState, setModalState] = useState<{
    kind: 'how' | 'privacy' | null;
    triggerEl: HTMLElement | null;
  }>({ kind: null, triggerEl: null });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const workspaceRef = useRef<HTMLElement>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleFilesSelected = async (incoming: FileList | File[]) => {
    const errors = await addFiles(incoming);

    if (errors.length > 0) {
      showToast(errors[0]);
    } else {
      const count = incoming.length;
      showToast(count === 1 ? 'Image added. Ready to compress.' : `${count} images added to queue.`);
      
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      workspaceRef.current?.scrollIntoView({
        behavior: prefersReduced ? 'auto' : 'smooth',
        block: 'start',
      });
    }
  };

  const handleSettingsChange = (partial: any) => {
    updateSettings(partial);
    markStale();
  };

  const handleCompress = async () => {
    const results = await compressAll(files, updateItem);
    if (results.failed === 0) {
      showToast('Compression finished! Compare before downloading.');
    } else if (results.successful > 0) {
      showToast(`${results.successful} compressed successfully, ${results.failed} had issues.`);
    } else {
      showToast('Images could not be compressed. Review format settings.');
    }
  };

  const handleDownloadZip = async () => {
    try {
      const count = await downloadZip(files);
      if (count > 0) {
        showToast(`ZIP ready with ${count} compressed ${count === 1 ? 'image' : 'images'}.`);
      }
    } catch (err: any) {
      showToast(`ZIP export failed: ${err?.message || 'Unknown error'}`);
    }
  };

  const openModal = (kind: 'how' | 'privacy', triggerEl: HTMLElement | null) => {
    setModalState({ kind, triggerEl });
  };

  const closeModal = () => {
    setModalState({ kind: null, triggerEl: modalState.triggerEl });
  };

  const hasFiles = files.length > 0;

  return (
    <div className="app">
      <AppHeader onOpenModal={openModal} />

      <main className="main" id="top">
        {!hasFiles && (
          <section className="intro">
            <div className="eyebrow">
              <span className="eyebrow-line" aria-hidden="true" />
              Less weight. More control.
              <span className="eyebrow-line" aria-hidden="true" />
            </div>
            <h1>
              Make images smaller.<br />
              <span className="highlight">Keep the control.</span>
            </h1>
            <p>Compress and convert images right on your device. No accounts, no uploads, zero servers.</p>
            <div className="trust-row" aria-label="Product guarantees">
              <span className="trust-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                Files stay on your machine
              </span>
              <span className="trust-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M4 5h16v14H4z" />
                  <path d="M8 9h8M8 13h5" />
                </svg>
                Batch-ready workflow
              </span>
              <span className="trust-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24m-14.14 0 4.24-4.24m5.66-5.66 4.24-4.24" />
                </svg>
                Adjustable quality
              </span>
            </div>
          </section>
        )}

        {!hasFiles && (
          <Dropzone onFilesSelected={handleFilesSelected} disabled={processing} />
        )}

        {hasFiles && (
          <section ref={workspaceRef} className="workspace" aria-label="Image compression workspace">
            <div className="workspace-top">
              <div>
                <div className="eyebrow">
                  <span className="eyebrow-line" aria-hidden="true" />
                  Image workspace
                </div>
                <h2 className="workspace-title">Your images, under control.</h2>
                <p className="workspace-desc">Tune output, inspect the result, then download.</p>
              </div>
              <div className="toolbar">
                <label className="button button-secondary" style={{ cursor: 'pointer', margin: 0 }}>
                  ＋ Add images
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={processing}
                    onChange={(e) => {
                      if (e.target.files) handleFilesSelected(e.target.files);
                      e.target.value = '';
                    }}
                  />
                </label>
                <button
                  type="button"
                  className="button button-quiet"
                  disabled={processing}
                  onClick={clearQueue}
                >
                  Clear all
                </button>
              </div>
            </div>

            <div className="workspace-grid">
              <FileQueue
                files={files}
                selectedId={selectedId}
                disabled={processing}
                onSelect={selectFile}
                onRemove={removeFile}
                onDownload={downloadSingle}
              />

              <ComparePanel
                item={selectedItem}
                targetFormat={settings.format}
                onDownload={downloadSingle}
              />

              <OutputSettings
                settings={settings}
                disabled={processing}
                onChange={handleSettingsChange}
              />
            </div>

            <ProgressStatus progress={progress} visible={processing} />

            <BatchActionBar
              files={files}
              processing={processing}
              onCompress={handleCompress}
              onDownloadZip={handleDownloadZip}
            />
          </section>
        )}
      </main>

      <footer className="footnote">
        <div>
          © PixelPress <span className="tag" style={{ marginLeft: '8px' }}>PWA Ready</span>
        </div>
        <div className="foot-links">
          <button type="button" onClick={(e) => openModal('how', e.currentTarget)}>
            How it works
          </button>
          <button type="button" onClick={(e) => openModal('privacy', e.currentTarget)}>
            Privacy note
          </button>
          <span>100% Client-Side Processing</span>
        </div>
      </footer>

      <PrivacyDialog
        kind={modalState.kind}
        triggerElement={modalState.triggerEl}
        onClose={closeModal}
      />

      <Toast message={toastMessage} />
    </div>
  );
};
export default App;
