import { useMemo, useState } from 'react';
import { parseAreaShapes, unmappedAreas, type GameMap } from '../core/areaMap';
import { entryLabel, matches } from '../core/entry';
import { areasFor, type AreaProgress, type Locations } from '../core/locations';
import type { DexEntry } from '../core/types';
import { MapCanvas } from './MapCanvas';

/**
 * The "Mapa" tab of the Guide. Pick an entry: its Areas light up. Tap an Area: its missing entries
 * (the list of the Areas tab). Areas without a shape are listed as text. Keyboard users use the
 * Areas tab: the canvas has no keyboard control (owner decision).
 */
export function MapTab({
  map,
  locations,
  progress,
  entries,
  version,
  onDetails,
}: {
  map: GameMap;
  locations: Locations;
  /** Areas of the player's version (`missingByArea`). */
  progress: AreaProgress[];
  entries: DexEntry[];
  /** The player's game version ("Moja wersja"), or null for all. */
  version: string | null;
  onDetails: (id: string) => void;
}) {
  const shapes = useMemo(() => parseAreaShapes(map.areas), [map.areas]);
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<DexEntry>();
  const [selected, setSelected] = useState<string>();

  const highlighted = useMemo(
    () => new Set((picked ? areasFor(locations, picked.id, version) : null)?.map((a) => a.slug)),
    [picked, locations, version],
  );
  const found = query ? entries.filter((it) => matches(it, query)).slice(0, 6) : [];
  const chosen = progress.find((p) => p.area.slug === selected);
  const unmapped = unmappedAreas(progress, shapes, locations);

  return (
    <div className="map-tab">
      <label>
        Znajdź wpis <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>
      {picked && (
        <p>
          Obszary: {entryLabel(picked)}{' '}
          <button
            onClick={() => {
              setPicked(undefined);
              setQuery('');
            }}
          >
            Wyczyść
          </button>
        </p>
      )}
      {found.length > 0 && (
        <ul className="map-found" aria-label="Wyniki wyszukiwania">
          {found.map((it) => (
            <li key={it.id}>
              <button
                onClick={() => {
                  setPicked(it);
                  setQuery('');
                }}
              >
                {entryLabel(it)}
              </button>
            </li>
          ))}
        </ul>
      )}
      <MapCanvas
        shapes={shapes}
        names={locations.areas}
        base={map.base}
        tiles={map.tiles}
        highlighted={highlighted}
        selected={selected}
        onSelect={setSelected}
      />
      {selected && (
        <section aria-label="Wybrany obszar">
          <h4>{locations.areas[selected] ?? selected}</h4>
          {chosen?.missing.length ? (
            <ul>
              {chosen.missing.map((it) => (
                <li key={it.id}>
                  <button onClick={() => onDetails(it.id)}>{entryLabel(it)}</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mono-mute">Nic nie brakuje.</p>
          )}
        </section>
      )}
      {unmapped.length > 0 && (
        <p className="mono-mute">
          Bez kształtu na mapie:{' '}
          {unmapped.map((p) => `${p.area.name} (brakuje: ${p.missing.length})`).join(', ')}. Zobacz
          zakładkę Obszary.
        </p>
      )}
    </div>
  );
}
