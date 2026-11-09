import { evaluateGuess } from './evaluateGuess.js';
import { generateSecret } from './generateSecret.js';
import { isValidGuess } from './isValidGuess.js';

export type Attempt = {
  readonly guess: string;
  readonly bulls: number;
  readonly cows: number;
};

export type GameState = {
  readonly length: number;
  readonly base: number;
  readonly secret: string;
  readonly startedAt: number;
  readonly finishedAt: number | null;
  readonly history: readonly Attempt[];
};

export type SubmitResult = {
  readonly status: 'accepted' | 'invalid' | 'duplicate' | 'finished';
  readonly state: GameState;
};

export function createGame(
  length: number,
  base: number,
  startedAt: number,
  random: () => number = Math.random,
): GameState {
  return {
    length,
    base,
    secret: generateSecret(length, base, random),
    startedAt,
    finishedAt: null,
    history: [],
  };
}

export function submitGuess(
  state: GameState,
  guess: string,
  now: number,
): SubmitResult {
  if (state.finishedAt !== null) {
    return { status: 'finished', state };
  }

  if (!isValidGuess(guess, state.length, state.base)) {
    return { status: 'invalid', state };
  }

  const normalizedGuess = guess.toLowerCase();

  const isDuplicate = state.history.some(
    (attempt) => attempt.guess === normalizedGuess,
  );

  if (isDuplicate) {
    return { status: 'duplicate', state };
  }

  const result = evaluateGuess(state.secret, normalizedGuess);

  const attempt: Attempt = {
    guess: normalizedGuess,
    ...result,
  };

  const nextState: GameState = {
    ...state,
    history: [...state.history, attempt],
    finishedAt: result.bulls === state.length ? now : null,
  };

  return {
    status: 'accepted',
    state: nextState,
  };
}
