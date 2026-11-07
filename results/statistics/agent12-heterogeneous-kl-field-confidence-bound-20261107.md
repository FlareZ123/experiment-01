# Aichi Top32: heterogeneous-matchup lower confidence bound with wins, losses and ties

**Agent12 | 7 November 2026 | mathematical prospective analysis.** This is a **conditional statistical method and software validation**. The repository still has **29 of 32 authenticated original opponent inventories, no qualified completed games, and no demonstrated 99.5% game win rate.** None of the hypothetical trials below were played.

## Fixed estimand and qualified sampling frame

A candidate must be a single unchanging 60-card deck and playing policy, evaluated against all original 32 Aichi opponents. Each opponent is weighted equally and evaluated from both actual physical seats and both possible identities of the starting player. The 32 × 2 × 2 strata have equal target weight 1/128. Fix equal registered trial count `k` per stratum, giving `N = 128k` complete **independent paper-qualified** games. Hold the original source fingerprints, candidate/policy, engine and hook revision, opponent policy bundle, and paper-adjudication protocol fixed. Actual independent physical deals and opponent decision competence remain to be established externally.

Each completed game's outcome is encoded `X=1` for a qualified win, `X=0` for a qualified loss or tie. Ties are **nonwins** for a target defined as *game win probability*. Censored/aborted native attempts cannot be omitted from the registered denominator or mislabeled qualified losses without paper adjudication. The estimand `P = (1/128) sum_{r,s,f} p[r,s,f]` is the fixed candidate's field-average game win probability; individual matchups can be arbitrarily heterogeneous.

## Distribution-free-over-matchups Bernoulli Chernoff-KL derivation

Under independent games, each physical trial is Bernoulli with an unknown stratum-specific win probability. Let `S` be the number of game wins, `q=S/N` the realized win fraction and `P` their population-average probability. For any `t > 0`, the cumulant generating function obeys

`E exp(t S) = product_{j=1}^N [1-p_j+p_j exp(t)] <= [1-P+P exp(t)]^N`

because `log(1-p+p exp(t))` is concave in `p`, and the actual stratification makes `mean_j(p_j) = P`. Chernoff optimization therefore proves, for `q>P`:

`Pr(S/N >= q) <= exp[-N D(q || P)]`,

where binary KL divergence is

`D(q||P) = q log(q/P) + (1-q) log[(1-q)/(1-P)]`.

This is valid when the **matchup probabilities differ**, as long as trials are independent and have fixed probabilities under a frozen candidate/opponent evaluation. It does not require a single common win probability for the entire field.

Invert the upper-tail test at one-sided confidence `1-alpha`: for any observed `q>0`, solve `N D(q||L) = log(1/alpha)` for the unique `L` in `(0,q)`. For `q=0`, take `L=0`. If every registered trial wins, `q=1` and the formula reduces to the original exact all-win result `L=alpha^(1/N)`, matching [the preceding AM-GM proof](agent12-exact-balanced-field-all-win-bound-20261107.md).

This KL bound is conservative and generally more useful than a perfect-run-only criterion. It is a **one-sided statistical confidence statement under the stated sampling assumptions**, not a guarantee of a real future 99.5% win rate, a guarantee for each of 32 individual matchups, or proof of paper engine correctness.

## Prospective examples at 95% one-sided confidence

The table shows hypothetical **balanced** samples and the minimum exposures found within the evaluated 128-stratum design for each stated number of losses/ties. Samples are not observed games. Each row separately assumes exactly the registered number of complete independent trials per stratum.

| Qualified nonwins allowed | Trials per rank/seat/starting-player stratum | Total qualified games | Qualified wins | Conservative KL lower bound |
| ---: | ---: | ---: | ---: | ---: |
| 0 | 5 | 640 | 640 | 99.5330106% |
| 1 | 9 | 1,152 | 1,151 | 99.5024261% |
| 2 | 12 | 1,536 | 1,534 | 99.5003386% |
| 4 | 18 | 2,304 | 2,300 | 99.5204366% |
| 8 | 27 | 3,456 | 3,448 | 99.5073333% |
| 16 | 44 | 5,632 | 5,616 | 99.5054577% |
| 32 | 75 | 9,600 | 9,568 | 99.5013337% |

A single qualified loss in **640** games yields `L=99.1058404458%`, which is *below* the target. One loss in **1,024** balanced games yields `L=99.4403733343%`, also below target. A single loss in **1,152** games gives `L=99.5024260646%`, just above target. This differs from simply reporting observed win fractions; sample uncertainty remains substantial even with very few losses.

These hypothetical examples use Python's `math` double precision and independent numerical binary-KL inversion. They are only an experimental-planning guide; observed game quality, candidate selection, and official clock could invalidate inference.

## Executable research artifact and evidence standards

- [Shared strict 128-stratum manifest validator](../../scripts/agent12-balanced-field-ledger-validator.cjs) factors out common source, 32-rank, physical-seat, first-player, candidate/policy, code, opponent-bundle, adjudication, complete-registration, independent-deal-ID and receipt-ID checks. Source hashes and labels are **caller assertions**, never a substitute for actual audit.
- [Original perfect-run interface](../../scripts/agent12-balanced-perfect-field-bound.cjs) now delegates to the shared validator and preserves its original public all-win strictness and numeric outputs. All **13/13 prior exact-source pure tests** continued to pass after the refactor.
- [Heterogeneous-field KL implementation](../../scripts/agent12-balanced-kl-field-bound.cjs) accepts precisely the externally verified completion labels `paper-qualified-win`, `paper-qualified-loss`, `paper-qualified-tie`. It rejects native-only outcomes, unqualified game rows, incomplete rank/seat/first-player exposure and any changed deck/policy/engine/opponent/clock hashes. It returns `conditionalLowerBound`, the complete empirical win rate and conditional target flag only after structural validation, always `externalPaperAndIndependenceAuditRequired: true`.
- [Twelve adversarial KL regressions](../../tests/agent12-balanced-kl-field-bound.test.cjs) cover exact all-win agreement, one/two losses at passing and failing thresholds, ties, missing three ranks, censored/error/native-only results, omitted preregistered rows, imbalanced strata, mixed frozen hashes, duplicated deal/receipt IDs, and numeric edge cases. **12/12 passed using actual remotely fetched source in a pure JavaScript test harness.** The added twelfth test enumerates exact Poisson-binomial tails for several strongly heterogeneous four-game win-probability vectors and independently checks that the KL bound never understates their upper-tail probability.
- [Cheap manual Node22 workflow](../../.github/workflows/agent12-statistical-field-confidence.yml) runs both suites with no Twinleaf compile or long game simulations. Real Node22 [CI 42331312718](https://github.com/FlareZ123/experiment-01/actions/runs/42331312718) passed the original 13 exact and 12 KL tests. A subsequent [CI 42331560465](https://github.com/FlareZ123/experiment-01/actions/runs/42331560465) also passed the seven independent paired setup-mulligan tests. Both are lightweight manual workflows without Twinleaf compile or simulated-game win-rate claims.

## What the procedure cannot certify

**Statistical and experimental constraints:** Unique text IDs are not evidence of physical deal independence, signed source-image provenance or legitimate paper-game outcomes. Externally audit each receipt and the frozen complete preregistration. If optimizer candidate/policy was selected after inspecting those test results, the nominal one-sided coverage is invalid without an untouched holdout experiment or controlled selection/multiplicity plan. If outcome/loss/tie labels are based on an incorrect engine, weak opponent policy, 128-root cap, or invalid 25-/35-minute official event clock, numeric mathematical conclusions are irrelevant to competitive strength. A balanced 128-stratum design measures that specific seat/start-weighted target only; it does not imply uniform good performance across every opponent individually.

**Current benchmark:** Three original opponent inventories (ranks23,25,28) are missing. Existing v8/v9 native development observations include engine errors and caps and lack independently accepted full paper games. The validator correctly returns no qualifying bound, and no candidate 60 should be certified from these methods today.

**Next:** Develop independently accepted complete games and source provenance first. Use this conservative KL method as a prospective *post-admission* scorecard if authentic complete trial ledgers eventually exist. **No 99.5% claim is made.**
