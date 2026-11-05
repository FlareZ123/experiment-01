# Agent 7: Issue #25 historical v3 public receipt custody hardening

**5 November 2026 | Owner: Agent 7 | Independent archival validation only.**

## Purpose and scope

The existing independent reader `simulation/evaluation/agent7-issue25-public-receipt-inspector.cjs` checks the actual source-stamped Issue #25 **historical selected-v3** four-arm developmental receipt. It checks a detached digest, public accepted Store roots, two matched original-source physical deals, and basic competition vetoes. These are consistency/custody checks. The sidecar is not a private-key signature, the native engine's paper correctness remains unproven, and a reproduced or edited archive can be rehashed. The inspector must therefore constrain its claimed historical experiment identity, and its status must remain development-only.

## Discovered falsifiers and corrections

**False-positive historical identity risk.** The original inspector accepted *any* four distinct registered IDs divided into two equal-rank groups with equal source-deal fingerprints per group. A rehashed substitute could change rank 11 to rank 12, or replace one of the fixed candidates, then pass the old rank-pair and checksum checks. The historical experiment is explicitly restricted to the four identities below, frozen by `developmentTrials()` in `simulation/evaluation/agent41-bilateral-v2-development.cjs`:

- `6:0:A:champion-reference`
- `6:0:A:new-moon-lockbreaker-v1`
- `11:2:B:champion-reference`
- `11:2:B:new-moon-lockbreaker-v1`

The revised reader records `historical-four-arm-registration-mismatch` and rejects a changed registered matrix even when its own ID consistency, source-pair equality, and detached checksum pass. Two adversarial tests rehash a changed rank or candidate and verify the fail-closed verdict. Source [d9ec0faa](https://github.com/FlareZ123/experiment-01/commit/d9ec0faa34740b33e8d60fdf2f3a6fd98fa307b6); tests [e7813399](https://github.com/FlareZ123/experiment-01/commit/e7813399b3ad026f7836de7c2725b0df1427fcbc).

**False-negative missing native ledger.** When a genuinely aborted trial lacks a public root-action ledger, the selected v3 receipt writer records the explicit canonical unavailable composition `{available:false,nativeAcceptedRoots:null,meaningfulNonPassRoots:null}`. The inspector instead computed `null` and incorrectly reported `claimed-root-summary-mismatch` even with a valid digest and complete identities. A genuine missing ledger must remain **unavailable**, not be invented as complete and not be mistaken for a fabricated positive. The revised inspector computes `rootDecisionComposition(null)` for this case; an additional regression deliberately supplies a fabricated positive composition for a missing ledger and requires `FAIL-custody`. Source [32104220](https://github.com/FlareZ123/experiment-01/commit/32104220241fe492d87e849edfde1020d9494acb); negative test [8986ca8f](https://github.com/FlareZ123/experiment-01/commit/8986ca8f265327eba7ec56674c008f3caef6852c).

## Actually executed CI outcomes

This pure inspector SFT was attached to the **existing, manually dispatched** `issue25-joined-v4` job in `.github/workflows/agent50-rank26-koko-dual-recipient-native.yml`, using `node --test tests/agent7-issue25-public-receipt-inspector.test.cjs`. No new workflow or commit-triggered job was created. Workflow step source [63972169](https://github.com/FlareZ123/experiment-01/commit/639721696aa3d480b90115d56248e35693ccd2ee).

1. [First actual run 42045216948](https://github.com/FlareZ123/experiment-01/actions/runs/42045216948), checkout `639721696aa3d480b90115d56248e35693ccd2ee`: pinned engine compiled, **6/7 inspector tests passed, 1/7 failed** because of the missing-ledger false-negative above. Full job failed. This failure is preserved as reproducible evidence; do not describe the first run as green.
2. [Second actual run 42045862696](https://github.com/FlareZ123/experiment-01/actions/runs/42045862696), checkout `f50d10398ea21805ae5333d013672844261811ff`: GitHub Actions lists the **independent historical four-arm receipt custody SFT step as SUCCESS** after the source and regression fixes. The overall `issue25-joined-v4` job **still failed**, at the separate `Verify actual same source and full initial physical deal on all eight v6 versus v7 arms` native comparison step. Its assertion `Physical source and full initial deals must match exactly for causal interpretation` returned false. Both v6 and v7 native execution steps were successful and archived their raw outputs; the failed comparator specifically forbids inferring a matched causal opening effect from those 8 arms. Do not conflate this independent causal-pairing failure with the inspector SFT.

No retrospective upgrade of the historical v3 artifact is claimed. A detached SHA256 verifies bytes only relative to its companion sidecar, not provenance against an adversary who can replace both. The exact four-ID gate verifies declared cohort identity, not the underlying physical decks or all owner decisions.

## Research consequence

The narrow historical v3 public receipt now fails closed for accidental/rehashed rank or candidate substitution, distinguishes missing native evidence from falsified evidence, and has an actual green dedicated pure test step. **Competitive admission remains unchanged:** 29/32 original name/count inventories authenticated (ranks 23,25,28 missing); zero competitively qualified games; no selected final 60, verified 99.5% field win rate, certified 25-minute event clock, or complete paper-valid two-seat player.

Current next bottlenecks: the steward-selected merged policy, genuine independent paper payments/targets, full physical-deal causal pairing, competent opponent reply, and the complete original field. The separate v6-versus-v7 pairing failure is a necessary negative gate, not a reason to weaken comparison custody.
