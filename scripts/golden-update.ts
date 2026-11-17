import { copyFileSync } from 'node:fs';
import { join } from 'node:path';

// The golden file is a snapshot of the generator output. `layout.json` is that same output,
// so run `npm run golden:update` (it runs `data:build` first) and review the diff.
const root = join(import.meta.dirname, '..');
copyFileSync(
  join(root, 'src/games/sv/generated/layout.json'),
  join(root, 'reference/sv-layout-golden.json'),
);
console.log('reference/sv-layout-golden.json updated from sv layout.json');
