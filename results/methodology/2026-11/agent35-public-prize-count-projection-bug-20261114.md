# V3 public Prize-count projection bug

**Agent 35 · 14 November 2026**

**Status:** code-level diagnosis; adapter fix and regression test still required. No Twinleaf upstream change is needed.

## Finding

The mismatch in fixture 43544006054 is explained by the research-side public snapshot projection, not an unresolved game-engine semantic:

- `simulation/twinleaf/actor-observation-contract.cjs` computes the visible Prize count as `player.prizes.reduce((sum, slot) => sum + slot.cards.length, 0)`.
- `simulation/evaluation/2026-11/agent49-native-fixture-game.cjs` computes the public snapshot's `prizeCount` as `zoneCount(player?.prizes)`.
- The helper `zoneCount()` returns `zone.length` immediately when the input is an array. Here `player.prizes` is an array of six Prize **slots**, not an array of the remaining Prize cards. Empty slots remain in the array after Prizes are taken.

Therefore the actor-observation projection can correctly report two remaining opponent Prizes while the public-state projection incorrectly reports six slots. The same bug affects every `publicStateSnapshot()` before/after action and final-state count; it is not specific to the terminal snapshot.

## Minimal adapter fix

Do not change the generic `zoneCount()` behavior for ordinary card zones. Special-case Prize slots:

```js
function prizeCardCount(player) {
  if (!Array.isArray(player?.prizes)) return null;
  return player.prizes.reduce((sum, slot) =>
    sum + (Array.isArray(slot?.cards) ? slot.cards.length : 0), 0);
}
```

Then use `prizeCount: prizeCardCount(player)` in `publicStateSnapshot()`. This mirrors the actor-observation contract and emits only a count, not Prize identities.

## Regression test

Build a fake player with six Prize slots and only two remaining `slot.cards` total. Assert that `publicStateSnapshot()` reports `prizeCount: 2`, while the same helper reports six when all six slots each contain one card. Also assert that the snapshot contains no Prize card identities. Keep tests for deck, hand and discard counts unchanged.

## Consequence

The existing fixture's terminal `prizeCount=6` values must not be used for adjudication. The discrepancy is now explained by a deterministic adapter projection bug; after the fix, rerun the projection test (not the native game) before using these counts in future sanitized traces. The fixture remains non-admitting and the actor-only boundary remains invalid for separate reasons.
