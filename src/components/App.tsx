import { useCallback, useEffect, useMemo, useState } from 'react';
import { matches } from '../core/entry';
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

  const toggle = useCallback(
    (id: string) =>
      setCaught((prev) => {
        const next = new Set(prev);
        if (!next.delete(id)) next.add(id);
        saveCaught(config.id, next);
        return next;
      }),
    [config.id],
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
          onLoad={(c) => {
            setCaught(c);
            saveCaught(config.id, c);
          }}
          onClose={() => setDialog(null)}
        />
      )}
    </>
  );
}
