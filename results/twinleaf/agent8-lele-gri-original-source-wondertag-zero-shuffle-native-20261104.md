# Agent 8 | 2026-11-04 | Wonder Tag zero-choice shuffle, pinned native proof

## Finding

Printed Tapu Lele-GX GRI 60 **Wonder Tag** allows a restricted search for a Supporter, followed by shuffle. Under supplied Advanced Player's Rulebook I-H, the player may choose zero cards on a restricted search; a confirmed Wonder Tag use still requires shuffling.

Pinned Twinleaf a9905a76a6c4103ba4b6cb9a49e86bad795c5c05 in `ptcg-server/src/sets/08-sun-and-moon/set-guardians-rising/tapu-lele-gx.ts` only enqueues its `ShuffleDeckPrompt` within `if (cards.length > 0)`. Therefore a confirmed zero-card choice skips the mandated shuffle.

## Direct authentic source-60 Store evidence

[CI 41874544387](https://github.com/FlareZ123/experiment-01/actions/runs/41874544387) at revision 537f4f4c3cdd34f9a6810e44948b098ef180fd9b **passed all 4 new native tests**. The [runner](../../tests/agent8-wonder-tag-zero-shuffle.native.test.cjs) uses real `PlayCardAction`, native `ResolvePromptAction`, both seat orders, and an artificially staged four-occupied-Bench position from two full authenticated original 60s: rank1 Shadow Rider, hash 77d91942a34e18fe5dc076eddba2e54602004dede2b0bc44786eefa6ddc94086; rank10 Regidrago, hash a9f5f761f49e30a7673d272f3fc6064229f58d6d2a70d20f707adabf3a345060.

| Ability decision | Unmodified engine | [Scoped repair](../../simulation/twinleaf/agent8-wonder-tag-zero-shuffle-hook.cjs) |
| --- | --- | --- |
| Confirm, choose zero | Confirm then Choose, **no shuffle** | Confirm, Choose, Shuffle, a nonidentity permutation of all 42 physical deck cards |
| Confirm, choose Guzma BUS | Confirm, Choose, Show, Shuffle, Guzma in hand | Identical sequence and card custody |
| Decline | Confirm only | Identical refusal |
| Finish | Original prototype | Original prototype restored |

In every case player turn remains 2, Lele is Benched correctly, and same exact registered printed inventories are used in both arms. Both arms require the separate [numeric shuffle validator](../../simulation/twinleaf/agent22-numeric-shuffle-validation-hook.cjs) since native index validation for decks with 11 or more cards is independently incorrect. This scoped hook only intercepts a printed GRI Wonder Tag source-backed restricted Supporter choice and schedules the missing shuffle following its empty-selection callback. Vendor files unchanged.

## Field relevance and bounds

Exact printed Tapu Lele-GX GRI is in **18 of the 29 authenticated original-source lists, 20 total copies** (ranks 1,4,8,10,11,12,13,14,16,18,19,20,21,22,27,30,31,32) in [full-decklists.json](../aichi-2026/full-decklists.json). Prevalence of this print does **not** estimate the frequency of zero-choice Wonder Tag in actual play. Source 60 cards are physically real in the tests, though opening hands and Bench positions were staged rather than naturally dealt. The test proves bounded engine paper fidelity, and **zero competitive game wins**. It does not certify composition with the existing on-entry Iron Thorns Ability-lock guard, any natural opposing reply, or use in the executing selected Issue25 policy.

Shared source status remains 29/32 with ranks 23,25,28 missing and no selected final 60 or demonstrated 99.5% win rate.
