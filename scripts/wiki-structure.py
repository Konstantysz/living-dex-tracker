"""Structure checks for the LLM-written wiki pages (see docs/wiki/CLAUDE.md). Stdlib only.

Errors (exit 1):
  marker    a "> **X:**" callout other than Conflict or Unverified
  link      a relative link that does not resolve
  index     a page missing from index.md
  updated   a changed page whose `updated:` date is older than its last change
Warnings (exit 0), for changed pages only:
  source    a section of 2 or more prose lines with no "(source: ...)"

Skips raw/ (human sources), CLAUDE.md (schema), and log.md (append-only).
"""
import datetime
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WIKI = ROOT / "docs/wiki"
MARKERS = {"Conflict", "Unverified"}


def git(*args):
    r = subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True)
    return r.stdout.strip() if r.returncode == 0 else ""


def pages():
    return sorted(
        p for p in WIKI.rglob("*.md")
        if p.relative_to(WIKI).parts[0] != "raw" and p.relative_to(WIKI).as_posix() not in ("CLAUDE.md", "log.md")
    )


def prose(text):
    """Lines of TEXT as (number, line), with frontmatter, fenced code and inline code removed."""
    out, fence, lines = [], False, text.split("\n")
    start = 0
    if lines and lines[0] == "---":
        start = next((i + 1 for i in range(1, len(lines)) if lines[i] == "---"), 0)
    for n in range(start, len(lines)):
        line = lines[n]
        if line.lstrip().startswith("```"):
            fence = not fence
            continue
        if not fence:
            out.append((n + 1, re.sub(r"`[^`]*`", "``", line)))
    return out


def changed_pages():
    """Pages that differ from the working tree base: uncommitted, or ahead of origin/main."""
    names = set(git("diff", "--name-only", "HEAD").split("\n"))
    if git("rev-parse", "--verify", "-q", "origin/main"):
        names |= set(git("diff", "--name-only", "origin/main...HEAD").split("\n"))
    return {ROOT / n for n in names if n}


def main():
    errors, warnings = [], []
    index = (WIKI / "index.md").read_text(encoding="utf-8")
    dirty = set(git("diff", "--name-only", "HEAD").split("\n"))
    changed = changed_pages()
    today = datetime.date.today().isoformat()

    for page in pages():
        rel = page.relative_to(ROOT).as_posix()
        text = page.read_text(encoding="utf-8")
        lines = prose(text)

        for n, line in lines:
            m = re.match(r"\s*>\s*\*\*(\w+):\*\*", line)
            if m and m.group(1) not in MARKERS:
                errors.append(f"{rel}:{n} marker: '{m.group(1)}' is not Conflict or Unverified")
            for target in re.findall(r"\]\(([^)\s]+)\)", line):
                if re.match(r"(https?:|mailto:|#)", target):
                    continue
                if not (page.parent / target.split("#")[0]).resolve().exists():
                    errors.append(f"{rel}:{n} link: '{target}' does not resolve")

        if page.name != "index.md":
            if page.relative_to(WIKI).as_posix() not in index:
                errors.append(f"{rel}:1 index: page is not in index.md")
            m = re.search(r"^updated:\s*(\d{4}-\d{2}-\d{2})", text, re.M)
            if not m:
                errors.append(f"{rel}:1 updated: no `updated:` date in the frontmatter")
            elif page in changed:
                last = today if rel in dirty else (git("log", "-1", "--format=%as", "--", rel) or today)
                if m.group(1) < last:
                    errors.append(f"{rel}:1 updated: {m.group(1)} is older than the last change ({last})")

            sections, cur = [], []
            for n, line in lines:
                if line.startswith("#") and not line.startswith("#!"):
                    sections.append(cur)
                    cur = []
                elif line.strip() and not line.startswith("|") and not line.lstrip().startswith(">"):
                    cur.append((n, line))
            sections.append(cur)
            for s in sections:
                if page in changed and len(s) >= 2 and not any("(source:" in l or "source:" in l for _, l in s):
                    warnings.append(f"{rel}:{s[0][0]} source: section of {len(s)} lines has no (source: ...)")

    for w in warnings:
        print("warning", w)
    for e in errors:
        print("error  ", e)
    print(f"{len(errors)} errors, {len(warnings)} warnings")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
