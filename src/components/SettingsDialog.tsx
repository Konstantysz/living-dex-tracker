import type { AppOptions } from '../core/storage';
import type { GameConfig } from '../core/types';
import { Dialog } from './Dialog';
import s from './Header.module.css';

const TOGGLES: [Exclude<keyof AppOptions, 'version'>, string][] = [
  ['alc', 'wszystkie Alcremie (63)'],
  ['go', 'wszystkie wzory Vivillon (wymaga Pokémon GO)'],
  ['noSplit', 'nie dziel małych grup (do 6 form) między boxy'],
  ['dim', 'przyciemnij złapane'],
];

export function SettingsDialog({
  options,
  exclusives,
  onOption,
  onClose,
}: {
  options: AppOptions;
  exclusives: GameConfig['exclusives'];
  onOption: <K extends keyof AppOptions>(k: K, v: AppOptions[K]) => void;
  onClose: () => void;
}) {
  const versions = Object.entries(exclusives);
  return (
    <Dialog title="Ustawienia" onClose={onClose}>
      {versions.length > 0 && (
        <label className={s.toggle} style={{ marginBottom: 8 }}>
          Moja wersja:{' '}
          <select value={options.version} onChange={(e) => onOption('version', e.target.value)}>
            {versions.map(([k, { name }]) => (
              <option key={k} value={k}>
                {name}
              </option>
            ))}
            <option value="">obie</option>
          </select>
        </label>
      )}
      {TOGGLES.map(([k, text]) => (
        <label key={k} className={s.toggle} style={{ marginBottom: 8 }}>
          <input
            type="checkbox"
            checked={options[k]}
            onChange={(e) => onOption(k, e.target.checked)}
          />{' '}
          {text}
        </label>
      ))}
      <div className="dialog-row">
        <button onClick={onClose}>Zamknij</button>
      </div>
    </Dialog>
  );
}
