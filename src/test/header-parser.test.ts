import { describe, it, expect } from 'vitest';
import { parseImageHeader } from '../features/image-processing/header-parser';

describe('parseImageHeader', () => {
  it('returns null for buffers shorter than 30 bytes', () => {
    const buffer = new ArrayBuffer(20);
    expect(parseImageHeader(buffer)).toBeNull();
  });

  it('correctly parses PNG header with IHDR chunk dimensions', () => {
    // 32-byte mock PNG header
    const buffer = new ArrayBuffer(32);
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);

    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    bytes.set([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], 0);
    // IHDR chunk type at offset 12: 49 48 44 52
    bytes.set([0x49, 0x48, 0x44, 0x52], 12);
    // Width = 1920 (0x00000780), Height = 1080 (0x00000438)
    view.setUint32(16, 1920, false);
    view.setUint32(20, 1080, false);

    const result = parseImageHeader(buffer);
    expect(result).not.toBeNull();
    expect(result?.mimeType).toBe('image/png');
    expect(result?.width).toBe(1920);
    expect(result?.height).toBe(1080);
  });

  it('correctly parses JPEG header with SOF0 marker dimensions', () => {
    // Mock JPEG header
    const buffer = new ArrayBuffer(64);
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);

    // SOI marker: FF D8 FF
    bytes[0] = 0xFF;
    bytes[1] = 0xD8;
    bytes[2] = 0xFF;
    // APP0 marker: E0, length 16
    bytes[3] = 0xE0;
    view.setUint16(4, 16, false);

    // SOF0 marker at offset 22
    bytes[22] = 0xFF;
    bytes[23] = 0xC0; // SOF0
    view.setUint16(24, 17, false); // Length
    bytes[26] = 8; // Precision
    view.setUint16(27, 800, false); // Height
    view.setUint16(29, 1200, false); // Width

    const result = parseImageHeader(buffer);
    expect(result).not.toBeNull();
    expect(result?.mimeType).toBe('image/jpeg');
    expect(result?.width).toBe(1200);
    expect(result?.height).toBe(800);
  });

  it('correctly parses WebP VP8X extended header dimensions', () => {
    // Mock WebP VP8X header
    const buffer = new ArrayBuffer(36);
    const bytes = new Uint8Array(buffer);

    // 'RIFF'
    bytes[0] = 0x52; bytes[1] = 0x49; bytes[2] = 0x46; bytes[3] = 0x46;
    // 'WEBP'
    bytes[8] = 0x57; bytes[9] = 0x45; bytes[10] = 0x42; bytes[11] = 0x50;
    // 'VP8X'
    bytes[12] = 0x56; bytes[13] = 0x50; bytes[14] = 0x38; bytes[15] = 0x58;

    // Canvas width - 1 = 2047 (0x0007FF) -> 24..26 (little endian)
    bytes[24] = 0xFF; bytes[25] = 0x07; bytes[26] = 0x00;
    // Canvas height - 1 = 1535 (0x0005FF) -> 27..29 (little endian)
    bytes[27] = 0xFF; bytes[28] = 0x05; bytes[29] = 0x00;

    const result = parseImageHeader(buffer);
    expect(result).not.toBeNull();
    expect(result?.mimeType).toBe('image/webp');
    expect(result?.width).toBe(2048);
    expect(result?.height).toBe(1536);
  });
});
