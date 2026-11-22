import { badgeProgress, type Badge } from '../core/badges';
import s from './BadgeList.module.css';

const TRADE = 'Część wpisów jest z drugiej wersji: Union Circle lub wymiana.';
const OFF = 'Wpisy tej odznaki są ukryte w Ustawieniach.';
const PART = 'Część wpisów jest ukryta w Ustawieniach. Ukryte wpisy się nie liczą.';

/** Badges in one row: a single badge, or a collection (same title, each with an item). */
function rows(badges: Badge[]): Badge[][] {
  const out: Badge[][] = [];
  for (const b of badges) {
    const last = out.at(-1);
    if (b.item && last?.[0]?.item && last[0].title === b.title) last.push(b);
    else out.push([b]);
  }
  return out;
}

/** The "Odznaki" tab of the Guide: base-game and DLC sections. */
export function BadgeList({
  badges,
  caught,
  visible,
}: {
  badges: Badge[];
  caught: Set<string>;
  visible: Set<string>;
}) {
  const sections = [
    ['Gra bazowa', badges.filter((b) => !b.dlc)],
    ['DLC', badges.filter((b) => b.dlc)],
  ] as const;
  return sections.map(
    ([name, list]) =>
      list.length > 0 && (
        <section key={name}>
          <h4>{name}</h4>
          <ul className={s.list}>
            {rows(list).map((row) => {
              const [b] = row as [Badge];
              const ps = row.map((x) => badgeProgress(x, caught, visible));
              const earned = ps.every((p) => p.earned);
              const off = ps.every((p) => p.off);
              const secret = b.isHidden && !earned;
              const count =
                row.length > 1
                  ? `${ps.filter((p) => p.earned).length}/${row.length}`
                  : `${ps[0]!.got}/${ps[0]!.need}`;
              return (
                <li key={b.id} className={`${s.badge} ${earned ? s.earned : ''}`}>
                  <span className={s.image} aria-hidden="true">
                    {secret ? '❔' : b.image}
                  </span>
                  <div>
                    <strong>{secret ? '???' : b.title}</strong>{' '}
                    {!secret && <span className="mono-mute">{count}</span>}
                    {!secret && <p>{b.info}</p>}
                    {!secret && row.some((x) => x.trade) && <p className="mono-mute">{TRADE}</p>}
                    {off && <p className="mono-mute">{OFF}</p>}
                    {!off && ps.some((p) => p.hidden) && <p className="mono-mute">{PART}</p>}
                    {row.length > 1 && (
                      <ul className={s.items}>
                        {row.map((x, i) => (
                          <li key={x.id} className={ps[i]!.earned ? s.earned : ''}>
                            {x.item}{' '}
                            <span className="mono-mute">
                              {ps[i]!.off ? 'ukryte' : `${ps[i]!.got}/${ps[i]!.need}`}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ),
  );
}
