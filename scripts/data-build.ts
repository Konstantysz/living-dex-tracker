import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { games } from '../src/games/configs';
import { buildLayout } from './buildLayout';
import { downloadSprites, loadTables } from './pokeapi';

const root = join(import.meta.dirname, '..');
const tables = await loadTables();

for (const cfg of games) {
  const { sprites, ...layout } = buildLayout(cfg, tables);
  const dir = join(root, 'src', 'games', cfg.id, 'generated');
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'layout.json'), JSON.stringify(layout, null, 1) + '\n');
  const missing = await downloadSprites(sprites, join(root, 'public'));
  console.log(
    `${cfg.id}: ${layout.groups.length} groups, ${sprites.length} sprites, ${missing.length} missing`,
  );
  for (const m of missing) console.warn(`  missing sprite: ${m}`);
}
