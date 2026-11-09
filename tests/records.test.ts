import { describe, expect, it } from 'vitest';
import {
  loadRecords,
  rankRecords,
  saveRecord,
} from '../src/storage/records.js';
import type { GameRecord, RecordsStorage } from '../src/storage/records.js';

function createStorage(): RecordsStorage {
  const data = new Map<string, string>();

  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
}

function makeRecord(attempts: number, durationMs: number): GameRecord {
  return {
    attempts,
    durationMs,
    length: 4,
    base: 10,
  };
}

describe('records', () => {
  it('returns an empty list when no records exist', () => {
    expect(loadRecords(createStorage(), 4, 10)).toEqual([]);
  });

  it('saves and loads a record', () => {
    const storage = createStorage();
    const record = makeRecord(3, 12000);

    expect(saveRecord(storage, record)).toBe(true);
    expect(loadRecords(storage, 4, 10)).toEqual([record]);
  });

  it('sorts by attempts first and then by time', () => {
    const records = [
      makeRecord(3, 1000),
      makeRecord(2, 9000),
      makeRecord(2, 5000),
    ];

    expect(rankRecords(records)).toEqual([
      makeRecord(2, 5000),
      makeRecord(2, 9000),
      makeRecord(3, 1000),
    ]);
  });

  it('does not change the original array', () => {
    const records = Object.freeze([makeRecord(5, 10000), makeRecord(2, 5000)]);

    const ranked = rankRecords(records);

    expect(records[0]?.attempts).toBe(5);
    expect(ranked[0]?.attempts).toBe(2);
    expect(ranked).not.toBe(records);
  });

  it('keeps only the best ten records', () => {
    const records = Array.from({ length: 12 }, (_, index) =>
      makeRecord(index + 1, 1000),
    );

    const ranked = rankRecords(records);

    expect(ranked).toHaveLength(10);
    expect(ranked[9]?.attempts).toBe(10);
  });

  it('separates records by length and base', () => {
    const storage = createStorage();

    saveRecord(storage, makeRecord(3, 12000));

    expect(loadRecords(storage, 4, 10)).toHaveLength(1);
    expect(loadRecords(storage, 4, 16)).toEqual([]);
    expect(loadRecords(storage, 3, 10)).toEqual([]);
  });

  it('handles corrupted JSON', () => {
    const storage = createStorage();

    storage.setItem('bulls-and-cows:records:10:4', '{broken');

    expect(loadRecords(storage, 4, 10)).toEqual([]);
  });

  it('filters invalid records and records with other settings', () => {
    const storage = createStorage();
    const valid = makeRecord(3, 12000);

    storage.setItem(
      'bulls-and-cows:records:10:4',
      JSON.stringify([
        valid,
        null,
        { attempts: 2 },
        { ...valid, attempts: -1 },
        { ...valid, base: 16 },
      ]),
    );

    expect(loadRecords(storage, 4, 10)).toEqual([valid]);
  });

  it('returns false when writing to storage fails', () => {
    const storage: RecordsStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('Storage unavailable');
      },
    };

    expect(saveRecord(storage, makeRecord(3, 12000))).toBe(false);
  });
});
