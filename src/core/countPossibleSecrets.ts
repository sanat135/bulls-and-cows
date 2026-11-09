const cache = new Map<string, number>();

export function countPossibleSecrets(length: number, base: number): number {
  if (
    !Number.isInteger(length) ||
    !Number.isInteger(base) ||
    length < 0 ||
    base < 0
  ) {
    throw new RangeError('Length and base must be non-negative integers');
  }

  if (length === 0) {
    return 1;
  }

  if (length > base) {
    return 0;
  }

  const key = `${length}:${base}`;
  const cachedResult = cache.get(key);

  if (cachedResult !== undefined) {
    return cachedResult;
  }

  const result = base * countPossibleSecrets(length - 1, base - 1);

  cache.set(key, result);

  return result;
}
