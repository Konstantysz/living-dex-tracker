import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import type { Locations } from '../core/locations';
import type { DexEntry } from '../core/types';
import { findGame } from '../games';
import { DetailsDialog } from './DetailsDialog';

const { config } = findGame('sv');
const entry = (id: string): DexEntry => ({
  id,
  n: '1',
  nat: 1,
  name: id,
  form: '',
  g: '',
  k: 'base',
  s: '',
});
const locations: Locations = {
  source: 'https://www.serebii.net/pokedex-sv/',
  scraped: '2026-11-22',
  areas: { applehills: 'Apple Hills', asadodesert: 'Asado Desert' },
  regions: { applehills: 'kitakami', asadodesert: 'paldea' },
  entries: {
    a: { page: 'a', areas: { S: ['asadodesert'], V: ['applehills'] } },
    b: { page: 'b' },
  },
};
const show = (id: string, version: string | null) =>
  render(
    <DetailsDialog
      entry={entry(id)}
      config={config}
      locations={locations}
      version={version}
      onClose={() => {}}
    />,
  );

test('details show only the areas of the player version, with source and date', () => {
  show('a', 'V');
  expect(screen.getByText('Miejsca złapania (Violet)')).toBeInTheDocument();
  expect(screen.getByText('Apple Hills')).toBeInTheDocument();
  expect(screen.queryByText('Asado Desert')).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Źródło: Serebii' })).toHaveAttribute(
    'href',
    'https://www.serebii.net/pokedex-sv/a/',
  );
  expect(screen.getByText(/2026-11-22/)).toBeInTheDocument();
});

test('details show the areas of both versions when no version is set', () => {
  show('a', null);
  expect(screen.getByText('Apple Hills')).toBeInTheDocument();
  expect(screen.getByText('Asado Desert')).toBeInTheDocument();
});

test('details show the tip when the area has many missing entries', () => {
  const crowded = { area: { slug: 'applehills', name: 'Apple Hills' }, missing: [entry('a')] };
  render(
    <DetailsDialog
      entry={entry('a')}
      config={config}
      version="V"
      crowded={crowded}
      onClose={() => {}}
    />,
  );
  expect(screen.getByText(/Tu brakuje Ci wielu wpisów: Apple Hills \(1\)/)).toBeInTheDocument();
});

test('an entry without data shows "Brak danych", not an empty list', () => {
  show('b', 'S');
  expect(screen.getByText('Brak danych — sprawdź na Serebii.')).toBeInTheDocument();
  expect(screen.queryByRole('list')).not.toBeInTheDocument();
});
