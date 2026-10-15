import { useState, useCallback, useEffect } from 'react';
import { ImageItem } from '../features/image-processing/image-types';
import { validateImageFile, MAX_FILES } from '../features/image-processing/validate-image';
import { decodeImage } from '../features/image-processing/decode-image';
import { objectUrls } from '../features/image-processing/object-url-manager';

export function useImageQueue() {
  const [files, setFiles] = useState<ImageItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Clean up all object URLs when unmounting
  useEffect(() => {
    return () => {
      objectUrls.revokeAll();
    };
  }, []);

  const selectFile = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const addFiles = useCallback(async (incoming: File[] | FileList): Promise<string[]> => {
    const list = Array.from(incoming);
    if (!list.length) return [];

    const errors: string[] = [];
    const newItems: ImageItem[] = [];

    // Check count against current files
    let availableSlots = MAX_FILES - files.length;
    if (availableSlots <= 0) {
      return [`Maximum ${MAX_FILES} files allowed per batch.`];
    }

    for (const file of list) {
      if (availableSlots <= 0) {
        errors.push(`Maximum ${MAX_FILES} files limit reached. Remaining files were skipped.`);
        break;
      }

      const validation = await validateImageFile(file);
      if (!validation.valid) {
        errors.push(validation.error);
        continue;
      }

      const previewUrl = objectUrls.create(file);
      let width = validation.headerInfo?.width || 0;
      let height = validation.headerInfo?.height || 0;

      // If dimensions weren't read from header, decode safely to read them
      if (width === 0 || height === 0) {
        try {
          const decoded = await decodeImage(file);
          width = decoded.width;
          height = decoded.height;
          decoded.bitmap.close();
        } catch {
          objectUrls.revoke(previewUrl);
          errors.push(`${file.name}: image could not be decoded.`);
          continue;
        }
      }

      const item: ImageItem = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        file,
        previewUrl,
        resultUrl: null,
        resultBlob: null,
        width,
        height,
        outWidth: 0,
        outHeight: 0,
        status: 'ready',
        error: '',
        outputName: '',
        isStale: false,
      };

      newItems.push(item);
      availableSlots--;
    }

    if (newItems.length > 0) {
      setFiles((prev) => {
        const next = [...prev, ...newItems];
        if (!selectedId && next.length > 0) {
          setSelectedId(next[0].id);
        }
        return next;
      });
    }

    return errors;
  }, [files.length, selectedId]);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        objectUrls.revokeItem(target);
      }
      const next = prev.filter((item) => item.id !== id);
      if (selectedId === id) {
        setSelectedId(next[0]?.id || null);
      }
      return next;
    });
  }, [selectedId]);

  const clearQueue = useCallback(() => {
    files.forEach((item) => objectUrls.revokeItem(item));
    setFiles([]);
    setSelectedId(null);
  }, [files]);

  const updateItem = useCallback((id: string, partial: Partial<ImageItem>) => {
    setFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...partial } : item))
    );
  }, []);

  const markStale = useCallback(() => {
    setFiles((prev) =>
      prev.map((item) => (item.resultBlob ? { ...item, isStale: true } : item))
    );
  }, []);

  const selectedItem = files.find((item) => item.id === selectedId) || null;

  return {
    files,
    selectedId,
    selectedItem,
    selectFile,
    addFiles,
    removeFile,
    clearQueue,
    updateItem,
    markStale,
  };
}
