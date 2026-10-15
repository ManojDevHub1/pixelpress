import { ImageHeaderInfo } from './image-types';

export function parseImageHeader(buffer: ArrayBuffer): ImageHeaderInfo | null {
  if (buffer.byteLength < 30) return null;
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);

  // 1. Check PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4E &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0D &&
    bytes[5] === 0x0A &&
    bytes[6] === 0x1A &&
    bytes[7] === 0x0A
  ) {
    // IHDR chunk should follow at offset 12
    if (buffer.byteLength >= 24) {
      const width = view.getUint32(16, false);
      const height = view.getUint32(20, false);
      return { width, height, mimeType: 'image/png' };
    }
    return { width: 0, height: 0, mimeType: 'image/png' };
  }

  // 2. Check JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    let offset = 2;
    while (offset < bytes.length - 8) {
      if (bytes[offset] !== 0xFF) {
        offset++;
        continue;
      }
      const marker = bytes[offset + 1];
      // Skip fill bytes
      if (marker === 0xFF || marker === 0x00) {
        offset++;
        continue;
      }
      // SOF markers: C0, C1, C2, C3, C5, C6, C7, C9, CA, CB, CD, CE, CF
      if (
        (marker >= 0xC0 && marker <= 0xC3) ||
        (marker >= 0xC5 && marker <= 0xC7) ||
        (marker >= 0xC9 && marker <= 0xCB) ||
        (marker >= 0xCD && marker <= 0xCF)
      ) {
        const height = view.getUint16(offset + 5, false);
        const width = view.getUint16(offset + 7, false);
        return { width, height, mimeType: 'image/jpeg' };
      }
      // Move to next marker by reading chunk length
      if (offset + 3 < bytes.length) {
        const length = view.getUint16(offset + 2, false);
        offset += 2 + length;
      } else {
        break;
      }
    }
    return { width: 0, height: 0, mimeType: 'image/jpeg' };
  }

  // 3. Check WebP: RIFF ... WEBP
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && // RIFF
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50   // WEBP
  ) {
    const chunkType = String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15]);
    if (chunkType === 'VP8 ' && buffer.byteLength >= 30) {
      // 9D 01 2A check
      if (bytes[23] === 0x9D && bytes[24] === 0x01 && bytes[25] === 0x2A) {
        const width = (bytes[26] | (bytes[27] << 8)) & 0x3FFF;
        const height = (bytes[28] | (bytes[29] << 8)) & 0x3FFF;
        return { width, height, mimeType: 'image/webp' };
      }
    } else if (chunkType === 'VP8L' && buffer.byteLength >= 25) {
      if (bytes[20] === 0x2F) {
        const b0 = bytes[21];
        const b1 = bytes[22];
        const b2 = bytes[23];
        const b3 = bytes[24];
        const width = 1 + (((b1 & 0x3F) << 8) | b0);
        const height = 1 + (((b3 & 0x0F) << 10) | (b2 << 2) | ((b1 & 0xC0) >> 6));
        return { width, height, mimeType: 'image/webp' };
      }
    } else if (chunkType === 'VP8X' && buffer.byteLength >= 30) {
      const width = 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16));
      const height = 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16));
      return { width, height, mimeType: 'image/webp' };
    }
    return { width: 0, height: 0, mimeType: 'image/webp' };
  }

  return null;
}
