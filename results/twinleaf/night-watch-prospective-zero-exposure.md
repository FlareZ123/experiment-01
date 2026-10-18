# Registered sixteen-deal Night Watch chance-policy comparison: zero attack exposure

**Agent 3, 18 October 2026 UTC.** Source-frozen, predeclared independent seed cohort; source-game completion and negative exposure evidence. The outcome does **not** qualify any competitive game.

## Pre-registration and compiled execution

The trial schedule and SHA256-generated 16 unique seeds were published in [registration](night-watch-prospective-batch-registration.md), commit `d7ca42f5c7959fa9d43347e08b7a611071b8e1d9`, before the run was dispatched. All original-source Aichi rank-11 versus fixed rank-1 input lists and policy versions were held constant across original/default Night Watch resolver and the opt-in uniform opponent-hand chance correction. All starts came from the original engine draw and were verified; each arm had the same 160-root-action cap. Importantly, the already successful **outcome-conditioned** seed `2809154458` did not appear in this sample.

[Manual-only compiled CI 39140517254](https://github.com/FlareZ123/experiment-01/actions/runs/39140517254), simulator pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, head `a96d23fd9cca174247f6ba4dfff556a813034655`, **passed**. The immutable [artifact 12141373450](https://github.com/FlareZ123/experiment-01/actions/runs/39140517254/artifacts/12141373450) contains all 16 paired rows, their engine and policy results, real-root Night Watch choices, and the original conditioned positive-control replay. The paired-batch generator lives at [rank11-night-watch-prospective-batch.cjs](../../simulation/twinleaf/rank11-night-watch-prospective-batch.cjs).

## Every registered-row summary

| Registered prospective metric | Recorded result |
| --- | ---: |
| Unique source deals, no outcome-based inclusion | 16 |
| Original/corrected paired arms | 32 planned and executed |
| Successful complete paired trial records | 16 of 16 |
| Failed paired trial rows | 0 |
| True first physical slot 0 | 9 |
| True first physical slot 1 | 7 |
| Original-policy Night Watch declarations | **0** |
| Corrected-policy Night Watch declarations | **0** |
| Engine-finished original arms | 9 of 16 |
| Engine-finished corrected arms | 9 of 16 |
| Incomplete per arm at 160-action horizon | 7 |
| Invalid corrected sample selections | 0 |
| Independently qualified competitive games | **0** |

A complete paired **record** is a successfully executed and auditable original/corrected comparison, including unfinished games. Only nine games in each arm reached an engine terminal within the preset action cap. In particular, do **not** convert 9/16 finish counts or same-policy finish totals into game wins. The positions in the 16 registered sample pairs were entirely unexposed to Night Watch. The zero invalid selections in this cohort is vacuous with respect to Night Watch randomization; the separate conditioned replay exercised three selections and verified their validity.

## Interpretation and competing hypotheses

- The two active policies *cannot be compared for the difference introduced by Night Watch's random-hand correction in this prospective sample*, because the corrected effect was never actually used. This is positive evidence about the low **observed effect exposure** under this source-dealt, weak-policy, 160-action setup. It does not quantify the probability of exposure for high-skill paper play.
- The prior conditioned [compiled three-Night-Watch positive control](night-watch-uniform-random-source-hook.md) remains a verified code-path test but is unsuitable for unconditional opportunity or win-rate inference.
- The 9/7 actual-start split is a realised outcome-blind split, not prospective start-order stratification. The source rank11's autonomous Boost Shake policy can activate only when its own resource predicates permit and may miss other lines. A stronger player can choose significantly different lines, including attacking with the candidate under different setups.
- Rank11 tool lock, basic-selection tactics, source rank1 early attackers, hand/turn progression and the 160-action limit are plausible causes of the zero exposure. These are untested explanations; the run records no causal attribution.
- The strict opportunity funnel would first need a demonstrated legal source-dealt Night Watch declaration under **a seed-independent policy** with actual response and nonexposure denominator. Subsequent all-start prospective trials should include selection indices, selected card count, full card effect, later opponent reply and a terminal or explicit cap. No seed or setup should be selected based on its engine winner.

**Net project decision:** This test confirms a real prospective zero-exposure boundary, while the mechanistic chance-card defect and corrected positive control remain documented. There are still **29/32 exact opponent 60s, zero qualified competitive games and no demonstrated 99.5% win rate**. Preserve both this negative result and the earlier positive control; avoid additional broad gameplay claims until an actual end-to-end deck/match policy is independently qualified.

## Retrospective audit of the immutable experiment artifact

[Manual CI 39141478579](https://github.com/FlareZ123/experiment-01/actions/runs/39141478579) passed by downloading the existing artifact from source CI 39140517254. The read-only analysis at `scripts/night-watch-evidence-summary.cjs` did not replay any games.

It verified sixteen unique complete registered paired rows, nine jointly finished pairs, zero recorded Night Watch attacks in both versions, and one actual source Boost Shake opportunity in each version. All sixteen pairs had matching finished status, engine winner, action count and source lock-completion flag. These four matching metrics are coarse checks, not proof of identical decisions or states.

Source Boost Shake opportunity is a different condition from successful Night Watch use. The separately conditioned three-attack positive-control replay visibly chose different opponent-hand positions under the correction.
