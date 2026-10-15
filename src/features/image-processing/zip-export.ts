// Precomputed 256-entry lookup table for IEEE 802.3 CRC-32
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  CRC_TABLE[i] = c >>> 0;
}

export function crc32(bytes: Uint8Array): number {
  let crc = -1;
  for (let i = 0; i < bytes.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[i]) & 0xFF];
  }
  return (crc ^ -1) >>> 0;
}

export function dosDateTime(date: Date): { time: number; date: number } {
  const year = Math.max(1980, date.getFullYear());
  const time =
    (date.getHours() << 11) |
    (date.getMinutes() << 5) |
    Math.floor(date.getSeconds() / 2);
  const d =
    ((year - 1980) << 9) |
    ((date.getMonth() + 1) << 5) |
    date.getDate();
  return { time, date: d };
}

export interface ZipEntry {
  name: string;
  blob: Blob;
}

export async function buildZip(entries: ZipEntry[]): Promise<Blob> {
  const encoder = new TextEncoder();
  const localChunks: Uint8Array[] = [];
  const centralChunks: Uint8Array[] = [];
  let offset = 0;
  const dt = dosDateTime(new Date());

  for (const entry of entries) {
    const name = encoder.encode(entry.name);
    const data = new Uint8Array(await entry.blob.arrayBuffer());
    const crc = crc32(data);

    // 1. Local File Header (30 bytes + name length)
    const local = new Uint8Array(30 + name.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true); // Local header signature
    lv.setUint16(4, 20, true);         // Version needed to extract (2.0)
    lv.setUint16(6, 0x0800, true);     // General purpose flag: bit 11 = UTF-8 filename
    lv.setUint16(8, 0, true);          // Compression method: 0 = Stored (no compression)
    lv.setUint16(10, dt.time, true);   // Mod time
    lv.setUint16(12, dt.date, true);   // Mod date
    lv.setUint32(14, crc, true);       // CRC-32
    lv.setUint32(18, data.length, true); // Compressed size
    lv.setUint32(22, data.length, true); // Uncompressed size
    lv.setUint16(26, name.length, true); // Filename length
    lv.setUint16(28, 0, true);           // Extra field length
    local.set(name, 30);

    localChunks.push(local, data);

    // 2. Central Directory Header (46 bytes + name length)
    const central = new Uint8Array(46 + name.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true); // Central header signature
    cv.setUint16(4, 20, true);         // Version made by: DOS / 2.0
    cv.setUint16(6, 20, true);         // Version needed to extract
    cv.setUint16(8, 0x0800, true);     // General purpose flag (UTF-8)
    cv.setUint16(10, 0, true);         // Compression method: 0
    cv.setUint16(12, dt.time, true);   // Mod time
    cv.setUint16(14, dt.date, true);   // Mod date
    cv.setUint32(16, crc, true);       // CRC-32
    cv.setUint32(20, data.length, true); // Compressed size
    cv.setUint32(24, data.length, true); // Uncompressed size
    cv.setUint16(28, name.length, true); // Filename length
    cv.setUint16(30, 0, true);           // Extra field length
    cv.setUint16(32, 0, true);           // File comment length
    cv.setUint16(34, 0, true);           // Disk number start
    cv.setUint16(36, 0, true);           // Internal file attributes
    cv.setUint32(38, 0, true);           // External file attributes
    cv.setUint32(42, offset, true);      // Relative offset of local header
    central.set(name, 46);

    centralChunks.push(central);
    offset += local.length + data.length;
  }

  const centralSize = centralChunks.reduce((sum, chunk) => sum + chunk.length, 0);

  // 3. End of Central Directory Record (22 bytes)
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true); // EOCD signature
  ev.setUint16(4, 0, true);          // Number of this disk
  ev.setUint16(6, 0, true);          // Disk where central directory starts
  ev.setUint16(8, entries.length, true); // Number of records on this disk
  ev.setUint16(10, entries.length, true); // Total number of records
  ev.setUint32(12, centralSize, true);    // Size of central directory
  ev.setUint32(16, offset, true);         // Offset of start of central directory
  ev.setUint16(20, 0, true);              // Comment length

  return new Blob([...localChunks, ...centralChunks, end] as BlobPart[], { type: 'application/zip' });
}
