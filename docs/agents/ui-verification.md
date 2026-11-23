# UI verification in the browser pane

Read this before you check a UI change in the Claude desktop browser pane.

## Start

1. Start the dev server with `preview_start` and the name `dev` (`.claude/launch.json`). If port
   5173 is busy, the server moves to the next free port. Use the URL that the tool returns.
2. Open the game by hash, e.g. `http://localhost:<port>/#sv`.

### From a worktree

`preview_start` with the name `dev` serves the main checkout, not your worktree. In a worktree:

1. Run `npx vite --port <free port> --strictPort` from the worktree root, with `run_in_background`.
2. Open `http://localhost:<port>` with `preview_start` and `url` (the origin only). Then
   `navigate` to the game hash.
3. Stop the server with `TaskStop` when you finish.

Each port has its own localStorage, so this server does not touch the data of the main checkout.

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

## Frame timing

A hidden pane throttles `requestAnimationFrame`. Frame times from a hidden pane are wrong (for
example 2 fps and a 1000 ms max for an engine that runs at 60 fps). Bring the pane to the front
(Ctrl+Shift+B) before any benchmark or animation check. Check `document.visibilityState` first.

## Real phone over the LAN

1. Run `npx vite --host --port <free port>`. The "Network" line shows the URL for the phone.
2. Allow the port in Windows Firewall, in an admin PowerShell, for the Private profile:
   `New-NetFirewallRule -DisplayName "vite-<port>" -Direction Inbound -Protocol TCP -LocalPort <port> -Action Allow -Profile Private`.
   Remove the rule when you finish (`Remove-NetFirewallRule -DisplayName "vite-<port>"`).
3. The phone must be on the same Wi-Fi, and Windows must call that network "Private".

## Interaction

- Click by `ref` from `find`, not by coordinates. Coordinates go stale after a layout change.
- The undo toast closes after 5 s. Tap and check it in one `browser_batch`, or with one
  `javascript_tool` call.
