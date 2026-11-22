import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { entryLabel, matches } from '../core/entry';
import { layoutBoxes } from '../core/layout';
import { loadCaught, loadOptions, saveCaught, saveOptions, type AppOptions } from '../core/storage';
import { findGame, type Game } from '../games';
import { BackupDialog } from './BackupDialog';
import { BoxGrid } from './BoxGrid';
import { Header } from './Header';
import { LayoutTextDialog } from './LayoutTextDialog';
import { SettingsDialog } from './SettingsDialog';

const hashId = () => location.hash.replace(/^#/, '');

export function App() {
  const [hash, setHash] = useState(hashId);
  useEffect(() => {
    const on = () => setHash(hashId());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const game = findGame(hash);
  // key resets per-game state when the game changes
  return (
    <GameView
      key={game.config.id}
      game={game}
      onGame={(id) => {
        location.hash = id;
      }}
    />
  );
}

function GameView({ game, onGame }: { game: Game; onGame: (id: string) => void }) {
  const { config, layout } = game;
  const [caught, setCaught] = useState(() => loadCaught(config.id));
  const [options, setOptions] = useState(() => loadOptions(config.id));
  const [query, setQuery] = useState('');
  const [dialog, setDialog] = useState<'text' | 'backup' | 'settings' | null>(null);

  const boxes = useMemo(() => layoutBoxes(layout, options), [layout, options]);
  const entries = useMemo(
    () => new Map(boxes.flat().flatMap((it) => (it ? [[it.id, it] as const] : []))),
    [boxes],
  );
  const hits = useMemo(
    () => new Set([...entries.values()].filter((it) => matches(it, query)).map((it) => it.id)),
    [entries, query],
  );

  useEffect(() => {
    // Selects the game's PC box theme (src/games/<id>/theme.css).
    document.documentElement.dataset.theme = config.id;
  }, [config.id]);

  useEffect(() => {
    document.body.classList.toggle('dimcaught', options.dim);
  }, [options.dim]);

  useEffect(() => {
    const first = [...entries.values()].find((it) => hits.has(it.id));
    if (!first) return;
    document
      .querySelector(`[data-id="${CSS.escape(first.id)}"]`)
      ?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
  }, [hits, entries]);

  // One-step undo: the set before the last change, shown in a toast for 5 s.
  const [undo, setUndo] = useState<{ text: string; prev: Set<string> } | null>(null);
  // A ref keeps `toggle` stable across toggles, so memoized cells do not re-render.
  const caughtRef = useRef(caught);
  const replace = useCallback(
    (next: Set<string>) => {
      caughtRef.current = next;
      setCaught(next);
      saveCaught(config.id, next);
    },
    [config.id],
  );
  const commit = useCallback(
    (next: Set<string>, text: string) => {
      setUndo({ text, prev: caughtRef.current });
      replace(next);
    },
    [replace],
  );
  useEffect(() => {
    if (!undo) return;
    const t = setTimeout(() => setUndo(null), 5000);
    return () => clearTimeout(t);
  }, [undo]);

  const toggle = useCallback(
    (id: string) => {
      const next = new Set(caughtRef.current);
      const added = !next.delete(id);
      if (added) next.add(id);
      const it = entries.get(id);
      commit(next, `${added ? 'Złapano' : 'Odznaczono'} ${it ? entryLabel(it) : id}`);
    },
    [commit, entries],
  );
  const setOption = (k: keyof AppOptions, v: boolean) => {
    const next = { ...options, [k]: v };
    setOptions(next);
    saveOptions(config.id, next);
  };

  const total = entries.size;
  const got = [...entries.keys()].filter((id) => caught.has(id)).length;
  const stats = { boxes: boxes.length, slots: total, empty: boxes.length * 30 - total };

  return (
    <>
      <Header
        gameId={config.id}
        dexes={config.dexes}
        exclusives={config.exclusives}
        query={query}
        onQuery={setQuery}
        got={got}
        total={total}
        stats={stats}
        onGame={onGame}
        onShowSettings={() => setDialog('settings')}
        onShowText={() => setDialog('text')}
        onShowBackup={() => setDialog('backup')}
      />
      <BoxGrid
        boxes={boxes}
        caught={caught}
        hits={hits}
        entries={entries}
        dexes={config.dexes}
        onToggle={toggle}
      />
      {dialog === 'settings' && (
        <SettingsDialog options={options} onOption={setOption} onClose={() => setDialog(null)} />
      )}
      {dialog === 'text' && <LayoutTextDialog boxes={boxes} onClose={() => setDialog(null)} />}
      {dialog === 'backup' && (
        <BackupDialog
          caught={caught}
          onLoad={(c) => commit(c, 'Wczytano kopię postępu')}
          onClose={() => setDialog(null)}
        />
      )}
      {undo && (
        <div className="toast" role="status">
          <span>{undo.text}</span>
          <button
            onClick={() => {
              replace(undo.prev);
              setUndo(null);
            }}
          >
            Cofnij
          </button>
        </div>
      )}
    </>
  );
}
