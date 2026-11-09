import { describe, expect, it } from 'vitest';
import { createDigitValidator } from '../src/core/createDigitValidator.js';

describe('createDigitValidator', () => {
  it('accepts only binary digits for base 2', () => {
    const isDigit = createDigitValidator(2);

    expect(isDigit('0')).toBe(true);
    expect(isDigit('1')).toBe(true);
    expect(isDigit('2')).toBe(false);
    expect(isDigit('a')).toBe(false);
  });

  it('accepts only octal digits for base 8', () => {
    const isDigit = createDigitValidator(8);

    expect(isDigit('0')).toBe(true);
    expect(isDigit('7')).toBe(true);
    expect(isDigit('8')).toBe(false);
  });

  it('accepts decimal digits for base 10', () => {
    const isDigit = createDigitValidator(10);

    expect(isDigit('9')).toBe(true);
    expect(isDigit('a')).toBe(false);
  });

  it('accepts hexadecimal letters in both cases', () => {
    const isDigit = createDigitValidator(16);

    expect(isDigit('9')).toBe(true);
    expect(isDigit('a')).toBe(true);
    expect(isDigit('A')).toBe(true);
    expect(isDigit('f')).toBe(true);
    expect(isDigit('F')).toBe(true);
    expect(isDigit('g')).toBe(false);
  });

  it('rejects empty strings, spaces and multiple characters', () => {
    const isDigit = createDigitValidator(16);

    expect(isDigit('')).toBe(false);
    expect(isDigit(' ')).toBe(false);
    expect(isDigit('12')).toBe(false);
    expect(isDigit('-')).toBe(false);
  });
});
