# Completed rank-11 v1 prospective exposure schedule: 64/64 audited attempts

**Agent 21, 19 October 2026 UTC.** Evidence type: complete, prospectively registered, source-dealt, pinned-engine **mechanical and policy-opportunity diagnostic**. **Zero competitively qualified games**. This report supersedes the unfinished-partition status in [the original study description](rank11-prospective-exposure.md) without changing its original frozen frame or claim scope.

## Precommitted frame and invariants

The full 64-attempt protocol was registered **before outcomes** at commit `6d041233a04b7fb97aa5b4e3c8486225a38ea55a`, in [registration JSON](registrations/rank11-prospective-exposure-v1-20261018.json) with digest `d740f268d2d7d1dcc8bbca4b558f1fee8a05fc6602939a763211691ba6794d4e`. The original execution branch was `research/rank11-prospective-exposure-20261018` at research commit `c9e8e72c367147cae46562a15d400ea18c691003`.

- Pinned Twinleaf engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Source rank-11 Wataru Yano Absol/Garbodor printing-sensitive SHA-256 `967308cd60e92348d8069a348174d816efcaa06f3825a3cf45b64886facb1273`.
- Candidate champion-reference SHA-256 `85d816b20b514bcf2936fbeca79d9577f745bc7e1e7e151c3234fd6c9ea81f52`.
- Candidate New Moon Lockbreaker v1 printing-proxy SHA-256 `012f774efb2fd5452cc3a46019edc41d5f8aececbd59815ed0af618aa3373184`.
- Policy `rank11-autonomous-boostshake-v1`, fixed v3 decorrelated physical-seat seeds, 16 candidate-by-seat repeats, genuine engine draw-log proof of which player began, 90 root-action cap. The source-policy predicate is a very narrow first-turn Tool-Garbodor opportunity screen.
- Two fixed candidate 60s were compared against the same opponent source seed in each seat group. The **64 games share only 32 distinct physical-seat/seed opportunities**, so paired candidate records are correlated. No observations were excluded due to unsuccessful source hands or engine outcomes.

## Original and subsequently completed partitions

Every listed execution completed successfully on the frozen branch. Every 16-arm archive was separately validated by `scripts/rank11-prospective-artifact-summary.cjs` in a manual audit workflow, which checked the committed frame digest, exactly 16 registered trial IDs, live identity and seed reconciliation, reproduced per-cell counts, and 16/16 original engine draw-log starting orders. Source-first/second counts are **game arms** and must be halved for unique paired source deals.

| Frozen repeat partition | Engine CI / archive | Independent audit CI | Source first / second | V1 opportunity / complete first-turn Garbodor | Engine terminal / action capped / exception |
| --- | --- | --- | ---: | ---: | ---: |
| 0, repeats 0–3 | [39095223455](https://github.com/FlareZ123/experiment-01/actions/runs/39095223455) | [39095506698](https://github.com/FlareZ123/experiment-01/actions/runs/39095506698) | 12 / 4 | 0 / 0 | 2 / 14 / 0 |
| 1, repeats 4–7 | [39188853881](https://github.com/FlareZ123/experiment-01/actions/runs/39188853881), artifact [12158778170](https://github.com/FlareZ123/experiment-01/actions/runs/39188853881/artifacts/12158778170) | [39189451330](https://github.com/FlareZ123/experiment-01/actions/runs/39189451330) | 10 / 6 | 0 / 0 | 2 / 14 / 0 |
| 2, repeats 8–11 | [39189483558](https://github.com/FlareZ123/experiment-01/actions/runs/39189483558), artifact [12159905626](https://github.com/FlareZ123/experiment-01/actions/runs/39189483558/artifacts/12159905626) | [39189749818](https://github.com/FlareZ123/experiment-01/actions/runs/39189749818) | 6 / 10 | 0 / 0 | 1 / 15 / 0 |
| 3, repeats 12–15 | [39189495377](https://github.com/FlareZ123/experiment-01/actions/runs/39189495377), artifact [12159566916](https://github.com/FlareZ123/experiment-01/actions/runs/39189495377/artifacts/12159566916) | [39189798760](https://github.com/FlareZ123/experiment-01/actions/runs/39189798760) | 8 / 8 | 0 / 0 | 2 / 14 / 0 |
| **Full registered total** | **64/64 attempts** | **4/4 partition audits** | **36 / 28** | **0 / 0** | **7 / 57 / 0** |

**Artifact integrity:** partition 0 source JSON SHA-256 `768f934ea724fbfa98575287c00ffa5d641ca6ade4b75156340eaac9ab615d80`, reported in the original study. Partition 1 source JSON SHA-256 `d292000517148de149d74b90c8ff954a1d69eb9f9b2aab805d4c5ccfeea38b03`, artifact ZIP SHA-256 `cc91ae9b174c56bd4b39b433d274c5d2008c6552563b0247dea3aa11096b1d19`. Partition 2 source JSON SHA-256 `b7ba204f57e962db0062e24651ac981d27a85a4e70177c084e5dfd3d82101e16`, ZIP SHA-256 `2c88f7f4b0ad98c1cebe7a9832f26d24e3cc605b0e0c976456ebea2e3608aabc`. Partition 3 source JSON SHA-256 `1872cc50a21944b23d42ad698bb2906302e003ac0a4f816cf41da9fd10b78316`, ZIP SHA-256 `3b950390ca549fc9679718ccce6119a99f9d496cd44911a58377ce09d3086e00`.

### Balanced physical-seat audit

| Candidate | Candidate physical engine seat | Rank 11 actually started first | Rank 11 actually started second | Missing / unverified first order |
| --- | --- | ---: | ---: | ---: |
| Champion reference | A | 11 | 5 | 0 |
| Champion reference | B | 7 | 9 | 0 |
| New Moon v1 | A | 11 | 5 | 0 |
| New Moon v1 | B | 7 | 9 | 0 |

This is **18 independent source-first and 14 source-second physical seed/seat deals**, observed twice across candidates. Each candidate and seat attained at least two of each actual-start stratum, but no actual first-turn Garbodor event occurred. The original registration's complete lock-and-response coverage threshold was consequently not attained.

## Interpretation, one stochastic and one deterministic limit

**Rare-opening limit:** the original static source-hand search-target census reports `p=2.23067981%` for a narrow opportunity conditional on valid opening. Assuming independent unique source deals, exactly fair source-first selection and census transfer without opponent mulligan dependence, a unique seed/seat chance is approximately `p/2`. The hypothetical probability of zero narrow opportunities across 32 unique source deals is **69.8434%**. The detailed assumptions and 2.6987% both-seat exposure-sensitivity calculation are in [Agent 21's registered-frame power audit](../statistics/rank11-prospective-v1-exposure-power.md). These numbers are **analytic model sensitivity, not fitted probabilities, gameplay win rates or evidence of a successful countermeasure**.

**Response qualification limit:** the original `simulation/evaluation/rank11-prospective-exposure-run.cjs` intentionally hard-codes `candidateResponse.legalStateTransitionWitness:false` in every observation. The `auditRank11Exposure` function in `scripts/rank11-prospective-exposure.cjs` requires that value to be `true` for any cell's `candidateResponseObservedAfterLock` and hence `exposureCovered`. Thus the original frozen runner would return `allCellsExposed:false` **even if** it encountered a lock. This fail-closed protocol is appropriate for unaudited responses. It does **not** demonstrate that a legitimate counter-response is unavailable.

The 7 engine-terminal games occurred under generic or narrowly scripted bots with a 90-action cap for other games; their winners, if any, are expressly **excluded** from competitive rate denominators. No round-clock or authentic Japanese printing equivalence was independently certified.

## Independent whole-cohort integrity gate, compiled in existing manual CI

**[Full 64-arm archive census CI 39190619923](https://github.com/FlareZ123/experiment-01/actions/runs/39190619923) PASSED on 19 October 2026**, following correction of a negative-unit-test expectation from the first attempt (CI 39190546465). The new [cross-partition auditor](../../scripts/rank11-prospective-complete-census.cjs) and [five adversarial tests](../../tests/rank11-prospective-complete-census.test.cjs) run within the **existing manual-only artifact-audit workflow**. They download all four immutable archived artifacts, verify each raw JSON SHA-256 against the digest above, reconcile all 64 exact precommitted trial identifiers and policy/seed identities, recompute each stored per-partition audit, detect any duplicated or missing attempts, prove the two candidates' paired seed/seat start-order agreement, and reject fabricated candidate-response certification.

The independent combined output confirms `registered=64`, `observed=64`, `uniquePhysicalSeatSeedDeals=32`, `verifiedActualStarts=64`, `sourceFirstArms=36`, `sourceSecondArms=28`, `policyOpportunities=0`, `completedGarbodor=0`, `action-capped=57`, `engine-terminal=7`, `qualifiedCompetitiveGames=0`. **Five of five negative/positive regression tests passed, and no frozen source observation was replaced.** The failed first run was a test assertion ordering issue only: a deliberately modified response flag altered the archived-audit projection before the explicit false-certification check. The corrected test recomputes the altered internal audit to isolate the intended fail-closed guard.

## What the result changes

The **entire 64-trial frame is now complete**, so the former request to finish three partitions is closed. This exposes a study-design limitation, not a strength ranking of the fixed 60s. It supports a **new and separately preregistered, owner-information-safe conditional-source-opportunity mechanical study**, explicitly preserving every rejected source deal and verifying authentic opposing lock, live candidate reply, effect and next-turn continuation. For eventual deck choice, separately require representative, unselected, both-start and **cross-archetype** full games with competent frozen bilateral policies, rules fidelity and official match-clock outcomes.

The source coverage remains **29/32 exact Aichi Top 32 decklists**, with ranks **23, 25 and 28** still unpublished. New Moon remains an English-printing proxy. **Competitive-qualified games: 0; demonstrated fixed-deck 99.5% win rate: none.**
