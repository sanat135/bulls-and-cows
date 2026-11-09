export type GameRecord = {
  readonly attempts: number;
  readonly durationMs: number;
  readonly length: number;
  readonly base: number;
};

export type RecordsStorage = Pick<Storage, 'getItem' | 'setItem'>;

const RECORDS_LIMIT = 10;

function getStorageKey(length: number, base: number): string {
  return `bulls-and-cows:records:${base}:${length}`;
}

function isGameRecord(value: unknown): value is GameRecord {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  if (
    !('attempts' in value) ||
    !('durationMs' in value) ||
    !('length' in value) ||
    !('base' in value)
  ) {
    return false;
  }

  return (
    typeof value.attempts === 'number' &&
    Number.isInteger(value.attempts) &&
    value.attempts > 0 &&
    typeof value.durationMs === 'number' &&
    Number.isFinite(value.durationMs) &&
    value.durationMs >= 0 &&
    typeof value.length === 'number' &&
    Number.isInteger(value.length) &&
    value.length >= 2 &&
    value.length <= 6 &&
    typeof value.base === 'number' &&
    [2, 8, 10, 16].includes(value.base) &&
    value.length <= value.base
  );
}

export function rankRecords(records: readonly GameRecord[]): GameRecord[] {
  return [...records]
    .sort(
      (first, second) =>
        first.attempts - second.attempts ||
        first.durationMs - second.durationMs,
    )
    .slice(0, RECORDS_LIMIT);
}

export function loadRecords(
  storage: RecordsStorage,
  length: number,
  base: number,
): GameRecord[] {
  try {
    const stored = storage.getItem(getStorageKey(length, base));

    if (stored === null) {
      return [];
    }

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    const records = parsed
      .filter(isGameRecord)
      .filter((record) => record.length === length && record.base === base);

    return rankRecords(records);
  } catch {
    return [];
  }
}

export function saveRecord(
  storage: RecordsStorage,
  record: GameRecord,
): boolean {
  if (!isGameRecord(record)) {
    return false;
  }

  try {
    const previous = loadRecords(storage, record.length, record.base);
    const records = rankRecords([...previous, record]);

    storage.setItem(
      getStorageKey(record.length, record.base),
      JSON.stringify(records),
    );

    return true;
  } catch {
    return false;
  }
}
