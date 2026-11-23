import { entryLabel } from '../core/entry';
import {
  inPaldea,
  pokearthUrl,
  pokemapsAreaUrl,
  type AreaProgress,
  type Locations,
} from '../core/locations';

/** The "Obszary" tab of the Guide: areas by number of missing entries. */
export function AreaList({
  locations,
  progress,
  onDetails,
}: {
  locations: Locations;
  progress: AreaProgress[];
  /** A tap on an entry opens its details. It never toggles caught. */
  onDetails: (id: string) => void;
}) {
  return (
    <ul className="areas">
      {progress.map(({ area, missing }) => {
        const link = (
          <>
            <a href={pokearthUrl(locations, area.slug)} target="_blank" rel="noreferrer">
              Pokéarth
            </a>
            {inPaldea(locations, area.slug) && (
              <>
                {' '}
                <a
                  href={pokemapsAreaUrl(locations, area.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Zobacz na PokéMaps
                </a>
              </>
            )}
          </>
        );
        return missing.length ? (
          <li key={area.slug}>
            <details>
              <summary>
                {area.name} <span className="mono-mute">brakuje: {missing.length}</span>
              </summary>
              <ul>
                {missing.map((it) => (
                  <li key={it.id}>
                    <button onClick={() => onDetails(it.id)}>{entryLabel(it)}</button>
                  </li>
                ))}
              </ul>
              {link}
            </details>
          </li>
        ) : (
          <li key={area.slug} className="mono-mute">
            {area.name} — kompletne {link}
          </li>
        );
      })}
    </ul>
  );
}
