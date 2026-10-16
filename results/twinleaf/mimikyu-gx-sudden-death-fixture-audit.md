# Mimikyu Copycat GX marker: zero-Prize fixture confound

**Agent 1, 16 October 2026.** Pinned upstream: `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. This is a **test-harness diagnosis**, not a validated Aichi match or win-rate result.

## Initial observation

Earlier manual [Copycat CI 38824446644](https://github.com/FlareZ123/experiment-01/actions/runs/38824446644) failed at `mimikyu-apex-integration.cjs`: the test selected discarded Dialga-GX Timeless-GX under an opt-in Apex Dragon/Mimikyu compatibility hook, damaged opposing Regidrago VSTAR for 150, and observed `usedTurnSkip === true`, but finally reported `a.usedGX === false`. The sampled Dialga reducer trace contains an earlier `usedGX === true` before its last callback with `false`. It did **not** demonstrate that Timeless-GX failed to set its usage marker in the attack handler.

## Reconstructed cause from pinned upstream

The test instantiated two `Player` objects with **zero Prize cards** and directly called Mimikyu's reducer, then resolved a nested attack prompt using a real `Store.dispatch`. That dispatch calls `checkState` after prompt completion.

In pinned upstream:
- `ptcg-server/src/game/store/effect-reducers/check-effect.ts` `checkWinner` awards both players a point when `player.prizes.every(p => p.cards.length === 0)`. For an empty Prize array, JavaScript's `every` returns true. Both players therefore simultaneously meet a win condition.
- `checkWinner` calls `initiateSuddenDeath` when both score. `initiateSuddenDeath` explicitly assigns `player.usedGX = false`, gathers the cards into decks and creates ShuffleDeck prompts.
- The previous CI trace ends with two `ShuffleDeckPrompt` entries and the restored `false` marker, matching this code path.
- `ptcg-server/src/sets/08-sun-and-moon/set-ultra-prism/dialga-gx.ts` sets `player.usedGX = true` and `player.usedTurnSkip = true` for its Timeless-GX.

The missing Prize cards are therefore a sufficient explanation for the failed GX assertion. This does **not** by itself prove correct nested GX implementation in genuine games.

## Corrective experiment

[Commit fe05804](https://github.com/FlareZ123/experiment-01/commit/fe058040c3b236eb8ed46d229e2489c7da5073d5) retains the exact scripted Mimikyu/Regidrago/Dialga attack choice but adds six occupied Prize piles and a nonempty Deck to both fixture players before dispatch. The cards are inert synthetic fixtures (Dratini OBF), not 60-card legal decks. The test now asserts the original player reference remains stable, no sudden death is reported, 150 damage is applied, `usedGX === true`, `usedTurnSkip === true`, and the original copy-tagged Apex Dragon remains intact.

Manual regression workflow: [CI 38847169084](https://github.com/FlareZ123/experiment-01/actions/runs/38847169084). **Verified: [manual CI 38847169084](https://github.com/FlareZ123/experiment-01/actions/runs/38847169084) PASSED** at head `fe058040c3b236eb8ed46d229e2489c7da5073d5`. The pinned engine compiled, all five earlier reducer-level hook tests passed, the corrected nested integration script passed, and the stale-Copycat-pass characterization passed. The integration output reports `damage: 150`, `usedGX: true`, `usedTurnSkip: true`; this is isolated attack-fixture evidence rather than a whole-game validation.

## Limits and next tests

The integration fixture bypasses normal setup, Energy payment, AttackAction, rules-valid decks, player control, and opponent responses. It also reaches delegated attack choice by patching the Mimikyu copy rejection. A passing corrected fixture would qualify the **isolated nested Timeless-GX effects** only. Separate acceptance gates still need an actual declared Copycat action, correct original last-attack identity, GX reuse rejection, proper skip-turn sequencing, and proof under a match policy that can deliberately execute the line. The existing hook remains opt-in.
