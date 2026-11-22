import { collectibleId } from '../core/entry';
import type { CollectibleSet } from '../core/types';
import { Dialog } from './Dialog';

const fill = (url: string, section: string, n: number) =>
  url.replaceAll('{section}', section).replaceAll('{n}', String(n));

/** Guide (Poradnik): the one entry point for help features. Now: collectible checklists. */
export function GuideDialog({
  sets,
  caught,
  onToggle,
  onClose,
}: {
  sets: CollectibleSet[];
  caught: Set<string>;
  /** `label` names the collectible in the undo toast. */
  onToggle: (id: string, label: string) => void;
  onClose: () => void;
}) {
  return (
    <Dialog title="Poradnik" className="guide" onClose={onClose}>
      {sets.map((set) => (
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
