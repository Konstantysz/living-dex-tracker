import { entryLabel, numberText } from '../core/entry';
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
  onClose,
}: {
  entry: DexEntry;
  config: GameConfig;
  onClose: () => void;
}) {
  const ver = it.v && config.exclusives[it.v];
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
      {/* Later issues add the locations (#11) and the tips here. */}
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
