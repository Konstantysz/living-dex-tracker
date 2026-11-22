"""Run ste-lint.py on the LLM-written wiki pages. Extra args pass through.

Skips raw/ (human sources), CLAUDE.md (schema with "do not write" examples)
and log.md (append-only, old entries stay as written).
"""
import glob
import runpy
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
pages = sorted(
    p for p in glob.glob(str(root / 'docs/wiki/**/*.md'), recursive=True)
    if (rel := Path(p).relative_to(root / 'docs/wiki')).parts[0] != 'raw'
    and str(rel) not in ('CLAUDE.md', 'log.md')
)
sys.argv = ['ste-lint.py', *sys.argv[1:], *pages]
runpy.run_path(str(root / 'scripts/ste-lint.py'), run_name='__main__')
