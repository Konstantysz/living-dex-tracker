import { entryLabel, numberText } from '../core/entry';
import {
  areasFor,
  hasPaldeaArea,
  pokemapsEntryUrl,
  type AreaProgress,
  type Locations,
} from '../core/locations';
import type { DexEntry, GameConfig, Kind } from '../core/types';
import { Dialog } from './Dialog';

// Same groups as the colour stripes in the Legend.
const KIND: Record<Kind, string> = {
  base: 'podstawowa',
  fem: 'samica',
  form: 'forma',
  alc: 'forma',
  go: 'forma',
  nreg: 'regionalna',
  reg: 'regionalna',
  xreg: 'regionalna',
  bat: 'bitewna',
  xbat: 'bitewna',
};

/** "Flabébé" -> "flabebe", "Great Tusk" -> "greattusk", as in Serebii URLs. */
const serebiiName = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[\p{M}\s]/gu, '')
    .toLowerCase();

/** Details dialog (Szczegóły) of one entry. */
export function DetailsDialog({
  entry: it,
  config,
  locations,
  version,
  crowded,
  onClose,
}: {
  /** Area of this entry where many entries are missing (`crowdedArea`). */
  crowded?: AreaProgress;
  entry: DexEntry;
  config: GameConfig;
  locations?: Locations;
  /** Game version of the player (`gameVersion`), null for both. */
  version: string | null;
  onClose: () => void;
}) {
  const ver = it.v && config.exclusives[it.v];
  const areas = locations && areasFor(locations, it.id, version);
  const page = locations?.entries[it.id]?.page;
  return (
    <Dialog title={entryLabel(it)} className="details" onClose={onClose}>
      <dl>
        <dt>Numer</dt>
        <dd>
          {numberText(it, config.dexes)}
          {it.n ? ` · nat. #${it.nat}` : ''}
        </dd>
        <dt>Rodzaj</dt>
        <dd>{KIND[it.k]}</dd>
        {ver && (
          <>
            <dt>Ekskluzyw</dt>
            <dd>tylko {ver.name}</dd>
          </>
        )}
      </dl>
      {locations && (
        <section className="locations">
          <h4>
            Miejsca złapania
            {version && config.exclusives[version] ? ` (${config.exclusives[version].name})` : ''}
          </h4>
          {areas ? (
            <ul>
              {areas.map((a) => (
                <li key={a.slug}>{a.name}</li>
              ))}
            </ul>
          ) : (
            <p>Brak danych — sprawdź na Serebii.</p>
          )}
          <p className="source">
            <a
              href={page ? `${locations.source}${page}/` : locations.source}
              target="_blank"
              rel="noreferrer"
            >
              Źródło: Serebii
            </a>
            , {locations.scraped}
          </p>
          {hasPaldeaArea(locations, areas) && (
            <p>
              <a href={pokemapsEntryUrl(it.name)} target="_blank" rel="noopener noreferrer">
                Zobacz na PokéMaps
              </a>
            </p>
          )}
        </section>
      )}
      {crowded && (
        <p className="tip">
          Tu brakuje Ci wielu wpisów: {crowded.area.name} ({crowded.missing.length}). Złap je przy
          okazji.
        </p>
      )}
      <div className="dialog-row">
        {config.serebii && (
          <a
            href={config.serebii.replace('{name}', serebiiName(it.name))}
            target="_blank"
            rel="noreferrer"
          >
            Serebii
          </a>
        )}
        <button onClick={onClose}>Zamknij</button>
      </div>
    </Dialog>
  );
}
