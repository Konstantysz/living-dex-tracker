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

test('toggles recompute the layout live', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByText('Ustawienia'));
  expect(screen.getAllByRole('checkbox')).toHaveLength(2);
  await user.click(screen.getByLabelText(/wszystkie wzory Vivillon/));
  expect(JSON.parse(localStorage.getItem('ldt:sv:opts')!)).toEqual({ go: true, dim: false });
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

test('a game without collectibles has no guide', () => {
  location.hash = '#za';
  render(<App />);
  expect(screen.queryByText('Poradnik')).not.toBeInTheDocument();
});

test('text dialog lists boxes in 5 rows of 6', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByText('Układ jako tekst'));
  const text = (screen.getByLabelText('Układ jako tekst') as HTMLTextAreaElement).value;
  expect(text).toMatch(/^=== Box 1 ===\n(.* \| .*\n){5}\n=== Box 2 ===/);
  expect(within(document.body).getAllByText('Kopiuj').length).toBeGreaterThan(0);
});
