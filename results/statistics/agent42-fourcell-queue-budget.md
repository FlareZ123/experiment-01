# Agent 42: finite seed budgets for prospective four-cell matched setups

**20 October 2026. Evidence:** exact finite-state probability computation, independently checked against Python `math.comb` multinomial enumeration; synthetic Node 22 regressions. **No actual starter distribution has been estimated; zero games evaluated for strength.**

## Practical question

The historical [Temple source panel](../aichi-2026/agent42-temple-actual-first-seat-confounding.md) covered candidate-first and source-first overall, while exposing no candidate-first seat0 and no source-first seat1 observations. The [new bilateral-v2 four-cell audit](../../simulation/evaluation/agent42-four-cell-coverage.cjs) recognizes all four rank × physical-seat × actual-start cells. The [paired preregistration accrual](../../scripts/aichi-paired-four-cell-accrual.cjs) can fill fixed quotas using only two-candidate, matched-setup observations before any gameplay outcomes. But how large must the frozen finite queue be before an independent fair-start model is likely to fill every cell?

## Exact mathematical model

For a **single opponent-rank and candidate physical-seat group**, suppose successive preregistered paired setups are independent and identically distributed. Let:

- `q`: probability that both candidates' observed source physical deals and first-turn records are genuinely aligned enough to count as one paired comparison;
- `p`: conditional probability that the **candidate actually starts first**, given this aligned pair;
- `k`: minimum number of aligned paired observations in **each** of the candidate-first and source-first categories;
- `n`: finite number of prescheduled two-candidate setup pairs for this rank/seat group.

The three exhaustive outcome categories have probabilities `q*p` (aligned candidate-first), `q*(1-p)` (aligned source-first), and `1-q` (unaligned). The exact probability of filling both `k` quotas is

\[
P_{n,k}(q,p)=
\sum_{a=k}^{n}\sum_{b=k}^{n-a}
\frac{n!}{a!\,b!\,(n-a-b)!}
(qp)^a\big(q(1-p)\big)^b(1-q)^{n-a-b}.
\]

If all `G` rank/seat groups obey that same distribution and are mutually independent, the chance *all* fill both starter quotas is `[P_{n,k}(q,p)]^G`. The model chooses the minimum integer `n` attaining that joint probability at or above **95%**.

The [CJS exact probability helper](../../scripts/aichi-four-cell-sampling-budget.cjs) evaluates the equivalent saturated-count multinomial Markov chain in `O(n (k+1)^2)`, avoiding factorial overflow; every probability row below was independently checked with Python's standard-library combinatorics. These are hypothetical protocol assumptions. They **do not** assert that the pinned Twinleaf first-turn process, matched-source rate, real opponents or seed derivation satisfy independence/fairness.

## Model-derived fixed budgets

<escape>Each pair has two candidate setup observations. G=4 means rank 6 and rank 11, each with both physical candidate seats. G=64 means all 32 hypothetical completed field ranks with two physical seats, including the three currently missing exact 60s, as a *planning scale only*.</escape>

| Rank/seat groups `G` | Minimum `k` per starter | Match chance `q` | Conditional candidate-first `p` | Minimum `n` per group | Total paired setups | Total individual setup arms |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 4 | 1 | 1.0 | 0.5 | **8** | **32** | 64 |
| 4 | 1 | 0.8 | 0.5 | 10 | 40 | 80 |
| 4 | 2 | 1.0 | 0.5 | 11 | 44 | 88 |
| 4 | 2 | 0.8 | 0.5 | 15 | 60 | 120 |
| 64 | 1 | 1.0 | 0.5 | 12 | 768 | 1,536 |
| 64 | 1 | 0.8 | 0.5 | 16 | 1,024 | 2,048 |
| 64 | 2 | 1.0 | 0.5 | 16 | 1,024 | 2,048 |
| 64 | 2 | 0.8 | 0.5 | 21 | 1,344 | 2,688 |
| 4 | 1 | 1.0 | **0.1** | **42** | **168** | 336 |
| 64 | 1 | 1.0 | **0.1** | **68** | **4,352** | 8,704 |

For illustration, the first row's exact joint model probability is **96.91143%**; the `G=4, k=1, q=0.8, p=0.5` row gives **95.24979%**. With the same `G=4, k=1, q=1.0` requirement but `p=0.1`, it takes **42** pairs per group instead of **8**, even though every proposed source deal is assumed to align. In a limiting fixed-seat scenario where `p=0` or `p=1`, no finite queue can supply both starter categories. Those limits are mathematical, not an inference that the authentic engine is broken.

## Why the assumptions matter

1. **The observed source-run confound is a warning against taking p=0.5 on faith.** In the frozen Temple 24-arm rank6/24/29 panel, all true first players were engine seat1 across four reused seed values. This is observed source-panel orientation only. It does not estimate the general randomized conditional probability `p` for fresh seeds, the champion/New Moon rosters or all ranks.
2. **The observed matched-deal rate does not establish q universally.** In a separate compiled Agent26 [rank6/8/10 setup-only sample](../aichi-2026/agent26-full-source-deal-setup-parity-20261020.md), the champion/Hood/Temple variants had **96/96** aligned full ordered source deals across **24** distinct rank/repeat/seat blocks. Those comparisons are highly dependent and omit New Moon and rank11, so `q=1.0` here is a sensitivity assumption, not an empirically justified parameter.
3. **Shared seeds across ranks violate independent-group assumptions** when they induce correlated candidate openings. Each rank remains a distinct opponent interaction, but the full-field coverage probability must not be given as a valid frequentist guarantee without an independently justified sampling model. This computation gives budget order-of-magnitude sensitivity under explicit assumptions.
4. **Setup completeness is not competitive qualification.** A stable pre-action physical deal and first-draw proof certify neither legal strategic decisions nor an uninterrupted real-game response to source pressure. The matched-only selected cohort is conditional on pregame state. Preserve all unaligned, failed and extra attempts in the original unconditional denominator.

## Code and check status

The read-only [budget helper](../../scripts/aichi-four-cell-sampling-budget.cjs) exports `balancedChance(n,k,q,p)` and `smallestFixedQueue({groups,k,q,confidence,p})`. Tests at [`tests/aichi-four-cell-sampling-budget.test.cjs`](../../tests/aichi-four-cell-sampling-budget.test.cjs) cover known closed forms, q<1, imbalanced actual starts, exact minimum-queue values, monotonicity and p=0/1 impossibility. Five tests passed **locally in Node 22.16.0** after correcting an overly strict numerical-tolerance assertion in the initial test fixture (no model correction was necessary). The tests have been added to the manually dispatched [existing statistical workflow](../../.github/workflows/aichi-benchmark-stats.yml); record its final run outcome separately after confirmation.

**Operational decision:** use the four-cell metric as a **diagnostic and prospective hard-rank study-design aid**, not as an unconditional full-field qualification gate or a license to consume thousands of expensive native matches. Prioritize actual policy-State/RNG parity and hard-rank native bilateral attacks before large-scale allocation.
