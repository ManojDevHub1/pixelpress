import { describe, it, expect } from 'vitest';
import { formatBytes } from '../lib/format-bytes';

describe('formatBytes utility', () => {
  it('formats zero bytes correctly', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  it('handles negative or invalid values gracefully', () => {
    expect(formatBytes(-100)).toBe('—');
    expect(formatBytes(NaN)).toBe('—');
    expect(formatBytes(Infinity)).toBe('—');
  });

  it('formats kilobytes correctly', () => {
    expect(formatBytes(1024)).toBe('1.00 KB');
    expect(formatBytes(1536)).toBe('1.50 KB');
  });

  it('formats megabytes correctly', () => {
    expect(formatBytes(1024 * 1024)).toBe('1.00 MB');
    expect(formatBytes(20 * 1024 * 1024)).toBe('20.00 MB');
  });

  it('formats gigabytes correctly', () => {
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1.00 GB');
  });
});
