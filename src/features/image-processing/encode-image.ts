import { CompressionSettings, ProcessResult } from './image-types';
import { calculateTargetDimensions } from './resize-image';
import { extensionFor } from '../../lib/filename';

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
  timeoutMs: number = 15000
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error('Image encoding timed out under browser memory pressure.'));
      }
    }, timeoutMs);

    const callback = (blob: Blob | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (blob && blob.size > 0) {
        resolve(blob);
      } else {
        reject(new Error('The browser could not create an output image blob.'));
      }
    };

    try {
      if (typeof canvas.toBlob !== 'function') {
        clearTimeout(timer);
        reject(new Error('This browser does not support canvas image export.'));
        return;
      }

      if (type === 'image/png') {
        canvas.toBlob(callback, type);
      } else {
        canvas.toBlob(callback, type, quality);
      }
    } catch (err: any) {
      clearTimeout(timer);
      reject(new Error(err?.message || 'Canvas export failed.'));
    }
  });
}

export async function encodeImage(
  bitmap: ImageBitmap,
  settings: CompressionSettings
): Promise<ProcessResult> {
  const { width, height } = calculateTargetDimensions(
    bitmap.width,
    bitmap.height,
    settings.resize,
    settings.maxEdge
  );

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  try {
    const isJpeg = settings.format === 'image/jpeg';
    const ctx = canvas.getContext('2d', { alpha: !isJpeg });
    if (!ctx) {
      throw new Error('2D Canvas is unavailable in this environment.');
    }

    // High smoothing quality for antialiased downsampling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Apply matte color behind transparent areas when converting to JPEG
    if (isJpeg) {
      ctx.fillStyle = settings.matteColor || '#ffffff';
      ctx.fillRect(0, 0, width, height);
    }

    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await canvasToBlob(canvas, settings.format, settings.quality / 100);

    // Guard against silent MIME fallback from WebP to PNG
    if (blob.type !== settings.format) {
      throw new Error(
        `${extensionFor(settings.format).toUpperCase()} export is not supported by this browser. Choose another format.`
      );
    }

    return { blob, width, height };
  } finally {
    // Explicitly release GPU texture backing store memory
    canvas.width = 0;
    canvas.height = 0;
  }
}
