# 2. Collectibles are stored in the caught set

Status: accepted (2026-11-22). Updated 2026-11-22: the rule covers all collectibles, not only the
SV ruin stakes.

## Context

The player tracks in-game collectibles. The first set is the 32 ruin stakes of Scarlet/Violet
(8 per shrine). Other games have other collectibles. The backup code is base64 of a JSON array of
entry ids, identical to the prototype, so its format must not change.

## Decision

- A game declares its collectibles in `collectibles` in its config (`CollectibleSet` in
  `src/core/types.ts`).
- A set has sections (e.g. one per shrine). A collectible id is `<set>:<section>-<n>`, e.g.
  `stake:ting-lu-1`. It goes into the same caught set as entry ids.
- Entry ids never contain `:`. `src/core/entry.ts` keeps the rule in one place: `collectibleId`
  makes an id, `isEntryId` and `entryCount` tell the two kinds apart. A test checks that no entry
  id of any game contains `:`.
- A separate storage key and a separate backup code were rejected.

## Consequences

- The backup code keeps its format and also carries collectibles.
- The caught set now holds two kinds of ids. Progress counters, badges, the text export, the search
  and the import confirmation must ignore ids with `:`. Tests pin this (`App.test.tsx`,
  `entry.test.ts`).
- An old app version that loads a new backup code keeps unknown ids. It must not crash on them.
- If an entry id ever needs a `:`, this rule must change first.
