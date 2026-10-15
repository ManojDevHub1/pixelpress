import React, { useState, useRef, useEffect } from 'react';

interface DropzoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
  disabled?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFilesSelected, disabled }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Prevent default browser behavior of opening files if dropped outside dropzone
    const preventDefaults = (e: DragEvent) => {
      e.preventDefault();
    };

    window.addEventListener('dragover', preventDefaults);
    window.addEventListener('drop', preventDefaults);

    return () => {
      window.removeEventListener('dragover', preventDefaults);
      window.removeEventListener('drop', preventDefaults);
    };
  }, []);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const handleChooseClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <section className="upload-card" aria-label="Upload images">
      <div
        className={`dropzone ${isDragOver ? 'dragover' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-content">
          <div className="upload-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 16V4m-5 5 5-5 5 5" />
              <path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" />
            </svg>
          </div>
          <h2>Drop images here to get started</h2>
          <p>Choose one image or a batch. We’ll show you the original, settings, and result side by side.</p>
          <button
            className="button button-primary"
            type="button"
            onClick={handleChooseClick}
            disabled={disabled}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Choose images
          </button>
          <span className="keyboard-note">Max 10 files · 20 MB each · Up to 30 MP</span>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleInputChange}
        aria-hidden="true"
        tabIndex={-1}
      />
      <div className="formats">
        Supported input: <strong>JPG · PNG · WebP</strong> <span>—</span> files never leave your device.
      </div>
    </section>
  );
};
