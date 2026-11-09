export function generateSecret(
  length: number,
  base: number,
  random: () => number = Math.random,
): string {
  if (![2, 8, 10, 16].includes(base)) {
    throw new RangeError('Unsupported base');
  }

  if (!Number.isInteger(length) || length < 2 || length > 6 || length > base) {
    throw new RangeError('Invalid secret length');
  }

  const availableDigits = [...'0123456789abcdef'.slice(0, base)];

  const selectDigits = (
    remaining: readonly string[],
    secret: string,
  ): string => {
    if (secret.length === length) {
      return secret;
    }

    const randomValue = random();

    if (!Number.isFinite(randomValue) || randomValue < 0 || randomValue >= 1) {
      throw new RangeError('Random value must be between 0 and 1');
    }

    const index = Math.floor(randomValue * remaining.length);
    const digit = remaining[index];
    const nextRemaining = remaining.filter(
      (_, digitIndex) => digitIndex !== index,
    );

    return selectDigits(nextRemaining, secret + digit);
  };

  return selectDigits(availableDigits, '');
}
