import { describe, expect, it } from 'vitest';
import { generateSecret } from '../src/core/generateSecret.js';

describe('generateSecret', () => {
  it('generates a secret of the requested length', () => {
    expect(generateSecret(4, 10, () => 0.5)).toHaveLength(4);
  });

  it('generates unique digits even with constant random', () => {
    const secret = generateSecret(6, 10, () => 0.5);

    expect(new Set(secret).size).toBe(6);
  });

  it('allows a leading zero', () => {
    expect(generateSecret(4, 10, () => 0)).toBe('0123');
  });

  it('generates a binary secret', () => {
    expect(generateSecret(2, 2, () => 0)).toBe('01');
    expect(generateSecret(2, 2, () => 0.999)).toBe('10');
  });

  it('uses only octal digits for base 8', () => {
    const secret = generateSecret(6, 8, () => 0.999);

    expect(secret).toMatch(/^[0-7]{6}$/);
    expect(new Set(secret).size).toBe(6);
  });

  it('can generate hexadecimal letters', () => {
    expect(generateSecret(6, 16, () => 0.999)).toBe('fedcba');
  });

  it('produces the same result with the same random source', () => {
    const first = generateSecret(4, 10, () => 0.5);
    const second = generateSecret(4, 10, () => 0.5);

    expect(first).toBe(second);
  });

  it('supports the default random source', () => {
    const secret = generateSecret(4, 10);

    expect(secret).toMatch(/^[0-9]{4}$/);
    expect(new Set(secret).size).toBe(4);
  });

  it('rejects a length greater than the base', () => {
    expect(() => generateSecret(3, 2)).toThrow(RangeError);
  });

  it('rejects lengths outside the game range', () => {
    expect(() => generateSecret(1, 10)).toThrow(RangeError);
    expect(() => generateSecret(7, 10)).toThrow(RangeError);
    expect(() => generateSecret(2.5, 10)).toThrow(RangeError);
  });

  it('rejects unsupported bases', () => {
    expect(() => generateSecret(4, 3)).toThrow(RangeError);
    expect(() => generateSecret(4, 12)).toThrow(RangeError);
  });
});
