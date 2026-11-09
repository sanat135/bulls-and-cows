import { describe, expect, it } from 'vitest';
import { evaluateGuess } from '../src/core/evaluateGuess.js';

describe('evaluateGuess', () => {
  it('counts all bulls for an exact match', () => {
    expect(evaluateGuess('1234', '1234')).toEqual({
      bulls: 4,
      cows: 0,
    });
  });

  it('counts all cows when every digit is misplaced', () => {
    expect(evaluateGuess('1234', '4321')).toEqual({
      bulls: 0,
      cows: 4,
    });
  });

  it('returns zero when there are no matching digits', () => {
    expect(evaluateGuess('1234', '5678')).toEqual({
      bulls: 0,
      cows: 0,
    });
  });

  it('counts bulls and cows together', () => {
    expect(evaluateGuess('1234', '1243')).toEqual({
      bulls: 2,
      cows: 2,
    });
  });

  it('handles a mixture of matching and absent digits', () => {
    expect(evaluateGuess('1234', '1356')).toEqual({
      bulls: 1,
      cows: 1,
    });
  });

  it('handles a leading zero', () => {
    expect(evaluateGuess('0123', '0312')).toEqual({
      bulls: 1,
      cows: 3,
    });
  });

  it('handles binary digits', () => {
    expect(evaluateGuess('01', '10')).toEqual({
      bulls: 0,
      cows: 2,
    });
  });

  it('ignores letter case when counting bulls', () => {
    expect(evaluateGuess('aB09', 'Ab09')).toEqual({
      bulls: 4,
      cows: 0,
    });
  });

  it('ignores letter case when counting cows', () => {
    expect(evaluateGuess('ab01', 'BA10')).toEqual({
      bulls: 0,
      cows: 4,
    });
  });

  it('handles six-digit secrets', () => {
    expect(evaluateGuess('012345', '012354')).toEqual({
      bulls: 4,
      cows: 2,
    });
  });
});
