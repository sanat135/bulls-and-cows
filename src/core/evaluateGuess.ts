export type GuessResult = {
  readonly bulls: number;
  readonly cows: number;
};

export function evaluateGuess(secret: string, guess: string): GuessResult {
  void secret;
  void guess;
  throw new Error('Not implemented');
}
