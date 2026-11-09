import { createDigitValidator } from './createDigitValidator.js';

export function isValidGuess(
  guess: string,
  length: number,
  base: number,
): boolean {
  const normalizedGuess = guess.toLowerCase();
  const digits = [...normalizedGuess];
  const isDigit = createDigitValidator(base);

  return (
    digits.length === length &&
    digits.every(isDigit) &&
    new Set(digits).size === length
  );
}
