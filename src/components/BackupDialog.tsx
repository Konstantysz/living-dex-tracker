import { useState } from 'react';
import { entryCount } from '../core/entry';
import { exportCode, importCode } from '../core/storage';
import { CopyButton, Dialog } from './Dialog';

export function BackupDialog({
  caught,
  collectibles,
  onLoad,
  onClose,
}: {
  caught: Set<string>;
  /** Names of the game's collectible sets, which the code also carries. */
  collectibles: string[];
  onLoad: (c: Set<string>) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState(() => exportCode(caught));
  const [error, setError] = useState(false);
  // A valid code waits here until the player confirms that it replaces the current progress.
  const [pending, setPending] = useState<Set<string> | null>(null);
  const load = () => {
    const c = importCode(text);
    if (!c) return setError(true);
    setPending(c);
  };
  return (
    <Dialog title="Kopia postępu" onClose={onClose}>
      <p className="mono-mute">
        Postęp zapisuje się w tej przeglądarce. Skopiuj kod poniżej, żeby go przenieść; wklej kod i
        kliknij „Wczytaj”, żeby go odtworzyć.
        {collectibles.length > 0 && ` Kod zawiera też: ${collectibles.join(', ')}.`}
      </p>
      <textarea
        value={text}
        aria-label="Kod kopii"
        onChange={(e) => {
          setText(e.target.value);
          setError(false);
        }}
      />
      {error && <p role="alert">Nieprawidłowy kod.</p>}
      {pending ? (
        <>
          <p>
            Złapane w kodzie: {entryCount(pending)}. Obecnie: {entryCount(caught)}. Wczytać i
            zastąpić obecny postęp?
          </p>
          <div className="dialog-row">
            <button
              onClick={() => {
                onLoad(pending);
                onClose();
              }}
            >
              Tak, zastąp
            </button>
            <button onClick={() => setPending(null)}>Anuluj</button>
          </div>
        </>
      ) : (
        <div className="dialog-row">
          <CopyButton text={text} />
          <button onClick={load}>Wczytaj</button>
          <button onClick={onClose}>Zamknij</button>
        </div>
      )}
    </Dialog>
  );
}
