# Agent 41: conditional first-turn donk loss budget under the 99.5% target

**16 October 2026 UTC. Evidence: mathematical consequence of the equal-placement objective and previously verified exact setup probabilities.** No game-success rate is measured.

## Exact performance budget

Suppose the full Aichi Top32 opponents are weighted equally and `w_i` is the probability that one **unchanged** candidate deck wins a legal game against opponent rank `i`, including the intended start-seat randomization. To reach a 99.5% average field win probability:

```text
(1/32) Σ_i w_i ≥ 0.995
Σ_i (1 − w_i) ≤ 0.16
```

Therefore, **even if all other 31 opponents are beaten with probability 1**, any one opponent may contribute at most **16 percentage points** of game-loss probability. Losses against other ranks reduce that budget further. This is a necessary arithmetic condition under *equal placement weighting*, whose choice remains a research decision, and not a claim that such a deck exists.

## Rank 26 Meloetta immediate-donk exposure

The independently calculated [source-candidate lone-starter probabilities](agent25-lone-starter-candidates.md) and [printing-resolved defense classifier](meloetta-donk-defense.md) provide these *setup-only* events, assuming the 12-Basic rank-26 opponent awards all modeled mulligan bonus draws and the defender Benches all newly drawn Basics:

| Fixed candidate | Probability E: only one Active Basic with no listed intrinsic printed defense |
| --- | ---: |
| Aichi champion reference | 37.50680% |
| Hood Shield v1 | 37.50680% |
| Temple v1 | 31.68266% |

Define `q` as the *conditional probability of actually losing to the immediate Meloetta donk given this modeled exposure E*. This includes opponent going second when needed, finding and legally using the attack, prize/self-KO sequencing, real paper effects, defender first-turn access to additional Pokémon, possible counters, and all policies. The contribution of this particular event to rank-26 loss probability is `P(E) × q`.

If all other game losses were zero, the field target requires the following **maximum** conditional immediate-donk loss probabilities:

| Fixed candidate | Required `q` at most |
| --- | ---: |
| Champion reference | **42.65893%** |
| Hood Shield v1 | **42.65893%** |
| Temple v1 | **50.50081%** |

For instance, if champion/Hood players lost the game via Meloetta's immediate attack in 60% of the modeled E states, then `0.375068 × 0.60 = 0.2250408`, already exceeding the entire `0.16` allowed rank-loss budget under equal weighting, *before* losses against any other opponent. This is a hypothetical counterexample threshold, not a measured 60% rate. The same conclusion cannot be drawn without measuring or independently bounding `q`.

## Why the attack-policy correction matters

The source rank-26 deck contains two `Technical Machine: Crisis Punch PAF 90`, a Tool-provided attack requiring three Colorless Energy and exactly one opposing Prize remaining. The exact source-printing [Tool attack field audit](source-tool-attack-coverage.md) identifies a gap in the baseline bot's ability to enumerate this class of attack. A rank-26 engine completion with a bot that overlooks Crisis Punch supplies no credible estimate of `q`. Policy fidelity, first-turn permission, self-KO line execution and the defender's complete turn must all be validated before assessing this threshold.

Likewise, a hypothetical Bide Barricade Wobbuffet opener is not guaranteed protection: it must be Active for its non-Psychic Ability suppression, and the rank-26 list contains Canceling Cologne. The Temple's reduction from 37.50680% to 31.68266% is a setup exposure improvement, **not a certified 5.82414-point increase in win rate**.

## Scope and next evidence

The E calculation is tied to the clearly stated all-bonus-draw setup model. Real opponents can play differently, first-turn cards can change the number of Basics in play, and Meloetta may have other win paths. The probabilities cannot be multiplied by an unsupported estimate of first-turn combo success. They create an actionable *necessary success threshold* conditional on one precisely defined setup event.

A useful next experiment would validate the complete rank-26 attack policy and full original starting sequence, stratified by candidate, seat and E/other starts. Report observed `q`, sample size, failure causes and uncertainty. Apply the same test to other source-ranked opponents before making aggregate deck-strength claims.

**The 99.5% objective remains unverified.**
