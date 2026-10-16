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

## Executable provenance

The [source-inventory calculator](../../scripts/aichi_rank26_loss_budget.cjs) now derives the same candidate-specific events directly from the original ranked 60-card lists, [unchanged Hood and Temple candidate JSON](candidate-hood-shadow-rider.md), shared `soloAfterBonus` exact model, a printed Basic-stage index, and Wobbuffet PHF 36 counts. It computes the target's equal-placement per-rank loss budget instead of embedding rounded setup percentages. [Regression tests](../../tests/aichi-rank26-loss-budget.test.cjs) include invalid inputs and exact champion/Temple anchor checks. The tests and calculation are wired into the existing [manual opening audit](../../.github/workflows/aichi-opening-audit.yml), but **this new integration has not yet been executed in CI**. The numerical thresholds in this note were separately recomputed using Python arithmetic from the earlier documented setup probabilities.

## Structural sensitivity of adding more Basic starters

The [source-locked exact Basic-count frontier](../../scripts/aichi_rank26_exposure_frontier.cjs) generalizes the same restricted `soloAfterBonus` calculation to hypothetical total Basic counts `b`. Assuming **zero** intrinsically protected starters and taking all offered rank-26 mulligan bonuses, the modeled lone-Active event falls as follows:

| Total candidate Basics | P(lone-Active E) |
| ---: | ---: |
| 14 | 37.5068% |
| 16 | 30.5977% |
| 18 | 24.5399% |
| 20 | 19.3195% |
| 21 | 17.0136% |
| **22** | **14.9033%** |

Because the entire 32-placement 99.5% loss allowance can allocate at most 16% probability to rank 26 (even granting perfect records against every other rank), **22 Basics** is the first hypothetical copy count at which losses confined to E alone cannot exceed this budget, *even if E always leads to the immediate donk*. This calculation neither assumes E always loses in actual play nor awards any true matchup protection; it identifies a very demanding count tradeoff. In particular, replacing eight non-Basic slots of the 14-Basic reference is not a justified deck improvement absent tests of its damage, attack payloads, consistency and other matchup costs.

For hypothetical *guaranteed* protective Basic copies `p`, the same proportional lone-starter classification gives the minimum total Basics (searched from 14 to 30) for E ≤16%: `p=0→22`, `p=1→22`, `p=2→21`, `p=3→21`, `p=4→20`. **Guaranteed protection is hypothetical.** Actual protective Abilities can be shut off by Canceling Cologne, and some protections require Active position or other conditions. This frontier is a conditional mathematical thought experiment that makes the limits of raw Basic-count optimization explicit, with no tested alternative 60-card list or lower bound on wins.

The [regression checks](../../tests/aichi-rank26-exposure-frontier.test.cjs) anchor the threshold against independent Python exact-combination calculations and are included in the manual [opening audit workflow](../../.github/workflows/aichi-opening-audit.yml). They were committed after the last applicable CI run and await execution in GitHub Actions.

## Scope and next evidence

The E calculation is tied to the clearly stated all-bonus-draw setup model. Real opponents can play differently, first-turn cards can change the number of Basics in play, and Meloetta may have other win paths. The probabilities cannot be multiplied by an unsupported estimate of first-turn combo success. They create an actionable *necessary success threshold* conditional on one precisely defined setup event.

A useful next experiment would validate the complete rank-26 attack policy and full original starting sequence, stratified by candidate, seat and E/other starts. Report observed `q`, sample size, failure causes and uncertainty. Apply the same test to other source-ranked opponents before making aggregate deck-strength claims.

**The 99.5% objective remains unverified.**
