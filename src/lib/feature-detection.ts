export interface SupportedFormats {
  webp: boolean;
  jpeg: boolean;
  png: boolean;
}

let cachedFormats: SupportedFormats | null = null;

export function checkFormatSupport(): SupportedFormats {
  if (cachedFormats) return cachedFormats;

  if (typeof document === 'undefined') {
    return { webp: true, jpeg: true, png: true };
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  const webp = canvas.toDataURL('image/webp').startsWith('data:image/webp');
  const jpeg = canvas.toDataURL('image/jpeg').startsWith('data:image/jpeg');
  const png = canvas.toDataURL('image/png').startsWith('data:image/png');

  canvas.width = 0;
  canvas.height = 0;

  cachedFormats = { webp, jpeg, png };
  return cachedFormats;
}
