# Aichi 32-opponent benchmark: exact perfect-run confidence gate

**Agent 12 | 7 November 2026.** Evidence class: mathematical bound and new pure executable acceptance screen. This is a prospective experimental design. It supplies **no qualified games, candidate-game wins or deck recommendation**.

## The estimand and experimental design

The target is the average game win probability of **one unchanged candidate 60 and decision policy**, facing each of the 32 original opposing 60s with equal field weight. Within a rank, distinguish the candidate's actual physical seat and which seat goes first. These give **32 ranks × 2 seats × 2 first-player assignments = 128 equal-weight strata**. Freeze the opponent policy, game implementation and independent paper rules audit before drawing fresh physical deals. Any repeated physical opening for a paired counterfactual does not count as an additional independent game for this inference.

Let `p[r,s,f]` be the fixed candidate's true win probability in stratum `(rank r, candidate seat s, first-player seat f)`, and let `P = sum(p[r,s,f])/128`. Assume `k` independently randomized, paper-qualified complete game trials in **every** stratum, each recorded without excluding errors, unfinished games, ties or unfavorable draws from the preregistered denominator. The following exact result applies if all `128k` registered games are qualifying wins:

`Pr(all wins | p) = product(p[r,s,f]^k) <= (sum(p[r,s,f])/128)^(128k) = P^(128k)`.

The inequality is the arithmetic-geometric mean inequality. It holds for **heterogeneous matchup strengths**, including very difficult and very easy individual opponents. Thus for a tested all-win result, `L = alpha^(1/(128k))` is a conservative one-sided `1-alpha` lower confidence bound on the equally weighted field mean `P`. Equality of the bound occurs when all the stratum probabilities are equal. It does not require all 128 probabilities to be equal.

## Exact threshold at 95% one-sided confidence

| Wins per rank-seat-first-player stratum | Total complete wins | One-sided lower bound on field mean | Reaches 99.5%? |
| ---: | ---: | ---: | :---: |
| 4 | 512 | 99.41660443994437% | No |
| **5** | **640** | **99.53301063421702%** | **Yes, conditionally** |

For the null hypothesis `P <= 0.995`, the worst-case probability of observing all 640 wins is at most `0.995^640 = 0.0404363248893`, below the preregistered 5% significance level. Four all-win trials per stratum would instead give `0.995^512 = 0.0768099251346`, which is insufficient. These results were independently calculated with Python's standard math library and reproduced by the CJS implementation.

A **rank-only** balanced experiment ignoring candidate seat and first-player role could reach a nominal bound after 19 per rank, or 608 games. That design can estimate a different seat/order-weighted quantity if the actual exposure mix is uneven. The stronger 128-stratum design above directly fixes both axes and requires 640 all-win games.

## Reproducible guard and adversarial regressions

- [Pure CJS assessment library](../../scripts/agent12-balanced-perfect-field-bound.cjs) implements the 128-stratum AM-GM all-win gate. It requires 32 unique authenticated-source fingerprint *assertions*, source-identical opponent rosters per trial, a single candidate 60 hash, a single candidate policy hash, a frozen engine-plus-research-hooks digest, a frozen field-wide opponent policy bundle digest, a frozen paper adjudication protocol digest, and a common registration fingerprint. It checks exact registration attempt counts, unique trial IDs, unique independent physical-deal IDs, unique paper receipt IDs, and complete balanced rank-seat-first-player exposure. The only admitted outcome string is `paper-qualified-win`.
- [Thirteen adversarial pure tests](../../tests/agent12-balanced-perfect-field-bound.test.cjs) cover the 640 threshold, 512 near miss, missing original ranks 23/25/28, a loss or censored/native-only outcome, duplicate physical deals, dropped preregistered games, unbalanced first-player/seat exposure, deck or policy swaps, mismatched source/registration hashes, duplicated receipt IDs, invalid source attestation, drift in engine/hook, opponent-policy-bundle or adjudication-protocol fingerprints, and empty panels. **13 of 13 executed successfully using the exact remotely fetched CJS text in an isolated JavaScript test harness** on 7 November. This is a pure-logic validation, not a claim of a Node CI workflow run or a Twinleaf native game.
- The return property is intentionally named `conditionalStatisticalThresholdMet`. It always returns `externalPaperAndIndependenceAuditRequired: true`. A true boolean proves only that the supplied caller-asserted ledger satisfies the implemented arithmetic preconditions. The tool has no authority to authenticate the source screenshots, real physical RNG independence, policy competence, accepted Store actions, paper legality, adjudicated game clock, or preregistration provenance.

**Update, 7 November:** This original all-win interface now delegates its admission checks to the [shared 128-stratum ledger validator](../../scripts/agent12-balanced-field-ledger-validator.cjs). Its original 13/13 tests still pass, together with 11/11 general win/loss/tie KL tests, in a real lightweight [Node 22 GitHub Actions run 42330878234](https://github.com/FlareZ123/experiment-01/actions/runs/42330878234). The [heterogeneous KL extension](agent12-heterogeneous-kl-field-confidence-bound-20261107.md) preserves the exact all-win result and supports paper-qualified losses/ties without silently excluding them. No real game is certified by either computation. The earlier isolated-V8-only claim above is preserved as experiment history.

The source-manifest, individual game-paper receipts and registration links must be independently audited. A merely unique `physicalDealId` string is insufficient evidence of independent deals. A status labeled `paper-qualified-win` is also a claim until its corresponding complete-game record has survived an independent audit. An optimizer tuned on the same 640 games creates selection bias; holdout registration must predate candidate choice and testing. Multiple tested candidate lists require a separately justified multiplicity plan or a new untouched confirmatory panel. Any actual loss, tie, invalid result, error or uncompleted attempt falls outside this **all-success-only** method, and needs a different preregistered inferential procedure.

## Application to the live benchmark

The current [original-source admission matrix](../aichi-2026/original-source-admission-matrix-20261102.md) and [fixed-60 decision board](../README.md) report **29/32 authenticated original source inventories**, with ranks 23, 25 and 28 missing, **zero competitively paper-qualified games**, and no selected final fixed 60. Consequently, the exact 128-stratum design cannot be populated. This method yields **no evidentiary upgrade** to the developmental native-v8 results or any of the four historical comparison decklists.

Next useful step: incorporate this conditional gate only *after* the present release blockers have been solved, all 32 opponent originals are authenticated, both owner policies pass adversarial paper-game review, and full native source-to-opponent-to-source games are resolved under the official Aichi event timing. A small sample of native terminals should remain a developmental fidelity witness.

**This is an experimental qualification standard. It makes no assertion that a 99.5% field win rate is achievable.**


## Update, 12 November 2026: V3 policy identity is joined to each outcome row

The shared `validateFieldLedger()` now has an optional V3 evidence path. A V3 ledger supplies the frozen `policyPlanCore` and `policyPlanSha256`, plus the existing `policyPanelReceipts` array. Every outcome attempt must carry the matching plan digest, its per-game `policyRegistrationSha256`, the field-constant `policyAttestationBundleSha256`, and `policyApplicationReceiptSha256`. The validator reuses `validateOpponentPolicyFieldBundle()` and joins receipts one-to-one to outcomes by `trialId`, checking opponent rank, candidate seat, first-player seat, candidate/opponent deck and policy identities, field bundle digest, registration/attestation digests and the canonical receipt digest. Missing, extra, mutated or wrong-stratum receipts fail closed. This binds the exact opponent policy assigned to each rank to every counted seat/first-player game in the 128-cell estimand; it does not create a second ledger. Legacy callers without V3 policy-plan/panel-receipt fields remain compatible.

Policy-registration digests are **trial-scoped** (the V3 registration includes trial ID and registration/deal timestamps); the pre-deal policy-attestation bundle digest remains fixed across the field. Regression coverage for distinct per-game registrations and the 128-cell receipt/outcome join is committed in `tests/2026-11/agent49-opponent-policy-field-bundle-validator.test.cjs`. The existing Node 22 workflow is manual-only and has not been run for these changes; no CI pass or competitive game is claimed.

A synthetic regression now also constructs 640 V3 receipt-bound all-win attempts (five per each of the 128 cells) and verifies that the existing conditional lower bound exceeds 0.995. This validates the V3 ledger join and the unchanged all-win calculation only; it is not empirical game evidence or a deck-performance claim.

The aggregate field-ledger join verifies canonical application-receipt digests and trial/rank/seat/policy identity links; it does not substitute for per-game V3 bundle-builder/evaluator validation. Before aggregation, each receipt must come from a separately validated game bundle whose V2 runtime/card-pool/patch evidence and `fullProcessClosureCovered` status were checked. Fixture-only bundles with `fullProcessClosureCovered:false` are non-admitting and contribute zero competitive outcomes.
