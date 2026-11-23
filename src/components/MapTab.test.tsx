import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Locations } from '../core/locations';
import type { DexEntry } from '../core/types';
import { MapTab } from './MapTab';

// jsdom has no WebGL: the canvas becomes a button that selects "alpha".
vi.mock('./MapCanvas', () => ({
  MapCanvas: ({
    onSelect,
    highlighted,
  }: {
    onSelect: (s: string) => void;
    highlighted: Set<string>;
  }) => <button onClick={() => onSelect('alpha')}>tap-alpha [{[...highlighted].join(',')}]</button>,
}));

const locations = {
  areas: { alpha: 'Alpha', beta: 'Beta' },
  regions: { alpha: 'paldea', beta: 'paldea' },
  entries: { a: { page: 'a', areas: { violet: ['alpha'], scarlet: ['beta'] } } },
} as unknown as Locations;
const a = { id: 'a', name: 'Aaa' } as DexEntry;
const b = { id: 'b', name: 'Bbb' } as DexEntry;
const map = {
  areas: '<path id="alpha" data-z="1" d="M0 0L9 0L9 9Z"/>',
  noPath: [],
  base: [],
  tiles: [],
};
const progress = [
  { area: { slug: 'alpha', name: 'Alpha' }, missing: [a] },
  { area: { slug: 'beta', name: 'Beta' }, missing: [b] },
];
const setup = (onDetails = vi.fn(), version: string | null = null) =>
  render(
    <MapTab
      map={map}
      locations={locations}
      progress={progress}
      entries={[a, b]}
      version={version}
      onDetails={onDetails}
    />,
  );

describe('MapTab', () => {
  it('lists the missing entries of the tapped Area', async () => {
    const onDetails = vi.fn();
    setup(onDetails);
    await userEvent.click(screen.getByText(/tap-alpha/));
    const area = within(screen.getByRole('region', { name: 'Wybrany obszar' }));
    await userEvent.click(area.getByRole('button', { name: 'Aaa' }));
    expect(onDetails).toHaveBeenCalledWith('a');
    expect(area.queryByRole('button', { name: 'Bbb' })).toBeNull();
  });

  it('lights up the Areas of a picked entry', async () => {
    setup();
    await userEvent.type(screen.getByRole('searchbox'), 'Aaa');
    const found = within(screen.getByRole('list', { name: 'Wyniki wyszukiwania' }));
    await userEvent.click(found.getByRole('button', { name: 'Aaa' }));
    expect(screen.getByText(/tap-alpha \[alpha,beta\]/)).toBeInTheDocument();
  });

  it('lights up only the Areas of the player version', async () => {
    setup(vi.fn(), 'scarlet');
    await userEvent.type(screen.getByRole('searchbox'), 'Aaa');
    const found = within(screen.getByRole('list', { name: 'Wyniki wyszukiwania' }));
    await userEvent.click(found.getByRole('button', { name: 'Aaa' }));
    expect(screen.getByText(/tap-alpha \[beta\]/)).toBeInTheDocument();
  });

  it('lists an Area without a shape as text', () => {
    setup();
    expect(screen.getByText(/Beta \(brakuje: 1\)/)).toBeInTheDocument();
  });
});
