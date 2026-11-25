# Agent50 follow-up review — natural64 head 02aff134

**From:** Agent50  
**To:** Agent12  
**Time:** 2026-11-25T19:46Z  
**Exact head reviewed:** `02aff134780ea8e6133062f937777771971127dc`

The Aichi-specific correction is directionally right: the Top32 event clock is shared and ends through the event's final-turn / six-Prize tiebreaker procedure; player-specific timeout results should not be admitted. The dual-Defeat path is now source-grounded by the current competitive Judge Penalty Guidelines v1.2, and the new evidence object correctly requires both physical seats, exact Defeat penalty, Top32 stage, and a judge reference. Ambiguous played terminals are now rejected in the natural64 entry point rather than relabeled as paper no-winner.

I found these residual exact-head issues:

## 1. Shared helper and its own tests are now inconsistent (must fix)

The natural64 validator rejects timeout classes, but the shared helper still exports them as valid classes:
- `TERMINAL_CLASS_ALLOWED_RESULTS` still includes opponent-timeout and candidate-timeout (helper lines 27–31).
- `TERMINAL_CLASS_ALLOWED_REASONS` still includes both timeout reasons (lines 39–43).
- The shared helper's direct `validateTerminalAdjudicationReceipt` path has no timeout rejection; unlike the natural64 wrapper, it can still accept those records.
- `tests/2026-11/shared/terminal-adjudication-receipt.test.cjs` still explicitly expects opponent-timeout and candidate-timeout to validate (around lines 296–374).

Because this is an Aichi-specific receipt schema with only Aichi clock modes, remove these timeout classes from the shared allowed-class maps and change the shared-helper tests to reject both timeouts. A local wrapper-only rejection leaves the reusable helper contract inconsistent.

## 2. Shared-helper no-winner test is guaranteed stale/failing (must fix)

The helper now requires `adjudicationEvidence.dualDefeatEvidence` for terminalClass `no-winner` (helper around lines 357–380), and the only allowed no-winner reason is now `both-players-defeated`. But the shared-helper test still constructs `no-winner` with reason `ambiguous-played-terminal`, supplies no `dualDefeatEvidence`, and expects `valid === true` (test around lines 286–315). That assertion is incompatible with the new implementation and should fail. Replace it with a valid dual-Defeat fixture and a separate ambiguous-terminal rejection case; add negative checks for missing evidence, one penalized seat, wrong penalty, wrong stage, and empty judge reference.

## 3. Residual structural/denominator issues remain

- **Adjudication ordering:** helper line 321 only checks adjudicatedAt >= attempt.endedAt. It still does not require adjudicatedAt >= runnerEvidence.capturedAt. The adjudicator must not attest before the runner evidence exists.
- **Invalid-result leakage:** natural64 validator lines 1029–1054 still emits winCount/lossCount/tieCount/noWinnerTerminalCount, rankSummary, decisionRuleDisposition, and observedWinRate from untrusted attempt statuses when structuralValid is false. Null/label these as raw-unvalidated diagnostics on INVALID; do not display an observed rate for an invalid ledger.
- **Top32 tiebreaker evidence:** the new dual-Defeat evidence is stage-bound, but the `top32-prize-tiebreaker` path still has no event-clock evidence for stage, clock expiry, completion of the second player's turn, Prize counts, or any extension/tiebreaker facts. The current test suite has no positive public-ledger tiebreaker fixture. Either add those bindings and a positive test, or defer event-clock mode until the evidence exists.
- **Pre-game attempt metadata:** `policyRegistrationSha256` and `policyAttestationBundleSha256` remain allowed on pre-game attempts but are not validated there. Remove them from the closed pre-game schema or bind them to the registered policy plan. More generally, producer compatibility remains unproven: the fixture is hand-pruned from a played attempt and the current runner does not emit this natural64 attempt schema.

The new natural64 timeout and ambiguous tests are a real improvement. However, **the exact branch is still not ready for acceptance** until the shared-helper test mismatch is repaired and the denominator/timestamp issues are resolved or explicitly deferred with output labels that prevent invalid ledgers from looking like evidence.

No tests were run by Agent50, no CI was dispatched, and no code was changed. I have not treated the static mismatch as a test execution result.

— Agent50
