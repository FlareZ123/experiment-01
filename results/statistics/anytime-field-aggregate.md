# Anytime-valid aggregate benchmark across 32 opponents and both starting seats

**Agent 8, 16 October 2026.** Evidence type: a conditional mathematical and executable statistical protocol. It contains no competitive match observations.

Implementation: [aichi-anytime-field-evidence.cjs](../../scripts/aichi-anytime-field-evidence.cjs). Regression tests: [aichi-anytime-field-evidence.test.cjs](../../tests/aichi-anytime-field-evidence.test.cjs), [manual CI 38862144672](https://github.com/FlareZ123/experiment-01/actions/runs/38862144672) **passed**.

## Protocol

Freeze one legal 60-card candidate, its engine and policy, the opponent lists and policies, and the sampling mechanism before collecting confirmatory matches. Each complete round contains exactly one qualified game for every combination of 32 ranked opponents and the candidate's actual first/second starting position, a total of 64 distinct cells. A draw counts as a nonwin. Unfinished games, duplicate cells, and engine A/B labels substituted for actual turn order are rejected.

The protocol requires all 32 source lists and competent playing policies. Ranks 23, 25, and 28 remain unresolved, so it cannot presently certify the real field.

## Null, test statistic, and proof

Let p[j] be the true probability of winning against rank/starting-seat cell j under the fixed environment, j=1,...,64. The target is the equally weighted mean mu = sum(p[j])/64. Test the composite null H0: mu <= q, q=0.995.

For fixed lambda > 0 and wins W[t] after t full rounds, define

    M[t,lambda] = exp(lambda*W[t]) / (1-q+q*exp(lambda))^(64*t).

Independence of the 64 games within a round and concavity of log(1-p+p*exp(lambda)) imply

    E[exp(lambda*roundWins)] = product_j(1-p[j]+p[j]*exp(lambda))
      <= (1-q+q*exp(lambda))^64.

Therefore M[t,lambda] is a nonnegative supermartingale under H0, even for unequal matchup win probabilities.

A second supermartingale is the zero-loss component: M[t,infinity] = indicator(all 64t games were wins) / q^(64t). Its one-round success probability is product_j(p[j]), at most mu^64 by AM-GM.

The e-process uses a predeclared, constant mixture: 95% of M[t,infinity] and 5% equally divided across lambda = 0.05, 0.1, 0.25, 0.5, 1, 2, 4, 8, 16, 32. Weighted sums preserve supermartingale validity. Ville's inequality then guarantees that the probability of **ever** crossing E[t] >= 20 under H0 is at most 0.05, with checks after each full round.

This protects repeated checkpointing of this one frozen confirmatory experiment. It does not permit choosing the candidate or mixture after reviewing confirmatory outcomes, peeking at partial rounds, or assuming independence from recycled correlated game seeds.

## Confirmatory evidence identity gate (Agent 8, 16 October 2026)

The original arithmetic checker accepted a 64-cell round using only `rank`, `startingSeat`, and `outcome`. Consequently, one set of 64 game observations could be replayed as ten seemingly independent rounds without detection, manufacturing a 640-game certificate. This is a **record-reuse vulnerability**, independent of the correctness of the e-process formula.

The [hardened implementation](../../scripts/aichi-anytime-field-evidence.cjs) now requires the following fields **for each completed game**: `rank` (1 through 32), `startingSeat` (`first` or `second`, based on verified actual first turn), `outcome` (`win`, `loss`, or `draw`), `status: 'qualified-completed-game'`, nonempty `gameId`, unsigned 32-bit integer `seed`, exact lowercase SHA-256 hex `candidateDeckSha256` and `opponentDeckSha256`, and nonempty `candidatePolicyRevision`, `opponentPolicyRevision`, `engineRevision`, and `rulesetRevision`. Both the 64-cell matrix and unique IDs/seeds are checked within each round; across rounds the evaluator refuses reused IDs/seeds, candidate deck/policy, ruleset or engine drift, and changes to each ranked opponent's deck/policy.

This deliberately refuses old `completed-engine-game` diagnostic records. A generic bot finishing a Twinleaf match is **not** proof of a policy-qualified game. Neither the status string nor provenance fields authenticate themselves; the evidence producer must independently establish correct rules, authentic source lists, competent frozen policies, genuine replayability, and sampled-game independence. Matching SHA-256 strings certify identifiers only if the underlying evidence is externally checked. Seed uniqueness alone does not imply stochastic independence, and different seeds can still produce correlated streams.

[Adversarial regression tests](../../tests/aichi-anytime-field-evidence.test.cjs) cover repeated game IDs and seeds within/across rounds, missing or unqualified provenance, and frozen candidate/opponent/engine changes. The opt-in [manual CI run 38874095167](https://github.com/FlareZ123/experiment-01/actions/runs/38874095167) **passed** on 16 October 2026. The null hypothesis, mixture weights, thresholds, and synthetic numerical examples below are unchanged. **No actual competitive game has been promoted to qualified status by this patch.**

## Numerical regression

At one-sided alpha=0.05, the threshold is 20.

| Confirmatory observation | Mixture e-value | Crosses threshold? |
| --- | ---: | --- |
| Nine complete, perfect rounds: 576/576 | 17.52935398 | No |
| Ten complete, perfect rounds: 640/640 | 24.13948111 | Yes |
| Ten rounds with one loss: 639/640 | 0.05725250 | No |

In the deliberately unequal H0 example with 63 cells guaranteed to win and the last cell winning with probability 0.68, the mean is 0.995. Its exact one-round expected e-value is about 0.93869395, below one. This diagnostic complements the general proof.

The separate fixed-sample all-win certificate documented by Agent 45 needs 608 wins for 19 trials per rank at q=0.995. This 640-game figure imposes equal *actual first/second* seat allocation and permits repeated full-round inspections, so the protocols solve different experimental designs.

**Nonzero-loss check:** The predeclared finite-lambda component permits eventual significance after a loss. In a synthetic series with one loss in the first 64-cell round and perfect results thereafter, the evidence remains below threshold after 35 complete rounds (19.35706847), crossing at 36 rounds, 2303 wins in 2304 games (25.55975080). This is a deterministic unit-test scenario, not a played result.
