import { describe, expect, it } from 'vitest';
import { createGame, submitGuess } from '../src/core/gameState.js';

describe('gameState', () => {
  it('creates a game with an empty history', () => {
    const state = createGame(4, 10, 1000, () => 0);

    expect(state).toEqual({
      length: 4,
      base: 10,
      secret: '0123',
      startedAt: 1000,
      finishedAt: null,
      history: [],
    });
  });

  it('adds an attempt without changing the previous state', () => {
    const state = createGame(4, 10, 1000, () => 0);

    Object.freeze(state.history);
    Object.freeze(state);

    const result = submitGuess(state, '0132', 2000);

    expect(result.status).toBe('accepted');
    expect(result.state.history).toEqual([
      {
        guess: '0132',
        bulls: 2,
        cows: 2,
      },
    ]);

    expect(state.history).toEqual([]);
    expect(result.state).not.toBe(state);
    expect(result.state.history).not.toBe(state.history);
    expect(result.state.finishedAt).toBeNull();
  });

  it('rejects an invalid guess without adding an attempt', () => {
    const state = createGame(4, 10, 1000, () => 0);
    const result = submitGuess(state, '0012', 2000);

    expect(result.status).toBe('invalid');
    expect(result.state).toBe(state);
    expect(result.state.history).toHaveLength(0);
  });

  it('rejects repeated guesses regardless of letter case', () => {
    const state = createGame(4, 16, 1000, () => 0);
    const first = submitGuess(state, 'AB01', 2000);
    const repeated = submitGuess(first.state, 'ab01', 3000);

    expect(first.status).toBe('accepted');
    expect(first.state.history[0]?.guess).toBe('ab01');
    expect(repeated.status).toBe('duplicate');
    expect(repeated.state).toBe(first.state);
    expect(repeated.state.history).toHaveLength(1);
  });

  it('records the finish time when the secret is guessed', () => {
    const state = createGame(4, 10, 1000, () => 0);
    const result = submitGuess(state, '0123', 5000);

    expect(result.status).toBe('accepted');
    expect(result.state.finishedAt).toBe(5000);
    expect(result.state.history).toHaveLength(1);
    expect(result.state.history[0]?.bulls).toBe(4);
    expect(state.finishedAt).toBeNull();
  });

  it('rejects attempts after the game has finished', () => {
    const state = createGame(4, 10, 1000, () => 0);
    const winning = submitGuess(state, '0123', 5000);
    const extra = submitGuess(winning.state, '4567', 6000);

    expect(extra.status).toBe('finished');
    expect(extra.state).toBe(winning.state);
    expect(extra.state.history).toHaveLength(1);
    expect(extra.state.finishedAt).toBe(5000);
  });
});
