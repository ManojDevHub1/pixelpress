import { describe, it, expect } from 'vitest';
import {
  extensionFor,
  sanitizeBasename,
  generateOutputFilename,
} from '../lib/filename';

describe('filename utilities', () => {
  describe('extensionFor', () => {
    it('returns webp for image/webp', () => {
      expect(extensionFor('image/webp')).toBe('webp');
    });

    it('returns jpg for image/jpeg', () => {
      expect(extensionFor('image/jpeg')).toBe('jpg');
    });

    it('returns png for image/png', () => {
      expect(extensionFor('image/png')).toBe('png');
    });

    it('returns img for unknown types', () => {
      expect(extensionFor('unknown/type')).toBe('img');
    });
  });

  describe('sanitizeBasename', () => {
    it('strips existing extension', () => {
      expect(sanitizeBasename('photo.jpg')).toBe('photo');
      expect(sanitizeBasename('my-image.png')).toBe('my-image');
    });

    it('replaces dangerous filesystem and path traversal characters', () => {
      expect(sanitizeBasename('../../etc/passwd.jpg')).toBe('etc-passwd');
      expect(sanitizeBasename('photo:one*two?.png')).toBe('photo-one-two');
    });

    it('handles Windows reserved device names', () => {
      expect(sanitizeBasename('con.png')).toBe('image');
      expect(sanitizeBasename('PRN.jpg')).toBe('image');
      expect(sanitizeBasename('nul.webp')).toBe('image');
    });

    it('handles dotfiles and leading periods', () => {
      expect(sanitizeBasename('.hidden.png')).toBe('hidden');
      expect(sanitizeBasename('.png')).toBe('image');
    });

    it('preserves unicode characters', () => {
      expect(sanitizeBasename('写真.jpg')).toBe('写真');
      expect(sanitizeBasename('café_photo.png')).toBe('café_photo');
    });
  });

  describe('generateOutputFilename', () => {
    it('generates standard -pixelpress filename', () => {
      expect(generateOutputFilename('vacation.jpg', 'image/webp')).toBe(
        'vacation-pixelpress.webp'
      );
    });

    it('generates collision-free indexed names for duplicates', () => {
      expect(generateOutputFilename('vacation.jpg', 'image/webp', 1)).toBe(
        'vacation-pixelpress-2.webp'
      );
      expect(generateOutputFilename('vacation.jpg', 'image/webp', 2)).toBe(
        'vacation-pixelpress-3.webp'
      );
    });
  });
});
