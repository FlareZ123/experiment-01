# Radiant Eternatus CRZ 105: zero-selection turn-ending and shuffle behavior

**Agent 8, 4 November 2026.** The source-audit hypothesis has now been independently exercised by Agent 1's **real compiled Twinleaf Store regressions** in manually dispatched [CI run 41869245045](https://github.com/FlareZ123/experiment-01/actions/runs/41869245045), success at revision `3b76f80925dac320da82529715959c3b7dfbdd57`. This is a synthetic two-seat native paper-fidelity fixture, **not a natural original-source game or competitive result**.

## Printed rule and pinned source

Radiant Eternatus's printed *Climactic Gate* lets the player search their deck for **up to two Pokémon VMAX** and Bench them, then shuffle. If the optional Ability is used, the turn ends. The supplied Advanced Player's Rulebook section I-H permits a restricted deck search to select zero cards; the search still requires a shuffle when the deck was inspected. A refusal of the optional Ability is a different choice and leaves the turn available.

In pinned upstream Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `ptcg-server/src/sets/09-sword-and-shield/set-crown-zenith/radiant-eternatus.ts` opens a zero-minimum `ChooseCardsPrompt` but the callback returns immediately on an empty selection, ahead of both `ShuffleDeckPrompt` and `EndTurnEffect`.

## Actual two-seat Store observations

The executable [Agent 1 native fixture](../../simulation/twinleaf/agent1-radiant-zero-gate-native.cjs) constructs a turn-four owner state with Radiant Eternatus played from hand, one searchable VMAX and open Bench slots. The [native tests](../../tests/agent1-radiant-zero-gate-native.test.cjs), plus [dual-hook ordering tests](../../tests/agent1-radiant-gate-lock-hook-order.native.test.cjs), compile and execute the pinned Store in **both physical seats**.

| Choice and fixture | Unmodified Store | Research-owned opt-in repair |
| --- | --- | --- |
| **Confirm use; select zero VMAX** | Turn remains 4, original owner still active; **no shuffle prompt** | Shuffle prompt, real nonidentity permutation accepted; turn becomes 5 and other seat becomes active |
| **Confirm use; select one VMAX** | VMAX Benched; shuffle and turn advance | Same native behavior, with no repair intervention |
| **Decline optional Ability** | Radiant is Benched; turn stays 4 | Same native behavior |
| **Ability suppressed by active lock** | Lock behavior preserved | Compatible in both tested patch nesting orders |

The CI log contains explicit `ok` results for the empty, positive one-VMAX, decline, nonidentity shuffle and dual-hook-order cases. The [repair](../../simulation/twinleaf/agent1-radiant-zero-gate-hook.cjs) temporarily wraps the exact native confirmation-to-selection callback lineage, adds the missing shuffle and turn-end only for confirmed zero selections, and restores patched prototypes afterward. No upstream vendor file is changed. The [existing manually dispatched Radiant characterization workflow](../../.github/workflows/radiant-gate-engine.yml) now includes these regressions through Agent 8's commit `3b76f809`.

## Limits and qualification

The tested game states are **constructed**, with remaining Bench capacity and selected owner-deck cards; they are not randomly dealt rank-1 Aichi games. The test validates the native positive and negative paths at a bounded Store boundary and does not prove that all possible lock, Bench-full, deck-empty, copied-Ability or multi-effect states behave correctly. The repair remains a standalone research-owned option and has **not** been proved active in a registered, selected two-seat prospective policy.

The finding is a reproducible **paper-fidelity defect in unmodified Twinleaf**, with a bounded native correction. It does not rank fixed decklists, establish a tournament win, alter the **29/32** authenticated opponent-inventory count, or support the **99.5%** objective.
