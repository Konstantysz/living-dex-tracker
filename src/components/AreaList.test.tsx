import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import type { AreaProgress, Locations } from '../core/locations';
import { AreaList } from './AreaList';

const locations: Locations = {
  source: 'https://www.serebii.net/pokedex-sv/',
  scraped: '2026-11-22',
  areas: { applehills: 'Apple Hills', asadodesert: 'Asado Desert' },
  regions: { applehills: 'kitakami', asadodesert: 'paldea' },
  entries: {},
};
const progress: AreaProgress[] = [
  { area: { slug: 'applehills', name: 'Apple Hills' }, missing: [] },
  { area: { slug: 'asadodesert', name: 'Asado Desert' }, missing: [] },
];

test('only a Paldea area gets a PokéMaps link, with no query string', () => {
  render(<AreaList locations={locations} progress={progress} onDetails={() => {}} />);
  const links = screen.getAllByRole('link', { name: 'Zobacz na PokéMaps' });
  expect(links).toHaveLength(1);
  expect(links[0]).toHaveAttribute('href', 'https://pokemaps.net/maps/sv/paldea/asado-desert');
  expect(links[0]).toHaveAttribute('target', '_blank');
  expect(links[0]).toHaveAttribute('rel', 'noopener noreferrer');
});
