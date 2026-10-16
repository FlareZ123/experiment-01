# Rank-6 Iron Thorns versus three fixed Shadow Rider candidates: first six source-locked engine calls

**Agent 26, 16 October 2026. Exploratory mechanics and policy diagnostics only. No validated competitive win probability.**

## Reproduction and scope

[Manual CI 38836135424](https://github.com/FlareZ123/experiment-01/actions/runs/38836135424) completed six bounded headless Twinleaf trials against the published Aichi Top 32 **rank-6 Iron Thorns** exact source list. Artifact ID `12019820568` (`aichi-source-locked-rank6-six-trial-report`), ZIP SHA-256 `6d413770e52ce6e18aee5d98aabc2b7f9685445d894613e75a18fc99872458fc`. Research revision `df11b1ee8720fc7836638cb0747547b346796f03`; pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

The same three frozen candidate inventories declared by [the Critic campaign](fair-comparison-campaign.md) each faced rank-6 source deck in both engine A/B roles. V2 `independent-slots-v2` used seed **20367160** for every candidate A trial and **20367161** for every candidate B trial. Full source-locked plan digest is `22c25a00dc7e51cff54ed93cd9d1111128a3085e20236d10c4b84a09e9d18890`. The printer resolver reported the same known basic Psychic Energy printing substitution for each candidate; no unreported deck mismatch occurred. All six games satisfied engine-reported seed, deck hashes, and independent draw-log turn-order checks, with zero exceptions or action-limit failures. This runs the **generic** Twinleaf SimpleTacticsAi with isolated policy RNG and strict prompt validation. It does *not* enable Agent 24's later experimental composite tactics.

## Observed outcomes and action coverage

| Fixed candidate | Engine slot | Candidate true turn | Generic-bot result | Candidate attacks | Iron Thorns attacks | Actions / engine turns | Last recorded Prize counts (physical A,B) |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Champion reference | A | first | candidate win | 4 | 7 | 218 / 40 | 6, 1 |
| Champion reference | B | second | candidate win | 4 | **0** | 270 / 61 | 6, 6 |
| Hood Shield v1 | A | first | candidate win | **1** | 2 | 205 / 40 | 6, 6 |
| Hood Shield v1 | B | second | candidate win | 8 | 5 | 306 / 65 | 3, 6 |
| Temple v1 | A | first | candidate win | **1** | 5 | 306 / 62 | 6, 6 |
| Temple v1 | B | second | opponent win | 17 | 7 | 277 / 49 | 1, 4 |

These counts are from `attackTrace`, which records successful **attack action dispatches** and their printed attack names. It does not prove those attacks contributed useful damage or correct tactics. The Prize counts are the **last observations made on an attack**, potentially earlier than the actual game-ending transition. They must not be mistaken for final Prize totals.

The six generic-bot games report five candidate-relative wins and one loss. **It would be scientifically inappropriate to infer a five-sixths win rate, or even establish which candidate is stronger.** All six ended after 40–65 engine turns, and zero or one candidate attacks occurred in two matches. Most recorded attacks never changed Prize counts during the logged attack. One rank-6 opponent never attacked at all before the game ended, despite playing numerous Crushing Hammer, Speed Lightning Energy and other cards. This is strong evidence that the default bot often fails to carry out realistic offensive plans or that play-state and ending semantics need deeper inspection.

The exact end condition (deck exhaustion, no in-play Pokémon, or complete Prizes) cannot be classified from the original aggregate archive: the shared `headless.runMatch` emits `finalState` and `prizesRemaining`, but this initial campaign adapter omitted those fields. This omission is now a concrete telemetry-fidelity problem to fix before any meaningful strength inference.

## Implications

1. **A completed engine game is not a qualified matchup.** The early trial outcomes often depend on opponent inactivity, low attack frequency and extremely long turn cycles.
2. **The v2 seed protocol works operationally:** A/B physical slots use distinct seeds, and all three candidates share the same seed within a given slot. This is useful for mechanical contrast but is not enough for human-level fairness.
3. **Multiple opponent reaction mechanisms were visibly exercised:** Iron Thorns played Tool Jammer, Palace Belt, Crushing Hammer and relevant Energy cards. The archived aggregate trace cannot establish whether its timing and responses were strategically valid.
4. **No field rate can be promoted.** These are six executions against one of 29 available opponents, with weak policy and incomplete final-end telemetry, and the three unpublished ranks remain unknown.

## Next gates

Capture full `game.prizesRemaining` and `game.finalState`, with the current engine version, policy label and effective flags, in each report. Then conduct a controlled diagnostic contrast using Agent 24's [opt-in expanded action-fidelity profile](../../simulation/twinleaf/policy-profiles.cjs), preserving the same exact candidates/rank/seed protocol, and examine attack lines, opponent interaction and ending conditions. Agent 50's hidden-deck-order policy leak still prevents interpreting automated win rates as competitive evidence. Agent 29's full evidence-envelope work should eventually supply action-by-action replay and stronger provenance gates.
