import { parseImageHeader } from './header-parser';
import { ImageHeaderInfo, ImageMimeType } from './image-types';

export const MAX_FILES = 10;
export const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB
export const MAX_DECODED_PIXELS = 30_000_000; // 30 Megapixels
export const MAX_SINGLE_DIMENSION = 16384; // Safe canvas limit

export const ALLOWED_TYPES = new Set<string>(['image/jpeg', 'image/png', 'image/webp']);

export interface ValidationSuccess {
  valid: true;
  mimeType: ImageMimeType;
  headerInfo: ImageHeaderInfo | null;
}

export interface ValidationFailure {
  valid: false;
  error: string;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

export async function validateImageFile(file: File): Promise<ValidationResult> {
  // 1. Zero-byte check (Must happen before MIME check to avoid false MIME error)
  if (file.size === 0) {
    return { valid: false, error: `${file.name}: file is empty.` };
  }

  // 2. Maximum file size check
  if (file.size > MAX_FILE_BYTES) {
    return { valid: false, error: `${file.name}: exceeds the 20 MB limit.` };
  }

  // Read first 2KB for binary header inspection
  let headerInfo: ImageHeaderInfo | null = null;
  try {
    const slice = file.slice(0, 2048);
    const buffer = await slice.arrayBuffer();
    headerInfo = parseImageHeader(buffer);
  } catch {
    // If slice fails, proceed with standard validation
  }

  // 3. Resolve MIME type: trust header if available, otherwise check file.type, then filename extension
  let resolvedMime: ImageMimeType | null = null;

  if (headerInfo && ALLOWED_TYPES.has(headerInfo.mimeType)) {
    resolvedMime = headerInfo.mimeType;
  } else if (file.type && ALLOWED_TYPES.has(file.type)) {
    resolvedMime = file.type as ImageMimeType;
  } else if (/\.jpe?g$/i.test(file.name)) {
    resolvedMime = 'image/jpeg';
  } else if (/\.png$/i.test(file.name)) {
    resolvedMime = 'image/png';
  } else if (/\.webp$/i.test(file.name)) {
    resolvedMime = 'image/webp';
  }

  if (!resolvedMime) {
    return { valid: false, error: `${file.name}: use JPG, PNG or WebP.` };
  }

  // 4. Pre-decode Decompression Bomb Guard
  if (headerInfo && headerInfo.width > 0 && headerInfo.height > 0) {
    const totalPixels = headerInfo.width * headerInfo.height;
    if (totalPixels > MAX_DECODED_PIXELS) {
      return {
        valid: false,
        error: `${file.name}: exceeds the 30-megapixel limit (${headerInfo.width}×${headerInfo.height}).`,
      };
    }
    if (
      headerInfo.width > MAX_SINGLE_DIMENSION ||
      headerInfo.height > MAX_SINGLE_DIMENSION
    ) {
      return {
        valid: false,
        error: `${file.name}: single edge exceeds maximum supported dimension (${MAX_SINGLE_DIMENSION}px).`,
      };
    }
  }

  return {
    valid: true,
    mimeType: resolvedMime,
    headerInfo,
  };
}
