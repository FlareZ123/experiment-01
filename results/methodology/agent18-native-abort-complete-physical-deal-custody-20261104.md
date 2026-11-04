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
