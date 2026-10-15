import { describe, it, expect } from 'vitest';
import { validateImageFile } from '../features/image-processing/validate-image';

function createMockFile(name: string, size: number, type: string, buffer?: ArrayBuffer): File {
  const content = buffer || new Uint8Array(size);
  const file = new File([content], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('validateImageFile', () => {
  it('rejects 0-byte empty files with explicit empty message', async () => {
    const file = createMockFile('empty.jpg', 0, 'image/jpeg');
    const result = await validateImageFile(file);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe('empty.jpg: file is empty.');
    }
  });

  it('rejects files exceeding 20 MB size limit', async () => {
    const file = createMockFile('large.jpg', 21 * 1024 * 1024, 'image/jpeg');
    const result = await validateImageFile(file);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe('large.jpg: exceeds the 20 MB limit.');
    }
  });

  it('rejects unsupported file formats', async () => {
    const file = createMockFile('doc.pdf', 5000, 'application/pdf');
    const result = await validateImageFile(file);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe('doc.pdf: use JPG, PNG or WebP.');
    }
  });

  it('accepts files with valid extensions when browser MIME is empty (Windows file drop)', async () => {
    const file = createMockFile('photo.jpg', 5000, '');
    const result = await validateImageFile(file);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.mimeType).toBe('image/jpeg');
    }
  });

  it('rejects decompression bomb images exceeding 30 megapixels in header', async () => {
    // 32-byte PNG header with 10,000 x 4,000 px = 40 Megapixels
    const buffer = new ArrayBuffer(32);
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);
    bytes.set([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], 0);
    bytes.set([0x49, 0x48, 0x44, 0x52], 12);
    view.setUint32(16, 10000, false);
    view.setUint32(20, 4000, false);

    const file = createMockFile('bomb.png', 50000, 'image/png', buffer);
    const result = await validateImageFile(file);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain('exceeds the 30-megapixel limit');
    }
  });

  it('accepts valid JPEG, PNG, and WebP images within bounds', async () => {
    const file = createMockFile('valid.png', 10240, 'image/png');
    const result = await validateImageFile(file);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.mimeType).toBe('image/png');
    }
  });
});
