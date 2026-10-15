import { useState, useCallback } from 'react';
import {
  CompressionSettings,
  ImageItem,
} from '../features/image-processing/image-types';
import { decodeImage } from '../features/image-processing/decode-image';
import { encodeImage } from '../features/image-processing/encode-image';
import { buildZip } from '../features/image-processing/zip-export';
import { generateOutputFilename } from '../lib/filename';
import { objectUrls } from '../features/image-processing/object-url-manager';

export interface ProgressState {
  current: number;
  total: number;
  currentName: string;
}

export function useCompression() {
  const [settings, setSettings] = useState<CompressionSettings>({
    format: 'image/webp',
    quality: 82,
    resize: false,
    maxEdge: 1920,
    matteColor: '#ffffff',
  });

  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<ProgressState>({
    current: 0,
    total: 0,
    currentName: '',
  });

  const updateSettings = useCallback((partial: Partial<CompressionSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const compressAll = useCallback(
    async (
      items: ImageItem[],
      onUpdateItem: (id: string, partial: Partial<ImageItem>) => void
    ): Promise<{ successful: number; failed: number }> => {
      if (!items.length || processing) {
        return { successful: 0, failed: 0 };
      }

      setProcessing(true);
      setProgress({ current: 0, total: items.length, currentName: '' });

      let successful = 0;
      let failed = 0;
      const nameCounts = new Map<string, number>();

      try {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          setProgress({
            current: i,
            total: items.length,
            currentName: item.file.name,
          });

          onUpdateItem(item.id, { status: 'processing', error: '' });

          try {
            // 1. Decode image with EXIF orientation preserved
            const { bitmap } = await decodeImage(item.file);

            try {
              // 2. Encode image according to settings
              const result = await encodeImage(bitmap, settings);

              // 3. Revoke any previous result URL
              if (item.resultUrl) {
                objectUrls.revoke(item.resultUrl);
              }

              const resultUrl = objectUrls.create(result.blob);

              // 4. Compute unique filename
              const baseNameKey = item.file.name.toLowerCase();
              const count = nameCounts.get(baseNameKey) || 0;
              nameCounts.set(baseNameKey, count + 1);

              const outputName = generateOutputFilename(
                item.file.name,
                settings.format,
                count
              );

              onUpdateItem(item.id, {
                status: 'done',
                resultBlob: result.blob,
                resultUrl,
                outWidth: result.width,
                outHeight: result.height,
                outputName,
                isStale: false,
                error: '',
              });

              successful++;
            } finally {
              bitmap.close();
            }
          } catch (err: any) {
            onUpdateItem(item.id, {
              status: 'error',
              error: err?.message || 'Processing failed.',
              isStale: false,
            });
            failed++;
          }

          setProgress({
            current: i + 1,
            total: items.length,
            currentName: item.file.name,
          });

          // Yield to main thread so UI updates smoothly
          await new Promise((resolve) => setTimeout(resolve, 16));
        }
      } finally {
        setProcessing(false);
      }

      return { successful, failed };
    },
    [processing, settings]
  );

  const downloadSingle = useCallback((item: ImageItem) => {
    if (!item.resultUrl || !item.resultBlob) return;
    const a = document.createElement('a');
    a.href = item.resultUrl;
    a.download = item.outputName || 'compressed-image';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, []);

  const downloadZip = useCallback(async (items: ImageItem[]): Promise<number> => {
    const readyEntries = items
      .filter((item) => item.status === 'done' && item.resultBlob)
      .map((item) => ({
        name: item.outputName,
        blob: item.resultBlob!,
      }));

    if (!readyEntries.length) return 0;

    const zipBlob = await buildZip(readyEntries);
    const zipUrl = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = zipUrl;
    a.download = 'pixelpress-compressed-images.zip';
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => URL.revokeObjectURL(zipUrl), 15000);
    return readyEntries.length;
  }, []);

  return {
    settings,
    updateSettings,
    processing,
    progress,
    compressAll,
    downloadSingle,
    downloadZip,
  };
}
