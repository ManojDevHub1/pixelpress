export type ImageMimeType = 'image/webp' | 'image/jpeg' | 'image/png';

export type ItemStatus = 'ready' | 'processing' | 'done' | 'error';

export interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
  resultUrl: string | null;
  resultBlob: Blob | null;
  width: number;
  height: number;
  outWidth: number;
  outHeight: number;
  status: ItemStatus;
  error: string;
  outputName: string;
  isStale: boolean;
}

export interface CompressionSettings {
  format: ImageMimeType;
  quality: number; // 35 to 100
  resize: boolean;
  maxEdge: number; // 64 to 12000
  matteColor: string; // #rrggbb
}

export interface ImageHeaderInfo {
  width: number;
  height: number;
  mimeType: ImageMimeType;
}

export interface ProcessResult {
  blob: Blob;
  width: number;
  height: number;
}
