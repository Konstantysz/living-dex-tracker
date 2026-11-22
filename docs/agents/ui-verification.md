# UI verification in the browser pane

Read this before you check a UI change in the Claude desktop browser pane.

## Start

1. Start the dev server with `preview_start` and the name `dev` (`.claude/launch.json`). If port
   5173 is busy, the server moves to the next free port. Use the URL that the tool returns.
2. Open the game by hash, e.g. `http://localhost:<port>/#sv`.

### From a worktree

`preview_start` with the name `dev` serves the main checkout, not your worktree. In a worktree:

1. Run `npx vite --port <free port>` from the worktree root, with `run_in_background`.
2. Open `http://localhost:<port>/#sv` with `preview_start` and `url`.
3. Stop the server when you finish.

Each port has its own localStorage. A wrong click changes only the test data of that port.

## Measure first, then look

The pane scales its screenshots. A screenshot can cut off the right edge of a page that fits. Use the
DOM as the source of truth for layout:

- Size and position: `element.getBoundingClientRect()`.
- Horizontal overflow: `el.scrollWidth <= el.clientWidth` and
  `document.documentElement.scrollWidth <= innerWidth`.
- State: `aria-pressed`, `dialog.open`, and `localStorage.getItem('ldt:<game>:caught')`.

Use a screenshot only to judge the look (colours, spacing, text).

## Phone width

- `resize_window` with the `mobile` preset gives 375×812. Reset it with `desktop` when you finish.
- On a phone, the header hides most buttons behind "Więcej". Open it first.

## Interaction

- Click by `ref` from `find`, not by coordinates. Coordinates go stale after a layout change.
- The undo toast closes after 5 s. Tap and check it in one `browser_batch`, or with one
  `javascript_tool` call.
