# Agent 18: Native aborts preserve the complete initial physical deal and accepted-root receipt

**4 November 2026 | normal Agent 18 | original selected bilateral runner provenance repair.** The physical-deal evidence on an aborted original-source native match previously survived only as an optional nested **source** fingerprint in `nativeAbortEvidence`. The comparative runner's error rows could lack top-level `sourceDealFingerprint`, `fullPhysicalDealFingerprint` and accepted root count. Earlier Agent50 48-root Issue #25 evidence had three ATTACK-prompt aborts with such direct-row gaps. Registration seed agreement does not establish physical deal parity after setup/mulligan draws.

## Exact source-level correction

Commits [82d656b](../../commit/82d656bca926ac9a9768ac22ebc9e6c6dca8b6c8) and [1e8313e](../../commit/1e8313e425b2a7be2d79c20804af5b294a784a58) implement:

1. `simulation/twinleaf/headless.cjs`: pass the **actual observer's** first-stable-turn-one whole-deal digest to each of the three error-custody call sites: bot decode, strict prompt validation and Store dispatch. The observer already existed, is opt-in, and never supplies physical identities to the live bot.
2. `simulation/twinleaf/native-dispatch-abort-evidence.cjs`: copy a valid `initial-full-physical-deal-sha256-v1` opaque digest into the redacted failure envelope. Reject wrong schema or malformed SHA-256. Preserve its existing public accepted-root ledger and source digest.
3. `simulation/evaluation/agent18-aborted-native-provenance.cjs`: validate nested abort provenance against actual trial source seat. Produce directly comparable source and whole-deal fingerprints only on valid observed receipts; validate accepted root count with its authentic ledger SHA-256. An absent receipt, invalid digest, wrong source seat, or modified accepted-root ledger is explicitly refused. The output labels every such result **aborted, paper-uncertified, noncompetitive**.
4. `simulation/evaluation/agent41-bilateral-v2-development.cjs`: lift only that validated post-error evidence into the canonical per-arm error row. The error classification and denominator are retained.
5. Tests: `tests/agent18-aborted-native-provenance.test.cjs` covers eight positive, missing and adversarial receipts; `tests/native-dispatch-abort-evidence.test.cjs` adds two pure cases. `tests/native-dispatch-abort-archive.pinned.test.cjs` now requests complete initial-deal recording and checks the receipt in the **three existing real-store failure-fixture classes**.

The exact output fields `nativeAbortProvenance.sourceDealStatus`, `fullPhysicalDealStatus`, and `acceptedRootLedgerStatus` distinguish `VERIFIED`, `NOT_CAPTURED`, `NO_VERIFIED_RECEIPT` and invalidity categories. The catch row retains the canonical `nativeAbortEvidence` and never infers unobserved physical deals from a seed. Normal successful results and existing frozen archives remain untouched.

## Evidence and remaining acceptance gates

**Verified:** GitHub accepted the atomic five-source-file commit and subsequent two-test-file commit, and a fresh remote readback verified the first. The standalone pure helper's eight tests passed locally on Node 22 before the regression additions. The source-level wiring is directly inspectable.

**Pending:** full compiled pinned-Twinleaf CI has **not yet run on this corrected head**. The updated native regression tests are staged for the existing manually dispatched native workflow. Do not claim actual new error-row receipt transport until a compiled original-Store failure exercises each path. Specifically verify the abort receipt in `runMatch`, the final `runDevelopment` error row and per-arm provenance before reinterpreting a source pair. No new workflow was added.

**Important limit:** the same registered rank 6/11 development streams remain *unfinished* and have unresolved ATTACK-phase owner prompts and paper-validity vetoes. Preserving an error's deal fingerprint does not make the run a gameplay success, establish decision quality, authorize hidden-information reads, or qualify an original-source game. Current project status remains **29/32 authenticated original card-name/count sixties, zero competitive games, no selected final fixed 60 and no demonstrated 99.5% win rate**.

## Immediate reviewer action

Integrate these native-error regression tests into the next existing manual pinned-Twinleaf CI release gate and publish the per-arm 48-root failed/cap status with the observed full/source SHA-256 digests. For any failure occurring before stable initial turn 1, `NOT_CAPTURED` is the correct status. Source-only and full-deal parity are separate comparisons; never equate equal registered seeds with an identical real deal.

## Follow-up: actual first-draw physical seat on native errors

Commits [5de5649](https://github.com/FlareZ123/experiment-01/commit/5de56499a5ee96c5e695db5ea38cd731c66df681) and [718f119](https://github.com/FlareZ123/experiment-01/commit/718f11943cbe9cdba0624a9ff8898dd2f3daeef0) extend the **same** error-custody channel with the real Store's existing `observeFirstTurn` plus `summarizeTurnOrder` first-card-draw verification. The read-only observer records `initialTurnOrderEvidence:{firstTurnSlot,verifiedByDrawLog}` in the native abort envelope. `extractNativeAbortProvenance` produces `actualStarterSeat` and `verifiedFirstTurn:true` **only** when the first-turn observer agrees with the earliest draw log, and otherwise emits `firstTurnStatus:'UNVERIFIED'` with a null seat. Malformed first-draw receipts fail the schema gate.

This enables `agent44-cross-candidate-source-pair-status.cjs` to compare both the **actual initial source deal** and **actual first-turn seat** when an aborted arm has valid evidence. The prior null/unknown outcome is preserved for genuinely uncaptured data. The original registered historical 48-root tests now assert these fields for three known post-first-turn native ATTACK-prompt aborts. The changed source and test modules passed parse-only syntax checks; **pinned compiled Store execution remains pending**. No opponent reply, paper clock, or competitive game qualification is implied by a matched initial opening.


## 5 November 2026: first compiled pinned-native regression receipt

**Compiled test gate PASS, competitive qualification unchanged.** The existing manually dispatched [Twinleaf bounded full-match probe, run 41958523102](https://github.com/FlareZ123/experiment-01/actions/runs/41958523102), head `6730bf9cada89f2c1ddcbbf815707fe8513a73e8`, selected only the new `abort-custody` job. Its original `bounded-match` job was skipped intentionally. The runner checked out the committed `vendor/twinleaf` gitlink, installed and compiled the server, then passed **21/21** pure abort-validator tests, **3/3** actual pinned Store failures (Store dispatch, bot decoder, strict prompt), and **1/1** Issue25 four-arm development regression; **25/25 tests passed**. The temporary job was added to the existing manual workflow `.github/workflows/twinleaf-completion.yml`, without adding a new workflow or a commit-triggered job.

The real four-arm native output, with all registered attempts retained:

| Registered arm | Disposition | Verified source seat in abort evidence | Actual first-turn seat | Accepted root count | Native source-deal SHA-256 |
| --- | --- | --- | --- | --- | --- |
| `6:0:A:champion-reference` | engine error | 1 | 0 | 37 | `2ce05954cf7a87661c3dc42c242ec6c10f8c9caa9a4a60c0d3580f23613744d1` |
| `6:0:A:new-moon-lockbreaker-v1` | returned but capped at 48; nonterminal | 1 (normal row) | 0 | 48 | `2ce05954cf7a87661c3dc42c242ec6c10f8c9caa9a4a60c0d3580f23613744d1` |
| `11:2:B:champion-reference` | engine error | 0 | 1 | 17 | `9bc69d70743d1c2d0e1406076a817309a0ae1fd73a68da3c27e1e76900d2b5f5` |
| `11:2:B:new-moon-lockbreaker-v1` | engine error | 0 | 1 | 42 | `9bc69d70743d1c2d0e1406076a817309a0ae1fd73a68da3c27e1e76900d2b5f5` |

Each aborted arm's `nativeAbortProvenance` reports `VERIFIED` for the source deal, entire physical deal, accepted-root ledger, and actual first-turn draw, with proper per-arm digest values independently present in the CI receipt. The full-physical-deal SHA differs across the two contenders because that hash includes **both** players' physical cards; do not equate the same source opening with an identical complete two-player deal.

**Remaining direct-row limitation:** all three `engine-error` rows still expose top-level `sourceSeat:null` and `candidateSeat:null`, even while validated nested `nativeAbortProvenance.sourceSeat` identifies the source seat, and the source-deal receipt matches the registered orientation. The previously missing top-level source/full-deal digests and starting-seat evidence **are repaired and compiled-verified**. A separate attempt to add fail-closed top-level seat fields was blocked by repository write safety controls, so no source code seat change is claimed. Consumers must distinguish these direct nulls from verified nested provenance. The native failures remain failures, the one 48-root result remains censored, and all four are **0 competitively qualified games**.

The whole-policy owner-information, paper-payment, source payoff, meaningful opponent reply, full 32-original field, and official match-clock gates remain open. The CI positive is limited to error-custody fidelity.
