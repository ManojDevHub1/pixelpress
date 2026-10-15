export function extensionFor(type: string): string {
  switch (type) {
    case 'image/webp':
      return 'webp';
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    default:
      return 'img';
  }
}

const RESERVED_NAMES = new Set([
  'CON', 'PRN', 'AUX', 'NUL',
  'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
  'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
]);

export function sanitizeBasename(rawName: string): string {
  let name = rawName.trim();
  
  // Remove existing extension if present
  name = name.replace(/\.[a-zA-Z0-9]+$/, '');
  
  // Strip path traversal sequences (../, ..\)
  name = name.replace(/\.\.+[/\\]*/g, '');

  // Remove dangerous filesystem characters and control characters
  name = name.replace(/[\\/:*?"<>|\u0000-\u001f]/g, '-').trim();

  // Remove leading or trailing dashes, dots, spaces
  name = name.replace(/^[-. ]+/, '').replace(/[-. ]+$/, '');

  if (!name || RESERVED_NAMES.has(name.toUpperCase())) {
    name = 'image';
  }

  return name.slice(0, 100);
}

export function generateOutputFilename(
  originalName: string,
  outputMime: string,
  index: number = 0
): string {
  const base = sanitizeBasename(originalName);
  const ext = extensionFor(outputMime);
  const suffix = index > 0 ? `-${index + 1}` : '';
  return `${base}-pixelpress${suffix}.${ext}`;
}
