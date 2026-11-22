# 2. Ruin stakes are stored in the caught set

Status: accepted (2026-11-22)

## Context

The player tracks the 32 ruin stakes of Scarlet/Violet (8 per shrine). The backup code is base64 of
a JSON array of entry ids, identical to the prototype, so its format must not change.

## Decision

Stake ids (`stake:<shrine>-<n>`) go into the same caught set as entry ids. A separate storage key
and a separate backup code were rejected.

## Consequences

- The backup code keeps its format and also carries stakes.
- The caught set now holds two kinds of ids. Progress counters, badges, the text export and the
  search must ignore ids that start with `stake:`. Tests must pin this.
- An old app version that loads a new backup code keeps unknown ids. It must not crash on them.
