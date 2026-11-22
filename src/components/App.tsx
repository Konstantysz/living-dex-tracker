import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { badgeProgress, badgeToast, gameBadges, newlyEarned } from '../core/badges';
import { entryLabel, matches, setIds } from '../core/entry';
import { layoutBoxes } from '../core/layout';
import {
  hidAlcremie,
  loadCaught,
  loadOptions,
  saveCaught,
  saveOptions,
  type AppOptions,
} from '../core/storage';
import { findGame, type Game } from '../games';
import { BackupDialog } from './BackupDialog';
import { BoxGrid } from './BoxGrid';
import { GuideDialog } from './GuideDialog';
import { Header } from './Header';
import { LayoutTextDialog } from './LayoutTextDialog';
import { SettingsDialog } from './SettingsDialog';

const hashId = () => location.hash.replace(/^#/, '');

/** The caught set with `id` added or removed, and whether it was added. */
function flip(caught: Set<string>, id: string): [Set<string>, boolean] {
  const next = new Set(caught);
  const added = !next.delete(id);
  if (added) next.add(id);
  return [next, added];
}

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
  // 'badges' opens the Guide on its "Odznaki" tab.
  const [dialog, setDialog] = useState<'text' | 'backup' | 'settings' | 'guide' | 'badges' | null>(
    null,
  );

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

  const badges = useMemo(() => gameBadges(config, layout, boxes), [config, layout, boxes]);
  const visible = useMemo(
    () => new Set([...entries.keys(), ...(config.collectibles ?? []).flatMap(setIds)]),
    [entries, config],
  );
  const earned = useMemo(
    () => badges.filter((b) => badgeProgress(b, caught, visible).earned).length,
    [badges, caught, visible],
  );

  // One-step undo: the set before the last change, shown in a toast for 5 s.
  // A toast without `prev` is a notice with no undo button.
  // `badge` is the line for badges that the change earned (only for taps).
  // The Alcremie notice shows only in a game that has Alcremie forms (kind `alc`).
  const [undo, setUndo] = useState<{
    text: string;
    badge?: string;
    prev?: Set<string>;
  } | null>(() =>
    hidAlcremie(config.id) && layout.groups.some((g) => g.items.some((it) => it.k === 'alc'))
      ? {
          text: 'Usunięto opcję ukrywania Alcremie. Boxy pokazują teraz wszystkie 63 formy Alcremie.',
        }
      : null,
  );
  useEffect(() => {
    // Drops the old `alc` key, so the notice above shows only once.
    if (hidAlcremie(config.id)) saveOptions(config.id, options);
  }, [config.id, options]);
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
    (next: Set<string>, text: string, badge?: string) => {
      setUndo({ text, badge, prev: caughtRef.current });
      replace(next);
    },
    [replace],
  );
  // A tap: the toast also names the badges it earned.
  const tap = useCallback(
    (next: Set<string>, text: string) =>
      commit(next, text, badgeToast(newlyEarned(badges, caughtRef.current, next, visible))),
    [commit, badges, visible],
  );
  useEffect(() => {
    if (!undo) return;
    const t = setTimeout(() => setUndo(null), 5000);
    return () => clearTimeout(t);
  }, [undo]);

  const toggle = useCallback(
    (id: string) => {
      const [next, added] = flip(caughtRef.current, id);
      const it = entries.get(id);
      tap(next, `${added ? 'Złapano' : 'Odznaczono'} ${it ? entryLabel(it) : id}`);
    },
    [tap, entries],
  );
  const toggleCollectible = useCallback(
    (id: string, label: string) => {
      const [next, added] = flip(caughtRef.current, id);
      tap(next, `${added ? 'Zaznaczono' : 'Odznaczono'} ${label}`);
    },
    [tap],
  );
  const setOption = <K extends keyof AppOptions>(k: K, v: AppOptions[K]) => {
    const next = { ...options, [k]: v };
    setOptions(next);
    saveOptions(config.id, next);
  };

  const collectibles = config.collectibles ?? [];
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
        onShowGuide={() => setDialog('guide')}
        earnedBadges={earned}
        onShowBadges={() => setDialog('badges')}
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
        <SettingsDialog
          options={options}
          exclusives={config.exclusives}
          onOption={setOption}
          onClose={() => setDialog(null)}
        />
      )}
      {(dialog === 'guide' || dialog === 'badges') && (
        <GuideDialog
          sets={collectibles}
          badges={badges}
          visible={visible}
          tab={dialog === 'badges' ? 'badges' : 'collectibles'}
          caught={caught}
          onToggle={toggleCollectible}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === 'text' && <LayoutTextDialog boxes={boxes} onClose={() => setDialog(null)} />}
      {dialog === 'backup' && (
        <BackupDialog
          caught={caught}
          collectibles={collectibles.map((c) => c.name)}
          onLoad={(c) => commit(c, 'Wczytano kopię postępu')}
          onClose={() => setDialog(null)}
        />
      )}
      {undo && (
        <div className="toast" role="status">
          <span>
            {undo.text}
            {undo.badge && (
              <>
                <br />
                {undo.badge}
              </>
            )}
          </span>
          {undo.prev && (
            <button
              onClick={() => {
                replace(undo.prev!);
                setUndo(null);
              }}
            >
              Cofnij
            </button>
          )}
        </div>
      )}
    </>
  );
}
