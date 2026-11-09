import { createDigitValidator } from '../core/createDigitValidator.js';
import { countPossibleSecrets } from '../core/countPossibleSecrets.js';
import { createGame, submitGuess } from '../core/gameState.js';
import type { GameState } from '../core/gameState.js';
import { loadRecords, saveRecord } from '../storage/records.js';

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  text = '',
  className = '',
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.textContent = text;
  node.className = className;
  return node;
}

function formatTime(milliseconds: number): string {
  const seconds = Math.floor(Math.max(0, milliseconds) / 1000);
  const minutes = Math.floor(seconds / 60);

  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(
    2,
    '0',
  )}`;
}

function createSelect(
  id: string,
  values: readonly number[],
  selected: number,
): HTMLSelectElement {
  const select = element('select');
  select.id = id;

  values.forEach((value) => {
    const option = element('option', String(value));
    option.value = String(value);
    option.selected = value === selected;
    select.append(option);
  });

  return select;
}

export function startApp(): void {
  const root = element('main', '', 'app');
  document.body.append(root);

  let length = 4;
  let base = 10;
  let state: GameState | null = null;
  let message = 'Выбери настройки и начни игру.';
  let timerId: number | undefined;

  function render(): void {
    if (timerId !== undefined) {
      window.clearInterval(timerId);
      timerId = undefined;
    }

    root.replaceChildren();

    const title = element('h1', 'Быки и коровы');
    const description = element(
      'p',
      'Угадай секрет без повторяющихся цифр. Ноль может стоять первым.',
      'description',
    );
    const rules = element(
      'p',
      'Бык — цифра на своём месте. Корова — цифра есть, но на другом месте.',
      'description',
    );

    root.append(title, description, rules);

    const settings = element('section', '', 'panel');
    settings.append(element('h2', 'Настройки'));

    const controls = element('div', '', 'controls');

    const baseLabel = element('label', 'Система счисления');
    baseLabel.htmlFor = 'base';

    const baseSelect = createSelect('base', [2, 8, 10, 16], base);

    const lengthLabel = element('label', 'Количество цифр');
    lengthLabel.htmlFor = 'length';

    const lengths = [2, 3, 4, 5, 6].filter((value) => value <= base);
    const lengthSelect = createSelect('length', lengths, length);

    baseSelect.disabled = state !== null;
    lengthSelect.disabled = state !== null;

    baseSelect.addEventListener('change', () => {
      base = Number(baseSelect.value);
      length = Math.min(length, base);
      render();
    });

    lengthSelect.addEventListener('change', () => {
      length = Number(lengthSelect.value);
      render();
    });

    const baseField = element('div', '', 'field');
    baseField.append(baseLabel, baseSelect);

    const lengthField = element('div', '', 'field');
    lengthField.append(lengthLabel, lengthSelect);

    controls.append(baseField, lengthField);
    settings.append(controls);

    const possibilities = countPossibleSecrets(length, base);
    settings.append(
      element(
        'p',
        `Возможных секретов: ${possibilities.toLocaleString('ru-RU')}`,
      ),
    );

    const gameButton = element(
      'button',
      state === null ? 'Начать игру' : 'Новая игра',
    );
    gameButton.type = 'button';

    gameButton.addEventListener('click', () => {
      if (state === null) {
        state = createGame(length, base, Date.now());
        message = 'Секрет создан. Введи первую попытку.';
      } else {
        state = null;
        message = 'Выбери настройки для новой игры.';
      }

      render();
    });

    settings.append(gameButton);
    root.append(settings);

    const status = element('p', message, 'message');
    status.setAttribute('role', 'status');
    root.append(status);

    const current = state;

    if (current !== null) {
      const game = element('section', '', 'panel');
      game.append(element('h2', 'Текущий раунд'));

      const statistics = element('div', '', 'statistics');
      const attempts = element('span', `Попыток: ${current.history.length}`);
      const clock = element('span');

      const updateClock = (): void => {
        const end = current.finishedAt ?? Date.now();
        clock.textContent = `Время: ${formatTime(end - current.startedAt)}`;
      };

      updateClock();

      if (current.finishedAt === null) {
        timerId = window.setInterval(updateClock, 1000);
      }

      statistics.append(attempts, clock);
      game.append(statistics);

      if (current.finishedAt === null) {
        const form = element('form', '', 'guess-form');
        const label = element('label', 'Твоя попытка');
        label.htmlFor = 'guess';

        const input = element('input');
        input.id = 'guess';
        input.type = 'text';
        input.autocomplete = 'off';
        input.spellcheck = false;
        input.maxLength = length;
        input.placeholder = `${length} разных символов`;
        input.setAttribute('aria-describedby', 'allowed-digits');

        if (base !== 16) {
          input.inputMode = 'numeric';
        }

        const isDigit = createDigitValidator(base);

        input.addEventListener('input', () => {
          input.value = [...input.value.toLowerCase()]
            .filter(isDigit)
            .slice(0, length)
            .join('');
        });

        const hint = element(
          'p',
          `Разрешены: ${'0123456789abcdef'.slice(0, base)}. Без повторов.`,
          'description',
        );
        hint.id = 'allowed-digits';

        const submit = element('button', 'Проверить');
        submit.type = 'submit';

        form.addEventListener('submit', (event) => {
          event.preventDefault();

          if (state === null) {
            return;
          }

          const result = submitGuess(state, input.value, Date.now());

          if (result.status === 'invalid') {
            status.textContent = `Введи ровно ${length} допустимых символов без повторов.`;
            input.focus();
            return;
          }

          if (result.status === 'duplicate') {
            status.textContent = 'Такая попытка уже есть в истории.';
            input.focus();
            return;
          }

          if (result.status === 'finished') {
            return;
          }

          state = result.state;
          message = 'Попытка добавлена. Продолжай!';

          if (state.finishedAt !== null) {
            const durationMs = state.finishedAt - state.startedAt;
            let saved: boolean;

            try {
              saved = saveRecord(window.localStorage, {
                attempts: state.history.length,
                durationMs,
                length: state.length,
                base: state.base,
              });
            } catch {
              saved = false;
            }

            message =
              `Победа! Секрет: ${state.secret}. ` +
              `Попыток: ${state.history.length}. ` +
              `Время: ${formatTime(durationMs)}. ` +
              (saved
                ? 'Результат сохранён.'
                : 'Не удалось сохранить рекорд в браузере.');
          }

          render();
        });

        form.append(label, input, hint, submit);
        game.append(form);
      }

      game.append(element('h3', 'История попыток'));

      if (current.history.length === 0) {
        game.append(element('p', 'Попыток пока нет.', 'description'));
      } else {
        const list = element('ol', '', 'history');

        current.history.forEach((attempt) => {
          const item = element('li');
          item.append(
            element('strong', attempt.guess),
            element('span', `Быки: ${attempt.bulls} · Коровы: ${attempt.cows}`),
          );
          list.append(item);
        });

        game.append(list);
      }

      root.append(game);
    }

    const recordsPanel = element('section', '', 'panel');
    recordsPanel.append(
      element('h2', `Топ-10 · ${length} цифр · основание ${base}`),
    );

    try {
      const records = loadRecords(window.localStorage, length, base);

      if (records.length === 0) {
        recordsPanel.append(
          element('p', 'Сохранённых результатов пока нет.', 'description'),
        );
      } else {
        const list = element('ol', '', 'records');

        records.forEach((record) => {
          list.append(
            element(
              'li',
              `${record.attempts} попыток · ${formatTime(record.durationMs)}`,
            ),
          );
        });

        recordsPanel.append(list);
      }
    } catch {
      recordsPanel.append(
        element('p', 'Хранилище браузера недоступно.', 'description'),
      );
    }

    root.append(recordsPanel);

    const guessInput = document.getElementById('guess');

    if (guessInput instanceof HTMLInputElement) {
      guessInput.focus();
    }
  }

  render();
}
