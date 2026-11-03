# Early anytime falsification of a 99.5% field claim with a single bad matchup

**Agent 46 | 3 November 2026 | mathematical method, no authentic game observations or qualified candidate.**

## High-leverage conclusion

A fixed 60 must win, on average, more than **99.5%** of complete paper-qualified games against 32 equally weighted original Aichi Top32 opponent lists to meet the stated field-wide target. Let pᵢ be the true game-win probability against rank i under an externally predeclared paper-game, clock, player-policy and first-seat distribution. Then

`p_field=(1/32)Σ pᵢ` and `1-p_field=(1/32)Σ (1-pᵢ)`.

The maximum optimistic field win rate if **one** opposing rank has win probability at most 0.84 and every other opponent is beaten with probability one is

`(31+0.84)/32=0.995`.

Consequently, reliable evidence of **one rank's win probability below 84%** is enough to exclude a fixed candidate from the 99.5% field objective, without first completing hundreds of thousands of qualification games over all 32 ranks. A genuine-paper loss against even a single rank can have information value when it helps falsify the candidate. The burden of ruling out a candidate is substantially less than the burden of proving an extraordinary positive field performance.

## Anytime method

I implemented [a precommitted adaptive early-rejection gate](../../simulation/evaluation/agent46-anytime-adaptive-field-rejection.cjs) by reusing the tested [cellwise anytime confidence envelope](../../simulation/evaluation/agent46-anytime-adaptive-field-envelope.cjs).

For each rank/seat/starter cell i, let fᵢ=1−pᵢ be the genuine probability that the fixed candidate **does not win**, including paper losses and draws. Use a strictly prospective, exactly recorded sequence of fresh qualified paper outcomes; the opponent cell may be chosen adaptively using earlier games. On each selected cell, the indicator for a verified candidate nonwin is Bernoulli with fixed conditional mean fᵢ. Under `H0:fᵢ≤q`, the positive e-bet `1+η(Z−q)/q` has conditional mean at most one. Mix 32 fixed betting fractions ηⱼ=1−2⁻ʲ, invert the mixture at candidate ordinal k and per-cell error α/[Ck(k+1)], and obtain a **simultaneous anytime lower confidence bound** Lᶠᵢ on fᵢ.

Then the field nonwin rate is at least `(1/C)ΣLᶠᵢ`; equivalently, the candidate's field win probability is at most

`U_field = 1 − (1/C)ΣLᶠᵢ`.

If `U_field < 0.995`, the frozen candidate is conditionally **falsified as a 99.5% field solution** with familywise error α under the actual fixed-cell next-game law. Because unplayed cells contribute Lᶠᵢ=0, this remains valid under extreme adaptive source selection and even when 3 original lists are missing, provided the observed loss rank itself is authentic. This test can exclude a candidate; it does not identify which alternative will win.

Crucial directionality: **censored, missing-original, native-only or otherwise unqualified game outcomes count as zero failure evidence**. A native simulator declaring a loss is no reason to strengthen evidence against a candidate before full opponent-policy and paper-clock qualification. This is deliberately the reverse of the corresponding win-lower-bound test, where unqualified attempts pessimistically count as candidate nonwins. Both decisions are mathematically conservative for their respective one-sided claims.

A separate precommitted candidate ordinal or α allocation is mandatory if the same candidate is tested both for **performance proof** and **performance falsification**. Reusing identical k and α in both directions would double-spend the claimed familywise coverage. Observed or retrospectively selected matchups must never be relabeled as prospective independently sampled games.

## Exact synthetic 32-rank stress test

The following numerical outcomes are **hypothetical positive/negative controls** generated from the formula, not actual game results:

| One fixed candidate, C=32, α=.05, ordinal k=1 | Time-uniform field win upper bound | Decision versus 99.5% |
| --- | ---: | --- |
| Zero qualified paper games | 100% | Insufficient |
| One originally authenticated rank, **four prospective qualified candidate nonwins**, all on fresh deals | ≈99.6038735% | Insufficient |
| The same rank, **five prospective qualified candidate nonwins**, all on fresh deals | ≈**99.4143237%** | Conditional rejection |
| Five `CENSORED` games on rank1 | 100% | Insufficient |
| Five native losses with wrong or unverified original rank1 printed60 digest | 100% | Insufficient |
| Five genuine nonwins on authenticated rank1, source original ranks 23/25/28 still missing | ≈99.4143237% | Conditional rejection |
| Five genuine nonwins under candidate hypothesis ordinal k=2 | Above 99.5% | Insufficient |
| Six genuine nonwins under candidate hypothesis ordinal k=2 | Below 99.5% | Conditional rejection |

With C=32 and k=1, the cell threshold is 1280. At q=0.16, four all-failure e-bet mixtures give e≈523.0804, while five give e≈2732.5396, crossing that threshold. Inverted lower failure probability after five verified paper nonwins is **≈18.7416415%** for that rank. If all other ranks could be beaten perfectly, the resulting field upper win probability is still **≈99.4143237%**, below target. This controls optional stopping and opponent selection under the exact conditional game-law assumptions stated above. For 64 or 128 separate rank×seat×starter cells, the required evidence against any one cell is greater.

[Ten direct pure regressions](../../tests/agent46-anytime-adaptive-field-rejection.test.cjs) passed locally in Node22 on the matching implementation, covering the four-versus-five-loss boundary, missing originals, verified versus censored direction, extra wins elsewhere, a more stringent second candidate ordinal, 64/128 geometry, physical deal replay, rank mapping, fake native status, altered candidate printing and trial chronology. Test is registered in the existing [manually triggered statistics CI](../../.github/workflows/aichi-global-field-gate.yml); remote CI has not been independently run from this invocation.

## Operational veto: why zero actual candidates are excluded

The Aichi original paper field is still **29/32 authenticated exact original 60s**, with ranks 23/25/28 missing. The shared Twinleaf research produces useful native mechanics evidence but has **zero full-paper, clock-qualified and opponent-competent match outcomes**. No candidate has been run through this new method with actual valid observations. The threshold of five consecutive nonwins must never be applied to bot-vs-bot native outcomes, retrospectively chosen unfavorable seeds, or a matchup whose opponent policy failed to play held legal answers.

The event's official [Open League rules](https://www.pokemon-card.com/info/005445.html) have materially different 25-minute Swiss and 25-minute Top32 knockout adjudication, with a 35-minute final; select and freeze the precise intended benchmark phase before treating losses, draws or clock decisions as qualified games. See the [existing official event-clock analysis](../aichi-2026/agent5-official-aichi-may26-clock-and-terminals-20261031.md).

## Research implication

For quick candidate triage, focus high-quality paper/decision-policy verification on the **hardest already authenticated opponent rank** rather than attempting immediate 57,600-game proof of 99.5% across all 32. A verified inability to reach a target is valuable elimination evidence, even while other original deck lists remain unavailable. Do this only under a genuine preregistered, complete-attempt ledger, with full paper clock and both-seat opponent competence; otherwise retain the candidate as unresolved. The test enforces its mathematical shape but intentionally returns `statisticalAssumptionsExternallyVerified:false` and `competitiveQualified:false`.
