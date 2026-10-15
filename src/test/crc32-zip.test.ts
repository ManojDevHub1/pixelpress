import { describe, it, expect } from 'vitest';
import { crc32, dosDateTime, buildZip } from '../features/image-processing/zip-export';

describe('CRC32 & ZIP Export Engine', () => {
  describe('crc32', () => {
    it('returns 0 for empty byte arrays', () => {
      const data = new Uint8Array(0);
      expect(crc32(data)).toBe(0);
    });

    it('matches official IEEE 802.3 test vector for "123456789"', () => {
      const encoder = new TextEncoder();
      const data = encoder.encode('123456789');
      // Standard CRC-32 for "123456789" is 0xCBF43926 = 3421780262
      expect(crc32(data)).toBe(0xCBF43926);
    });
  });

  describe('dosDateTime', () => {
    it('generates valid DOS date and time integers', () => {
      const date = new Date(2026, 9, 15, 12, 30, 0); // Oct 15, 2026
      const { time, date: d } = dosDateTime(date);
      expect(typeof time).toBe('number');
      expect(typeof d).toBe('number');
      expect(time).toBeGreaterThan(0);
      expect(d).toBeGreaterThan(0);
    });
  });

  describe('buildZip', () => {
    it('builds a valid PKWARE ZIP binary with local, central, and EOCD headers', async () => {
      const encoder = new TextEncoder();
      const mockBlob = new Blob([encoder.encode('Sample image data')], {
        type: 'image/webp',
      });

      const zipBlob = await buildZip([
        { name: 'photo-pixelpress.webp', blob: mockBlob },
      ]);

      expect(zipBlob).toBeInstanceOf(Blob);
      expect(zipBlob.type).toBe('application/zip');
      expect(zipBlob.size).toBeGreaterThan(0);

      const buffer = await zipBlob.arrayBuffer();
      const view = new DataView(buffer);

      // Verify Local File Header Signature at offset 0: 0x04034b50 ("PK\x03\x04")
      expect(view.getUint32(0, true)).toBe(0x04034b50);

      // Verify EOCD record signature at the end (buffer.byteLength - 22): 0x06054b50 ("PK\x05\x06")
      const eocdOffset = buffer.byteLength - 22;
      expect(view.getUint32(eocdOffset, true)).toBe(0x06054b50);
      // Entry count in EOCD
      expect(view.getUint16(eocdOffset + 8, true)).toBe(1);
    });
  });
});
