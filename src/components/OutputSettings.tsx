import React from 'react';
import { CompressionSettings, ImageMimeType } from '../features/image-processing/image-types';

interface OutputSettingsProps {
  settings: CompressionSettings;
  disabled: boolean;
  onChange: (partial: Partial<CompressionSettings>) => void;
}

export const OutputSettings: React.FC<OutputSettingsProps> = ({
  settings,
  disabled,
  onChange,
}) => {
  const isLossy = settings.format === 'image/jpeg' || settings.format === 'image/webp';
  const isJpeg = settings.format === 'image/jpeg';
  const isPng = settings.format === 'image/png';

  return (
    <aside className="panel settings-panel" aria-label="Compression settings">
      <div className="panel-head">
        <h3 className="panel-title">Output settings</h3>
        <span className="panel-kicker">Local-only</span>
      </div>

      <div className="settings-body">
        {/* Output Format */}
        <div className="field">
          <div className="field-label-row">
            <label htmlFor="formatSelect">Output format</label>
          </div>
          <select
            id="formatSelect"
            className="control"
            value={settings.format}
            disabled={disabled}
            onChange={(e) => onChange({ format: e.target.value as ImageMimeType })}
          >
            <option value="image/webp">WebP · modern, smaller size</option>
            <option value="image/jpeg">JPEG · universal photo compatibility</option>
            <option value="image/png">PNG · lossless graphics</option>
          </select>
          <div className="field-help">
            {isPng && 'PNG export in browser is lossless. File size may not decrease.'}
            {settings.format === 'image/webp' && 'WebP provides strong lossy and lossless compression for web use.'}
            {isJpeg && 'JPEG does not support transparency. Transparent areas receive a matte background.'}
          </div>
        </div>

        {/* Quality Slider (Lossy only) */}
        {isLossy && (
          <div className="field" id="qualityField">
            <div className="field-label-row">
              <label htmlFor="qualityRange">Image quality</label>
              <span className="quality-value">{settings.quality}%</span>
            </div>
            <input
              type="range"
              id="qualityRange"
              min="35"
              max="100"
              step="1"
              value={settings.quality}
              disabled={disabled}
              aria-valuemin={35}
              aria-valuemax={100}
              aria-valuenow={settings.quality}
              aria-valuetext={`${settings.quality} percent`}
              onChange={(e) => onChange({ quality: Number(e.target.value) })}
            />
            <div className="range-labels">
              <span>Smaller file</span>
              <span>Higher quality</span>
            </div>
            <div className="field-help">
              Recommended: 75%–85% provides significant savings with virtually unnoticeable loss.
            </div>
          </div>
        )}

        {/* Resize Option */}
        <div className="field">
          <label htmlFor="resizeToggle" className="switch-label">
            <input
              type="checkbox"
              id="resizeToggle"
              checked={settings.resize}
              disabled={disabled}
              onChange={(e) => onChange({ resize: e.target.checked })}
            />
            <span className="switch-copy">
              <strong>Resize output</strong>
              <small>Limit longest edge while preserving aspect ratio.</small>
            </span>
          </label>

          {settings.resize && (
            <div className="resize-wrap">
              <label
                htmlFor="maxDimension"
                className="field-help"
                style={{ display: 'block', margin: '8px 0 4px', fontWeight: 700 }}
              >
                Maximum edge (pixels)
              </label>
              <input
                id="maxDimension"
                type="number"
                className="control"
                min="64"
                max="12000"
                step="1"
                value={settings.maxEdge}
                disabled={disabled}
                onChange={(e) => onChange({ maxEdge: Math.max(64, Math.min(12000, Number(e.target.value))) })}
              />
              <div className="field-help">Example: 1920px keeps photos suitable for high-density web displays.</div>
            </div>
          )}
        </div>

        {/* JPEG Matte Color */}
        {isJpeg && (
          <div className="field">
            <div className="field-label-row">
              <label htmlFor="matteColor">Matte background</label>
            </div>
            <div className="color-row">
              <input
                type="color"
                id="matteColor"
                value={settings.matteColor}
                disabled={disabled}
                aria-label="JPEG matte background color"
                onChange={(e) => onChange({ matteColor: e.target.value })}
              />
              <span className="field-help">
                Replaces transparent pixels with this background color.
              </span>
            </div>
          </div>
        )}

        <div className="settings-divider" />

        <div className="engine-note">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span>
            <strong style={{ color: 'var(--text)' }}>Privacy by design.</strong> Selected files are processed entirely in this browser tab. Zero network requests are made.
          </span>
        </div>
      </div>
    </aside>
  );
};
