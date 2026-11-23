"""Run the wiki checks on the LLM-written wiki pages. Extra args pass through to ste-lint.py.

1. wiki-structure.py: markers, links, index, `updated:` date, sources.
2. ste-lint.py: ASD-STE100 prose rules.

Skips raw/ (human sources), CLAUDE.md (schema with "do not write" examples)
and log.md (append-only, old entries stay as written).
"""
import glob
import runpy
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
pages = sorted(
    p for p in glob.glob(str(root / 'docs/wiki/**/*.md'), recursive=True)
    if (rel := Path(p).relative_to(root / 'docs/wiki')).parts[0] != 'raw'
    and str(rel) not in ('CLAUDE.md', 'log.md')
)
structure = subprocess.run([sys.executable, str(root / 'scripts/wiki-structure.py')]).returncode
sys.argv = ['ste-lint.py', *sys.argv[1:], *pages]
try:
    runpy.run_path(str(root / 'scripts/ste-lint.py'), run_name='__main__')
except SystemExit as e:
    sys.exit(e.code or structure)
sys.exit(structure)
