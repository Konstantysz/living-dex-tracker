import { useMemo, useState } from 'react';
import { parseAreaShapes, unmappedAreas, type GameMap } from '../core/areaMap';
import { collectibleId, entryLabel, matches } from '../core/entry';
import { areasFor, type AreaProgress, type Locations } from '../core/locations';
import type { CollectibleSet, DexEntry } from '../core/types';
import { MapCanvas, type MapPin } from './MapCanvas';

const fill = (url: string, section: string, n: number) =>
  url.replaceAll('{section}', section).replaceAll('{n}', String(n));

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
  sets = [],
  caught,
  onToggleCollectible,
  focusPin,
}: {
  map: GameMap;
  locations: Locations;
  /** Areas of the player's version (`missingByArea`). */
  progress: AreaProgress[];
  entries: DexEntry[];
  /** The player's game version ("Moja wersja"), or null for all. */
  version: string | null;
  onDetails: (id: string) => void;
  sets?: CollectibleSet[];
  caught?: Set<string>;
  onToggleCollectible?: (id: string, label: string) => void;
  focusPin?: { id: string; seq: number };
}) {
  const shapes = useMemo(() => parseAreaShapes(map.areas), [map.areas]);
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<DexEntry>();
  const [selected, setSelected] = useState<string>();
  const [shrineFilter, setShrineFilter] = useState<string>('all');
  const [onlyUncollected, setOnlyUncollected] = useState(true);
  const [selectedPin, setSelectedPin] = useState<string | undefined>(focusPin?.id);

  const allPins = useMemo(() => {
    const out: (MapPin & {
      shrineId: string;
      shrineName: string;
      unitLabel: string;
      n: number;
      links: { label: string; url: string }[];
    })[] = [];
    for (const set of sets) {
      for (const sec of set.sections) {
        if (!sec.coords) continue;
        sec.coords.forEach(([x, y], idx) => {
          const n = idx + 1;
          const id = collectibleId(set.id, sec.id, n);
          out.push({
            id,
            x,
            y,
            color: sec.color ?? '#f59e0b',
            label: String(n),
            collected: caught?.has(id) ?? false,
            shrineId: sec.id,
            shrineName: sec.name,
            unitLabel: set.unitLabel,
            n,
            links: set.links.map((l) => ({ label: l.label, url: fill(l.url, sec.id, n) })),
          });
        });
      }
    }
    return out;
  }, [sets, caught]);

  const visiblePins = useMemo(
    () =>
      allPins.filter((p) => {
        if (shrineFilter === 'none') return false;
        if (shrineFilter !== 'all' && p.shrineId !== shrineFilter) return false;
        if (onlyUncollected && p.collected) return false;
        return true;
      }),
    [allPins, shrineFilter, onlyUncollected],
  );
  const activePin = allPins.find((p) => p.id === (selectedPin ?? focusPin?.id));

  const highlighted = useMemo(
    () => new Set((picked ? areasFor(locations, picked.id, version) : null)?.map((a) => a.slug)),
    [picked, locations, version],
  );
  const found = query ? entries.filter((it) => matches(it, query)).slice(0, 6) : [];
  const chosen = progress.find((p) => p.area.slug === selected);
  const unmapped = unmappedAreas(progress, shapes, locations);

  return (
    <div className="map-tab">
      <div className="map-layout">
        <div className="map-main">
          <MapCanvas
            shapes={shapes}
            names={locations.areas}
            base={map.base}
            tiles={map.tiles}
            highlighted={highlighted}
            selected={selected}
            onSelect={setSelected}
            pins={visiblePins}
            selectedPin={selectedPin}
            onSelectPin={setSelectedPin}
            focusPin={focusPin}
          />
        </div>
        <aside className="map-side">
          <label className="map-search">
            Znajdź wpis{' '}
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
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
          {allPins.length > 0 && (
            <div className="map-filters" aria-label="Filtry słupków">
              <label>
                Słupki:{' '}
                <select value={shrineFilter} onChange={(e) => setShrineFilter(e.target.value)}>
                  <option value="all">Wszystkie</option>
                  {sets.flatMap((s) =>
                    s.sections
                      .filter((sec) => sec.coords)
                      .map((sec) => (
                        <option key={sec.id} value={sec.id}>
                          {sec.name}
                        </option>
                      )),
                  )}
                  <option value="none">Ukryj</option>
                </select>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={onlyUncollected}
                  onChange={(e) => setOnlyUncollected(e.target.checked)}
                />{' '}
                Tylko niezdobyte
              </label>
            </div>
          )}
          {activePin && (
            <section aria-label="Wybrany słupek" className="map-pin-card">
              <label>
                <input
                  type="checkbox"
                  checked={activePin.collected}
                  onChange={() =>
                    onToggleCollectible?.(
                      activePin.id,
                      `${activePin.unitLabel} ${activePin.n} (${activePin.shrineName})`,
                    )
                  }
                />{' '}
                <strong>
                  {activePin.shrineName} — {activePin.unitLabel} {activePin.n}
                </strong>
              </label>
              <div className="map-pin-links">
                {activePin.links.map((l) =>
                  l.label === 'zdjęcie' ? (
                    <a key={l.label} href={l.url} target="_blank" rel="noreferrer">
                      <img
                        src={l.url}
                        alt={`${activePin.shrineName} — ${activePin.unitLabel} ${activePin.n}`}
                        className="map-pin-img"
                      />
                    </a>
                  ) : (
                    <a key={l.label} href={l.url} target="_blank" rel="noreferrer">
                      {l.label}
                    </a>
                  ),
                )}
              </div>
            </section>
          )}
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
              {unmapped.map((p) => `${p.area.name} (brakuje: ${p.missing.length})`).join(', ')}.
              Zobacz zakładkę Obszary.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
