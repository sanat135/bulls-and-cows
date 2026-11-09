import { describe, expect, it } from 'vitest';
import { isValidGuess } from '../src/core/isValidGuess.js';

describe('isValidGuess', () => {
  it('accepts decimal digits without repetitions', () => {
    expect(isValidGuess('1234', 4, 10)).toBe(true);
  });

  it('allows a leading zero', () => {
    expect(isValidGuess('0123', 4, 10)).toBe(true);
  });

  it('rejects an incorrect length', () => {
    expect(isValidGuess('123', 4, 10)).toBe(false);
    expect(isValidGuess('12345', 4, 10)).toBe(false);
    expect(isValidGuess('', 4, 10)).toBe(false);
  });

  it('rejects repeated digits', () => {
    expect(isValidGuess('1123', 4, 10)).toBe(false);
  });

  it('checks binary digits', () => {
    expect(isValidGuess('01', 2, 2)).toBe(true);
    expect(isValidGuess('10', 2, 2)).toBe(true);
    expect(isValidGuess('02', 2, 2)).toBe(false);
  });

  it('checks octal digits', () => {
    expect(isValidGuess('0765', 4, 8)).toBe(true);
    expect(isValidGuess('0785', 4, 8)).toBe(false);
  });

  it('accepts hexadecimal letters in both cases', () => {
    expect(isValidGuess('aB09', 4, 16)).toBe(true);
    expect(isValidGuess('AF09', 4, 16)).toBe(true);
  });

  it('treats uppercase and lowercase letters as duplicates', () => {
    expect(isValidGuess('aA09', 4, 16)).toBe(false);
    expect(isValidGuess('fF12', 4, 16)).toBe(false);
  });

  it('rejects characters outside the selected base', () => {
    expect(isValidGuess('abc1', 4, 10)).toBe(false);
    expect(isValidGuess('g123', 4, 16)).toBe(false);
  });

  it('rejects spaces and punctuation', () => {
    expect(isValidGuess('12 3', 4, 10)).toBe(false);
    expect(isValidGuess('-123', 4, 10)).toBe(false);
    expect(isValidGuess('1.23', 4, 10)).toBe(false);
  });
});
