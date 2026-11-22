import type { AppOptions } from '../core/storage';
import { Dialog } from './Dialog';
import s from './Header.module.css';

const TOGGLES: [keyof AppOptions, string][] = [
  ['go', 'wszystkie wzory Vivillon (wymaga Pokémon GO)'],
  ['dim', 'przyciemnij złapane'],
];

export function SettingsDialog({
  options,
  onOption,
  onClose,
}: {
  options: AppOptions;
  onOption: (k: keyof AppOptions, v: boolean) => void;
  onClose: () => void;
}) {
  return (
    <Dialog title="Ustawienia" onClose={onClose}>
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
