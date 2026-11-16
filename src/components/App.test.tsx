import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test } from 'vitest';
import { exportCode } from '../core/storage';
import { App } from './App';

beforeEach(() => {
  localStorage.clear();
  location.hash = '#sv';
});

const cell = (name: RegExp) => screen.getByRole('button', { name });

test('renders default layout stats and progress', () => {
  render(<App />);
  expect(screen.getByText(/31 boxów · 917 slotów · 13 pustych/)).toBeInTheDocument();
  expect(screen.getByText(/0 \/ 917 \(0\.0%\)/)).toBeInTheDocument();
});

test('click and keyboard toggle caught state and persist it', async () => {
  const user = userEvent.setup();
  render(<App />);
  const sprig = cell(/^Sprigatito, 1$/);
  expect(sprig).toHaveAttribute('aria-pressed', 'false');
  await user.click(sprig);
  expect(sprig).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByText(/1 \/ 917/)).toBeInTheDocument();
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
  await user.click(screen.getByLabelText(/formy bitewne/));
  expect(screen.queryByText(/31 boxów · 917/)).not.toBeInTheDocument();
  await user.click(screen.getByLabelText(/wszystkie Alcremie/));
  expect(JSON.parse(localStorage.getItem('ldt:sv:opts')!)).toMatchObject({ bat: true, alc: false });
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
  expect(screen.getByText(/2 \/ 917/)).toBeInTheDocument();
});

test('text dialog lists boxes in 5 rows of 6', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByText('Układ jako tekst'));
  const text = (screen.getByLabelText('Układ jako tekst') as HTMLTextAreaElement).value;
  expect(text).toMatch(/^=== Box 1 ===\n(.* \| .*\n){5}\n=== Box 2 ===/);
  expect(within(document.body).getAllByText('Kopiuj').length).toBeGreaterThan(0);
});
