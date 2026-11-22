import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test } from 'vitest';
import { DEFAULT_OPTIONS, layoutBoxes } from '../core/layout';
import { exportCode } from '../core/storage';
import { findGame } from '../games';
import { App } from './App';

// Expected numbers come from the engine, so a data change does not break these tests.
const boxes = layoutBoxes(findGame('sv').layout, DEFAULT_OPTIONS);
const total = boxes.flat().filter(Boolean).length;
const empty = boxes.length * 30 - total;

beforeEach(() => {
  localStorage.clear();
  location.hash = '#sv';
});

const cell = (name: RegExp) => screen.getByRole('button', { name });

test('renders default layout stats and progress', () => {
  render(<App />);
  expect(
    screen.getByText(`${boxes.length} boxów · ${total} slotów · ${empty} pustych`),
  ).toBeInTheDocument();
  expect(screen.getByText(`0 / ${total} (0.0%)`)).toBeInTheDocument();
});

test('click and keyboard toggle caught state and persist it', async () => {
  const user = userEvent.setup();
  render(<App />);
  const sprig = cell(/^Sprigatito, 1$/);
  expect(sprig).toHaveAttribute('aria-pressed', 'false');
  await user.click(sprig);
  expect(sprig).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByText(new RegExp(`^1 / ${total}`))).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem('ldt:sv:caught')!)).toEqual(['sprigatito']);
  sprig.focus();
  await user.keyboard('{Enter}');
  expect(sprig).toHaveAttribute('aria-pressed', 'false');
  await user.keyboard(' ');
  expect(sprig).toHaveAttribute('aria-pressed', 'true');
});

const details = () => screen.queryByRole('dialog');

test('the "i" button, a right click and the keyboard open details without a toggle', async () => {
  const user = userEvent.setup();
  render(<App />);
  const sprig = cell(/^Sprigatito, 1$/);
  await user.click(sprig);
  expect(sprig).toHaveAttribute('aria-pressed', 'true');
  expect(details()).not.toBeInTheDocument();

  await user.click(within(sprig).getByText('i'));
  const d = screen.getByRole('dialog', { name: 'Sprigatito' });
  expect(d).toHaveTextContent('Paldea #1 · nat. #906');
  expect(d).toHaveTextContent('podstawowa');
  expect(d).not.toHaveTextContent('Ekskluzyw');
  expect(within(d).getByRole('link', { name: 'Serebii' })).toHaveAttribute(
    'href',
    'https://www.serebii.net/pokedex-sv/sprigatito/',
  );
  expect(sprig).toHaveAttribute('aria-pressed', 'true');
  await user.click(within(d).getByText('Zamknij'));
  expect(details()).not.toBeInTheDocument();

  const gestures = [
    () => user.pointer({ keys: '[MouseRight]', target: sprig }),
    () => user.keyboard('i'),
    () => user.keyboard('{Shift>}{Enter}{/Shift}'),
  ];
  for (const gesture of gestures) {
    sprig.focus();
    await gesture();
    expect(details()).toBeInTheDocument();
    expect(sprig).toHaveAttribute('aria-pressed', 'true');
    await user.click(within(details()!).getByText('Zamknij'));
  }
});

test('details show the version exclusive mark', async () => {
  const user = userEvent.setup();
  render(<App />);
  const it = boxes.flat().find((x) => x?.v === 'S')!;
  await user.pointer({
    keys: '[MouseRight]',
    target: document.querySelector(`[data-id="${it.id}"]`)!,
  });
  expect(screen.getByRole('dialog')).toHaveTextContent('Ekskluzywtylko Scarlet');
});

test('the Serebii link drops accents and spaces', async () => {
  const user = userEvent.setup();
  render(<App />);
  const it = boxes.flat().find((x) => x?.name === 'Flabébé')!;
  await user.pointer({
    keys: '[MouseRight]',
    target: document.querySelector(`[data-id="${it.id}"]`)!,
  });
  expect(screen.getByRole('link', { name: 'Serebii' })).toHaveAttribute(
    'href',
    'https://www.serebii.net/pokedex-sv/flabebe/',
  );
});

test('in details mode a tap opens details and does not toggle', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByLabelText('Tryb: szczegóły'));
  const sprig = cell(/^Sprigatito, 1$/);
  await user.click(sprig);
  expect(screen.getByRole('dialog', { name: 'Sprigatito' })).toBeInTheDocument();
  expect(sprig).toHaveAttribute('aria-pressed', 'false');
  await user.click(screen.getByText('Zamknij'));
  await user.click(screen.getByLabelText('Tryb: szczegóły'));
  await user.click(sprig);
  expect(sprig).toHaveAttribute('aria-pressed', 'true');
  expect(details()).not.toBeInTheDocument();
});

test('toggles recompute the layout live', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByText('Ustawienia'));
  expect(within(screen.getByRole('dialog')).getAllByRole('checkbox')).toHaveLength(2);
  await user.click(screen.getByLabelText(/wszystkie wzory Vivillon/));
  expect(JSON.parse(localStorage.getItem('ldt:sv:opts')!)).toEqual({
    go: true,
    dim: false,
    version: '',
  });
  const goTotal = layoutBoxes(findGame('sv').layout, { go: true }).flat().filter(Boolean).length;
  expect(screen.getByText(new RegExp(`^0 / ${goTotal}`))).toBeInTheDocument();
});

test('old saved alc: false shows a notice once', () => {
  localStorage.setItem('ldt:sv:opts', JSON.stringify({ alc: false, noSplit: true }));
  const { unmount } = render(<App />);
  expect(screen.getByRole('status')).toHaveTextContent(/wszystkie 63 formy Alcremie/);
  expect(screen.queryByText('Cofnij')).not.toBeInTheDocument();
  unmount();
  render(<App />);
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

test('a game without Alcremie forms shows no Alcremie notice', () => {
  location.hash = '#za';
  localStorage.setItem('ldt:za:opts', JSON.stringify({ alc: false }));
  render(<App />);
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

test('game version is stored and keeps exclusives of the other version visible', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByText('Ustawienia'));
  const select = screen.getByLabelText(/Moja wersja/);
  expect(select).toHaveValue('');
  await user.selectOptions(select, 'Scarlet');
  expect(JSON.parse(localStorage.getItem('ldt:sv:opts')!)).toMatchObject({ version: 'S' });
  expect(document.querySelector('[data-id="misdreavus"]')).toHaveTextContent('V');
});

test('game without versions does not show the version setting', async () => {
  location.hash = '#za';
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByText('Ustawienia'));
  expect(screen.queryByLabelText(/Moja wersja/)).not.toBeInTheDocument();
});

test('search highlights matches by name and number', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.type(screen.getByLabelText('Szukaj'), 'k12');
  const hits = document.querySelectorAll('[class*="hit"]');
  expect(hits).toHaveLength(1);
  expect(hits[0]).toHaveAttribute('data-id');
});

test('backup dialog imports a code and rejects invalid ones', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByText('Kopia postępu'));
  const box = screen.getByLabelText('Kod kopii');
  await user.clear(box);
  await user.type(box, 'zly kod');
  await user.click(screen.getByText('Wczytaj'));
  expect(screen.getByText('Nieprawidłowy kod.')).toBeInTheDocument();
  await user.clear(box);
  await user.click(box);
  await user.paste(exportCode(new Set(['sprigatito', 'floragato'])));
  await user.click(screen.getByText('Wczytaj'));
  expect(screen.getByText(new RegExp(`^0 / ${total}`))).toBeInTheDocument();
  await user.click(screen.getByText('Tak, zastąp'));
  expect(screen.getByText(new RegExp(`^2 / ${total}`))).toBeInTheDocument();
});

test('a toggle can be undone from the toast', async () => {
  const user = userEvent.setup();
  render(<App />);
  const sprig = cell(/^Sprigatito, 1$/);
  await user.click(sprig);
  expect(screen.getByRole('status')).toHaveTextContent('Złapano Sprigatito');
  await user.click(screen.getByText('Cofnij'));
  expect(sprig).toHaveAttribute('aria-pressed', 'false');
  expect(JSON.parse(localStorage.getItem('ldt:sv:caught')!)).toEqual([]);
  expect(screen.queryByText('Cofnij')).not.toBeInTheDocument();
});

test('an import asks first, and the toast can undo it', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(cell(/^Sprigatito, 1$/));
  await user.click(screen.getByText('Kopia postępu'));
  const box = screen.getByLabelText('Kod kopii');
  await user.clear(box);
  await user.click(box);
  await user.paste(exportCode(new Set(['fuecoco', 'crocalor', 'quaxly'])));
  await user.click(screen.getByText('Wczytaj'));
  expect(screen.getByText(/Złapane w kodzie: 3\. Obecnie: 1\./)).toBeInTheDocument();
  await user.click(screen.getByText('Anuluj'));
  expect(screen.queryByText(/Złapane w kodzie/)).not.toBeInTheDocument();
  await user.click(screen.getByText('Wczytaj'));
  await user.click(screen.getByText('Tak, zastąp'));
  expect(screen.getByText(new RegExp(`^3 / ${total}`))).toBeInTheDocument();
  await user.click(screen.getByText('Cofnij'));
  expect(screen.getByText(new RegExp(`^1 / ${total}`))).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem('ldt:sv:caught')!)).toEqual(['sprigatito']);
});

test('the areas tab opens details on a tap and does not toggle caught', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByText('Poradnik'));
  await user.click(screen.getByRole('button', { name: 'Obszary' }));
  const area = within(document.querySelector<HTMLElement>('.areas details')!);
  await user.click(area.getByText(/brakuje:/));
  expect(area.getByRole('link', { name: 'Pokéarth' })).toHaveAttribute(
    'href',
    expect.stringMatching(/^https:\/\/www\.serebii\.net\/pokearth\/[a-z]+\/[a-z']+\.shtml$/),
  );
  await user.click(area.getAllByRole('button')[0]!);
  expect(document.querySelector('dialog.details')).toBeInTheDocument();
  expect(localStorage.getItem('ldt:sv:caught')).toBeNull();
});

test('the guide tracks collectibles in the caught set without counting them', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByText('Poradnik'));
  expect(screen.getByRole('heading', { name: 'Słupki ruin' })).toBeInTheDocument();
  const tingLu = screen.getByRole('group', { name: /Ting-Lu/ });
  expect(tingLu).toHaveTextContent('0/8');
  await user.click(within(tingLu).getByLabelText('Słupek 1'));
  expect(tingLu).toHaveTextContent('1/8');
  expect(screen.getByRole('status')).toHaveTextContent('Zaznaczono Słupek 1 (Ting-Lu)');
  expect(JSON.parse(localStorage.getItem('ldt:sv:caught')!)).toEqual(['stake:ting-lu-1']);
  expect(within(tingLu).getAllByRole('link', { name: 'mapka' })[2]).toHaveAttribute(
    'href',
    'https://www.serebii.net/scarletviolet/stakes/map/ting-lu3.jpg',
  );
  await user.click(screen.getByText('Zamknij'));

  // Collectibles are not entries: progress, the text export and the import count ignore them.
  expect(screen.getByText(new RegExp(`^0 / ${total}`))).toBeInTheDocument();
  await user.click(screen.getByText('Układ jako tekst'));
  const text = (screen.getByLabelText('Układ jako tekst') as HTMLTextAreaElement).value;
  expect(text).not.toContain('stake');
  expect(text).not.toContain('Słupek');
  await user.click(screen.getByText('Zamknij'));

  await user.click(screen.getByText('Kopia postępu'));
  expect(screen.getByText(/Kod zawiera też: Słupki ruin\./)).toBeInTheDocument();
  const box = screen.getByLabelText('Kod kopii');
  await user.clear(box);
  await user.click(box);
  await user.paste(exportCode(new Set(['sprigatito', 'stake:chi-yu-2', 'stake:chi-yu-3'])));
  await user.click(screen.getByText('Wczytaj'));
  expect(screen.getByText(/Złapane w kodzie: 1\. Obecnie: 0\./)).toBeInTheDocument();
});

test('a game without collectibles shows only the badges tab of the guide', async () => {
  const user = userEvent.setup();
  location.hash = '#za';
  render(<App />);
  await user.click(screen.getByText('Poradnik'));
  expect(screen.queryByText('Znajdźki')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Gra bazowa' })).toBeInTheDocument();
  expect(screen.getByText('Pokédex Lumiose')).toBeInTheDocument();
});

test('a tap that earns a badge adds a toast line, an import and an undo do not', async () => {
  const user = userEvent.setup();
  render(<App />);
  expect(screen.getByRole('button', { name: 'Odznaki: 0' })).toBeInTheDocument();

  // Import all 8 Ting-Lu stakes: the import earns the shrine badge, but the toast has no line.
  await user.click(screen.getByText('Kopia postępu'));
  const box = screen.getByLabelText('Kod kopii');
  await user.clear(box);
  await user.click(box);
  const eight = Array.from({ length: 8 }, (_, i) => `stake:ting-lu-${i + 1}`);
  await user.paste(exportCode(new Set(eight)));
  await user.click(screen.getByText('Wczytaj'));
  await user.click(screen.getByText('Tak, zastąp'));
  expect(screen.getByRole('status')).toHaveTextContent('Wczytano kopię postępu');
  expect(screen.getByRole('status')).not.toHaveTextContent('🏅');
  expect(screen.getByRole('button', { name: 'Odznaki: 1' })).toBeInTheDocument();

  // The chip opens the "Odznaki" tab. Untick and tick the 8th stake: the tap earns the badge.
  await user.click(screen.getByRole('button', { name: 'Odznaki: 1' }));
  expect(screen.getByRole('button', { name: 'Odznaki' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getAllByText('???').length).toBeGreaterThan(0);
  await user.click(screen.getByRole('button', { name: 'Znajdźki' }));
  const stake8 = within(screen.getByRole('group', { name: /Ting-Lu/ })).getByLabelText('Słupek 8');
  await user.click(stake8);
  expect(screen.getByRole('status')).not.toHaveTextContent('🏅');
  await user.click(stake8);
  expect(screen.getByRole('status')).toHaveTextContent('🏅 Strażnik ruin: Ting-Lu');

  // Undo shows no toast, so no badge line.
  await user.click(screen.getByText('Cofnij'));
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Odznaki: 0' })).toBeInTheDocument();
});

test('text dialog lists boxes in 5 rows of 6', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByText('Układ jako tekst'));
  const text = (screen.getByLabelText('Układ jako tekst') as HTMLTextAreaElement).value;
  expect(text).toMatch(/^=== Box 1 ===\n(.* \| .*\n){5}\n=== Box 2 ===/);
  expect(within(document.body).getAllByText('Kopiuj').length).toBeGreaterThan(0);
});
