import { useState } from 'react';
import type { Badge } from '../core/badges';
import type { GameMap } from '../core/areaMap';
import { collectibleId } from '../core/entry';
import type { AreaProgress, Locations } from '../core/locations';
import type { CollectibleSet, DexEntry } from '../core/types';
import { AreaList } from './AreaList';
import { BadgeList } from './BadgeList';
import { Dialog } from './Dialog';
import { MapTab } from './MapTab';

const fill = (url: string, section: string, n: number) =>
  url.replaceAll('{section}', section).replaceAll('{n}', String(n));

export type GuideTab = 'collectibles' | 'badges' | 'areas' | 'map';

/** Guide (Poradnik): the one entry point for help features. Tabs: collectibles, badges, areas. */
export function GuideDialog({
  sets,
  badges,
  locations,
  map,
  entries,
  version,
  progress,
  onDetails,
  visible,
  tab: initialTab,
  caught,
  onToggle,
  onClose,
}: {
  sets: CollectibleSet[];
  badges: Badge[];
  /** Games without location data (Z-A) have no areas tab. */
  locations?: Locations;
  /** Area map files. No map: no "Mapa" tab. */
  map?: GameMap;
  entries: DexEntry[];
  version: string | null;
  /** Areas of the player's version (`missingByArea`). */
  progress: AreaProgress[];
  onDetails: (id: string) => void;
  /** Ids the player can see now: visible entries and all collectibles. */
  visible: Set<string>;
  tab: GuideTab;
  caught: Set<string>;
  /** `label` names the collectible in the undo toast. */
  onToggle: (id: string, label: string) => void;
  onClose: () => void;
}) {
  const [picked, setTab] = useState(initialTab);
  const [onlyUncollected, setOnlyUncollected] = useState(false);
  const [focusPin, setFocusPin] = useState<{ id: string; seq: number }>();
  const all: [GuideTab, string, boolean][] = [
    ['collectibles', 'Znajdźki', sets.length > 0],
    ['badges', 'Odznaki', true],
    ['areas', 'Obszary', !!locations],
    ['map', 'Mapa', !!locations && !!map],
  ];
  const tabs = all.filter(([, , on]) => on);
  // A tab the game lacks (Z-A has no collectibles) falls back to the badges tab.
  const tab = tabs.some(([id]) => id === picked) ? picked : 'badges';
  return (
    <Dialog title="Poradnik" className="guide" onClose={onClose}>
      {tabs.length > 1 && (
        <div className="dialog-row">
          {tabs.map(([id, name]) => (
            <button key={id} aria-pressed={tab === id} onClick={() => setTab(id)}>
              {name}
            </button>
          ))}
        </div>
      )}
      {tab === 'badges' && <BadgeList badges={badges} caught={caught} visible={visible} />}
      {tab === 'areas' && locations && (
        <AreaList locations={locations} progress={progress} onDetails={onDetails} />
      )}
      {tab === 'map' && locations && map && (
        <MapTab
          map={map}
          locations={locations}
          progress={progress}
          entries={entries}
          version={version}
          onDetails={onDetails}
          sets={sets}
          caught={caught}
          onToggleCollectible={onToggle}
          focusPin={focusPin}
        />
      )}
      {(tab === 'collectibles' ? sets : []).map((set) => (
        <section key={set.id}>
          <div className="collectibles-head">
            <h4>{set.name}</h4>
            <label>
              <input
                type="checkbox"
                checked={onlyUncollected}
                onChange={(e) => setOnlyUncollected(e.target.checked)}
              />{' '}
              Tylko niezdobyte
            </label>
          </div>
          <p className="mono-mute">
            {set.intro} Źródło:{' '}
            <a href={set.source.url} target="_blank" rel="noreferrer">
              {set.source.name}
            </a>
            .
          </p>
          {set.sections.map((sec) => {
            const ns = Array.from({ length: sec.count }, (_, i) => i + 1);
            const done = ns.filter((n) => caught.has(collectibleId(set.id, sec.id, n))).length;
            const shown = onlyUncollected
              ? ns.filter((n) => !caught.has(collectibleId(set.id, sec.id, n)))
              : ns;
            return (
              <details
                key={sec.id}
                role="group"
                aria-label={sec.name}
                className="collectibles"
                open={done < sec.count}
                style={
                  sec.color
                    ? { borderLeft: `4px solid ${sec.color}`, paddingLeft: '0.6rem' }
                    : undefined
                }
              >
                <summary>
                  <strong>{sec.name}</strong>{' '}
                  <span className="mono-mute">
                    {done}/{sec.count}
                  </span>{' '}
                  <progress value={done} max={sec.count} />
                </summary>
                <p className="mono-mute">{sec.area}</p>
                {shown.length === 0 ? (
                  <p className="mono-mute">Wszystkie zdobyte.</p>
                ) : (
                  <ul>
                    {shown.map((n) => {
                      const id = collectibleId(set.id, sec.id, n);
                      return (
                        <li key={n} className="collectible-card">
                          <div className="collectible-top">
                            <label>
                              <input
                                type="checkbox"
                                checked={caught.has(id)}
                                onChange={() => onToggle(id, `${set.unitLabel} ${n} (${sec.name})`)}
                              />{' '}
                              {set.unitLabel} {n}
                            </label>
                            {sec.coords && map && locations && (
                              <button
                                type="button"
                                onClick={() => {
                                  setFocusPin((prev) => ({ id, seq: (prev?.seq ?? 0) + 1 }));
                                  setTab('map');
                                }}
                              >
                                Pokaż na mapie
                              </button>
                            )}
                          </div>
                          {set.links.map((l) =>
                            l.label === 'zdjęcie' ? (
                              <a
                                key={l.label}
                                href={fill(l.url, sec.id, n)}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={l.label}
                              >
                                <img
                                  src={fill(l.url, sec.id, n)}
                                  alt={`${sec.name} — ${set.unitLabel} ${n}`}
                                  className="collectible-img"
                                  loading="lazy"
                                />
                              </a>
                            ) : (
                              <a
                                key={l.label}
                                href={fill(l.url, sec.id, n)}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {l.label}
                              </a>
                            ),
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </details>
            );
          })}
        </section>
      ))}
      <div className="dialog-row">
        <button onClick={onClose}>Zamknij</button>
      </div>
    </Dialog>
  );
}
