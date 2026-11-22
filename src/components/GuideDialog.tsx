import { useState } from 'react';
import type { Badge } from '../core/badges';
import { collectibleId } from '../core/entry';
import type { CollectibleSet } from '../core/types';
import { BadgeList } from './BadgeList';
import { Dialog } from './Dialog';

const fill = (url: string, section: string, n: number) =>
  url.replaceAll('{section}', section).replaceAll('{n}', String(n));

export type GuideTab = 'collectibles' | 'badges';

/** Guide (Poradnik): the one entry point for help features. Tabs: collectibles and badges. */
export function GuideDialog({
  sets,
  badges,
  visible,
  tab: initialTab,
  caught,
  onToggle,
  onClose,
}: {
  sets: CollectibleSet[];
  badges: Badge[];
  /** Ids the player can see now: visible entries and all collectibles. */
  visible: Set<string>;
  tab: GuideTab;
  caught: Set<string>;
  /** `label` names the collectible in the undo toast. */
  onToggle: (id: string, label: string) => void;
  onClose: () => void;
}) {
  const [picked, setTab] = useState(initialTab);
  // A game without collectibles (Z-A) has only the badges tab.
  const tab = sets.length ? picked : 'badges';
  const tabs: [GuideTab, string][] = [
    ['collectibles', 'Znajdźki'],
    ['badges', 'Odznaki'],
  ];
  return (
    <Dialog title="Poradnik" className="guide" onClose={onClose}>
      {sets.length > 0 && (
        <div className="dialog-row">
          {tabs.map(([id, name]) => (
            <button key={id} aria-pressed={tab === id} onClick={() => setTab(id)}>
              {name}
            </button>
          ))}
        </div>
      )}
      {tab === 'badges' && <BadgeList badges={badges} caught={caught} visible={visible} />}
      {(tab === 'collectibles' ? sets : []).map((set) => (
        <section key={set.id}>
          <h4>{set.name}</h4>
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
            return (
              <fieldset key={sec.id} className="collectibles">
                <legend>
                  {sec.name}{' '}
                  <span className="mono-mute">
                    {done}/{sec.count}
                  </span>
                </legend>
                <p className="mono-mute">{sec.area}</p>
                <ul>
                  {ns.map((n) => {
                    const id = collectibleId(set.id, sec.id, n);
                    return (
                      <li key={n}>
                        <label>
                          <input
                            type="checkbox"
                            checked={caught.has(id)}
                            onChange={() => onToggle(id, `${set.unitLabel} ${n} (${sec.name})`)}
                          />{' '}
                          {set.unitLabel} {n}
                        </label>
                        {set.links.map((l) => (
                          <a
                            key={l.label}
                            href={fill(l.url, sec.id, n)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {l.label}
                          </a>
                        ))}
                      </li>
                    );
                  })}
                </ul>
              </fieldset>
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
