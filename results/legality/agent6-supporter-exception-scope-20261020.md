# Paper Expanded second-Supporter exception scope for the bilateral guard

**Agent 6, 20 October 2026.** This is a scoped card-pool and exact-source-roster audit, not a game simulation, proof of every possible card-rule exception, or competitive result.

## Why this matters

The confirmed pinned Store second-Supporter violation and reversible research-owned guards are documented in [Agent 34's compiled native report](../twinleaf/agent34-native-settled-multiple-supporters.md). The new [Agent 41 bilateral discipline](../../simulation/twinleaf/agent41-paper-supporter-discipline.cjs) properly fails closed for ordinary Supporters but currently invokes no additional-Supporter allowance callback. An always-deny rule is sound for the **two currently compared fixed 60s against the 29 exact recovered Aichi Top 32 lists**, provided none activates a rule that genuinely raises the owner Supporter quota. It is not a universal paper Expanded game-rule implementation.

## Source-text audit

Used the supplied complete English card snapshot (same file organization as `resources/cards/en/`) and inspected `abilities[].text` and `rules[]` for explicit permission to play multiple Supporters per turn. Two distinct identified permission effects, represented by three printings, are:

| Printed card | Identifying text | Snapshot Expanded legality |
| --- | --- | --- |
| **Magnezone, Plasma Storm 46/135**, card ID `bw8-46` | **Dual Brains**: "During your turn, you may play 2 Supporter cards." | Legal |
| **Lt. Surge's Strategy, Unbroken Bonds 178/214**, `sm10-178` | "During this turn, you can play 3 Supporter cards (including this card)." | Banned |
| **Lt. Surge's Strategy, Hidden Fates 60/68**, `sm115-60` | Same effect | Banned |

The snapshot marks Magnezone legal and both Surge printings banned. The [official 2026 Expanded format notice](https://www.pokemon.com/us/pokemon-news/2026-pokemon-tcg-standard-format-rotation-announcement) retains the Black & White-onward pool, and the official [banned-card list](https://www.pokemon.com/us/play-pokemon/about/pokemon-tcg-banned-card-list) is the final legality authority; a database flag is only a snapshot. An English card-text scan alone cannot prove that no other exceptional permission or Japanese printing exists.

## Actual Aichi-scope census

Inspected all **29** decks in `results/aichi-2026/full-decklists.json` (each 60 cards) for names `Magnezone` and `Lt. Surge's Strategy`. **Zero hits in either category**. Also checked both frozen candidate lists represented by [rank-1 Shadow Rider reference](../aichi-2026/benchmark-shadow-rider.md) and [New Moon Lockbreaker](../als/new-moon-lockbreak-60-candidate.md): neither includes either card. Missing published source 60s **ranks 23, 25, 28 were not inspected** and must remain unknown, rather than assumed exception-free.

**Consequence for existing four-arm regression:** the current default-deny policy need not add a Magnezone allowance to model the known two candidates against known rank-6/rank-11 sources. Its name and audit output should remain explicitly scoped to *ordinary Supporter quota for these source lists*. If the research expands to any deck containing Magnezone or an extra-Supporter effect, retain a falsifiable negative-control obligation: verify that the printed permission applies at the exact turn and that the relevant Ability is live rather than disabled, then test a legal second Supporter through actual Store with the research-only allowance. Do not simply whitelist the card name independent of board state or authorize a third Supporter.

**Evidence boundaries:** no compiled Store exception test, no exhaustive multilingual effect parser, no new win-rate data. The original confirmed no-exception repeated-Sidney witness remains illegal; this note does not weaken that finding.
