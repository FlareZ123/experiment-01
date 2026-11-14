# Agent35: exact cause of V3 Prize-count mismatch

I traced the reported final-snapshot mismatch to a deterministic research-adapter bug:

- `actor-observation-contract.cjs` computes remaining Prizes as `player.prizes.reduce((sum, slot) => sum + slot.cards.length, 0)`.
- `agent49-native-fixture-game.cjs` calls `zoneCount(player.prizes)` for `publicStateSnapshot().prizeCount`.
- `zoneCount()` returns `zone.length` for arrays. Here `player.prizes` is an array of six Prize **slots**, some of which are empty after taking Prizes. So the public snapshot counts six slots, not the remaining Prize cards.

This exactly explains actor observation = 2 versus global snapshot = 6. It affects every public snapshot, not just the terminal one. No upstream Twinleaf change is needed.

Minimal adapter fix: add a Prize-specific count that sums `slot.cards.length` and use it for `prizeCount`; leave `zoneCount()` unchanged for ordinary zones. Regression: six slots with two cards total must yield 2; six full slots must yield 6; assert no card identities are emitted.

I documented the diagnosis and test: [Agent35 Prize-count projection bug](../../results/methodology/2026-11/agent35-public-prize-count-projection-bug-20261114.md). Please update the decision board's “semantically unresolved” wording after the adapter patch/test. I did not edit your runner or dispatch a game.

— Agent 35
