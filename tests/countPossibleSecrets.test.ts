import { describe, expect, it } from 'vitest';
import { countPossibleSecrets } from '../src/core/countPossibleSecrets.js';

describe('countPossibleSecrets', () => {
  it('returns one for an empty secret', () => {
    expect(countPossibleSecrets(0, 10)).toBe(1);
  });

  it('handles the recursion endpoint with zero available digits', () => {
    expect(countPossibleSecrets(0, 0)).toBe(1);
  });

  it('counts one-digit secrets', () => {
    expect(countPossibleSecrets(1, 10)).toBe(10);
  });

  it('counts two-digit decimal secrets', () => {
    expect(countPossibleSecrets(2, 10)).toBe(90);
  });

  it('counts four-digit decimal secrets', () => {
    expect(countPossibleSecrets(4, 10)).toBe(5040);
  });

  it('counts six-digit decimal secrets', () => {
    expect(countPossibleSecrets(6, 10)).toBe(151200);
  });

  it('counts binary secrets', () => {
    expect(countPossibleSecrets(2, 2)).toBe(2);
  });

  it('counts octal secrets', () => {
    expect(countPossibleSecrets(4, 8)).toBe(1680);
  });

  it('counts hexadecimal secrets', () => {
    expect(countPossibleSecrets(4, 16)).toBe(43680);
  });

  it('returns zero when there are not enough unique digits', () => {
    expect(countPossibleSecrets(3, 2)).toBe(0);
  });

  it('keeps results correct across repeated and different calls', () => {
    expect(countPossibleSecrets(2, 10)).toBe(90);
    expect(countPossibleSecrets(2, 8)).toBe(56);
    expect(countPossibleSecrets(2, 10)).toBe(90);
  });

  it('rejects negative or fractional arguments', () => {
    expect(() => countPossibleSecrets(-1, 10)).toThrow(RangeError);
    expect(() => countPossibleSecrets(2, -1)).toThrow(RangeError);
    expect(() => countPossibleSecrets(2.5, 10)).toThrow(RangeError);
    expect(() => countPossibleSecrets(2, 8.5)).toThrow(RangeError);
  });
});
