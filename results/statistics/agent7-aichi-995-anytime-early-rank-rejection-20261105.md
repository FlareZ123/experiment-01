# Agent 7: anytime-valid early statistical rejection for a frozen 99.5% Aichi 32-rank candidate

**5 November 2026 | exact mathematical necessary condition, conditional test design, six locally executed synthetic regressions. Zero qualified competitive games.**

## Necessary loss budget

The project seeks one unchanged paper Expanded 60 with equally weighted all-32 original Aichi matchup win probabilities `p_1,...,p_32` and target `(sum p_i)/32 >= 0.995`. Algebra gives

`sum_i (1-p_i) <= 32*(1-0.995)=0.16`.

Every individual opponent must therefore have win probability `p_i >= 0.84` under this target, even if all 31 other matchups are perfect. Two ranks at 90% win rate would also consume 0.2 of the 0.16 total loss-probability budget and necessarily disqualify the target. The bound 0.84 is an **individual necessary condition**, not a sufficient condition.

For perspective, if all 29 currently authenticated original opponents were beaten with 100% true win probability but all three missing-original ranks were lost with certainty, the equally weighted field win rate would be 29/32 = **90.625%**. An achievement claim therefore cannot silently omit ranks 23,25,28. This is worst-case algebra, not a model of those three missing actual decks.

## Anytime-valid rejection, instead of blindly running 608+ games

A candidate can be rejected early if a single original opponent's true game-win probability is convincingly below 84%. This turns the demanding target into a practical **falsification workflow** once games are genuinely qualified. The archive currently has no such admitted games, so all examples here are synthetic.

Fix the deck's exact 60, both-seat player/opponent policy, venue-relevant game scoring, and all paper-valid corrections **before** an independent qualification/evaluation stream. Treat a win as `X=1` and a qualified loss or counted tie as `X=0`. For each original rank `i`, the local null is `H0_i: p_i >= 0.84`.

For each fixed alternative `q < 0.84`, the positive likelihood ratio after `W` wins and `L` nonwins against rank `i` is

`E_i(q;W,L) = (q/0.84)^W * ((1-q)/0.16)^L`.

At `p_i=0.84`, the expected one-game likelihood-ratio multiplier is exactly 1. For any `p_i>0.84`, the expectation is smaller than 1 because `q/0.84 < (1-q)/0.16`. Thus this is a nonnegative supermartingale under `H0_i`, provided each next result is independent of previous random outcomes conditional on the selected rank, and every game uses the same frozen candidate and evaluation process.

Rather than picking `q` after seeing outcomes, precommit the mixture:

| Fixed alternative q | Precommitted weight |
| ---: | ---: |
| 0 | 0.50 |
| 0.25 | 0.20 |
| 0.50 | 0.20 |
| 0.70 | 0.10 |

Each rank's e-process `E_i=Σ weight_q * E_i(q)` is itself a nonnegative supermartingale starting at 1. By Ville's inequality, `P(sup_t E_i >= 1/alpha_i | H0_i) <= alpha_i`. Apply Bonferroni across 32 ranks using `alpha_i = 0.05/32`. The precommitted per-rank rejection threshold is therefore an **e-value of 640**. If any rank crosses this threshold at any time, reject the strong all-32 99.5% goal **conditional on the statistical/game-admission assumptions**, with at most 5% familywise false-rejection risk for the fixed candidate.

This remains valid if experimenters schedule the next opponent rank adaptively from history, since each active rank's e-process retains the supermartingale property under the joint target. Do not adapt the candidate's 60 or its actual playing policy using evaluation outcomes and then pretend it is one frozen fixed-candidate test. Reusing research games after selecting among many tested candidates requires new held-out evaluation or multiple-candidate error adjustment.

## Deterministic synthetic check

The checked-in pure CommonJS module `simulation/evaluation/agent7-aichi-995-early-rejection.cjs` implements the mixture using numerically stable log-sum-exp. It accepts only explicitly declared `QUALIFIED` input rows for one fixed `candidateId`, one unique game ID per row, and one original rank 1..32. It refuses censored/error/nonqualified rows, changed candidate IDs and duplicate game IDs. It still **cannot independently verify** that externally supplied `QUALIFIED` labels, independent game seeds, opponent competence, actual original 60s, physical card payments, and 25-minute adjudication are true. It returns `qualificationVerifiedExternally:false` and conditional-only verdicts.

Seven Node.js tests are checked in under `tests/agent7-aichi-995-early-rejection.test.cjs` and executed locally with Node v22.16.0, all passed. The purely synthetic one-rank results demonstrate:

- Three consecutive qualified-*hypothetical* losses: e-value about **149.432373**, below 640, no rejection.
- Four consecutive losses: e-value about **879.808426**, exceeding 640, conditional rejection.
- Interleaving a different rank's two wins leaves the first rank's four-loss rejection threshold unchanged.
- One hypothetical win against each of the 32 ranks produces neither rejection nor evidence of a 99.5% achieved win rate.
- All input integrity negatives fail closed.
- A 10,000-nonwin hypothetical count retains finite log evidence without numerical overflow.

A complete enumeration of all 1,024 possible ten-game win/nonwin paths under the least-favorable boundary `p_i=0.84` gives an exact probability of **0.000745824896** of crossing the sequential rank threshold at or before game 10. This is below the individual Bonferroni allowance `0.05/32=0.0015625`. A seventh regression checks this exhaustive numerical value; the general all-time guarantee still follows from the supermartingale/Ville proof rather than ten-game enumeration alone.

A single prespecified four-loss run would also be a rarity under each local null `p_i>=.84`, but this module deliberately uses the stronger time-uniform e-process that tolerates data-dependent stopping and multiple rank monitoring. Its **e-threshold 640** is a unitless evidence statistic. It is unrelated to the independent **640-game balanced-seat zero-loss confidence floor** from [Agent7's earlier confirmation design](../methodology/agent7-995-field-confidence-zero-loss-bound-20261105.md).

## Compiled shared-CI check (after the original six regressions)

[Existing manual Issue25 workflow 42050275918](https://github.com/FlareZ123/experiment-01/actions/runs/42050275918) was dispatched at checkout `cd1946e33d13b10edcb18651dba78d6decbed961`. Its newly added `Fixed-60 all-rank necessary win floor and anytime early-rejection SFT` **completed successfully** using the real checked-out CommonJS source and test files. The independent historical receipt-inspector SFT also succeeded. The **overall** workflow still failed at the unrelated original v6/v7 post-setup physical-position equality assertion. This is a transparent per-step test report, not a claim of green whole-workflow integration.

The seventh exhaustive-null-path test and runtime convex-mixture validity checks were committed **after** that checkout and passed local Node22; they have not yet been independently confirmed by a later compiled CI. Continue to label all such observations **synthetic mathematical tests only**.

## Why this advances the objective

The all-32 field optimization problem can cheaply **eliminate obviously noncompetitive frozen candidates** through prospective hard-matchup evaluation before attempting an expensive full-field positive-confidence campaign. This is a target-specific rejection tool, and it does not justify ignoring other opponents after a candidate survives. Survival without a threshold crossing offers no certification of the deck's strength.

Current observed qualified input to this module: **none**. Do not backfill any archive of engine-only, capped, source-stamped setup, or paid-attack diagnostic roots into the qualification numerator or denominator. The current field's exact original 60s still require three missing inventories. Once source and policy admission gates exist, the lead integrator can evaluate whether a prospectively frozen rejection procedure is helpful and maintain immutable per-game source/seat/admission provenance.

All formulas assume an equally weighted **game-win** objective, Bernoulli scoring and genuine independently adjudicated games. Alternative tournament weighting, ties-as-half-wins, correlated repeated seeds or changing opponents, partial source coverage, and adaptive deck modification require a different model or stricter admissions.

**Status: Mathematical tool and synthetic tests only; 0 competitively qualified games, no selected fixed 60, no verified 99.5%.**
