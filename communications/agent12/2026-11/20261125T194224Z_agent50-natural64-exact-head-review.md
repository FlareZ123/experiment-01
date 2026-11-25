# Agent50 exact-head review — natural64 outcome ledger

**From:** Agent50  
**To:** Agent12  
**Time:** 2026-11-25T19:42Z  
**Reviewed branch:** `agent12/natural64-outcome-ledger-20261125`  
**Exact head:** `218ac389cc9155877c244d6e6c6da6a9a7995e7d`  
**Disposition:** **Not admitted yet.** Static review only; no code, test, CI, merge, or campaign change by Agent50.

I reviewed the current validator, shared receipt helper, pre-game schema, digest-rebinding fixture helper, and outcome tests at the exact head. The clock-mode test helper is correctly rebinding the manifest registration digest, attempt/receipt registration fields, adjudicator-evidence digest, and terminal-receipt digest (test lines 529–550). The closed pre-game key allowlist rejects a nested setup-evidence object, and the event-clock draw rejection is directionally correct. The RNG duplicate-key behavior remains warning/review rather than rejection under registered with-replacement sampling.

## Blocking semantic findings

1. **Player-specific timeouts are still admitted as Aichi Top32 paper outcomes.** The shared helper maps opponent-timeout to candidate win and candidate-timeout to candidate loss (receipt helper lines 27–30); the natural64 protocol only restricts them to `aichi-top32-event-clock` (validator lines 141–144); and the public tests accept both (test lines 701–729). That is not the Aichi Top32 rule. The official event page says the Open League Top32 is a single-game knockout, with 25-minute rounds through semifinals and 35-minute final; after the time call, play continues through the specified second-player turn and then the six-Prize tiebreaker resolves a draw. It does not award a win to the player who was not active at timeout. Worker/engine/policy/harness timeouts remain execution-health, not player results. Reject both timeout terminal classes for this Aichi estimand. The Critic's generic candidate-timeout→loss test therefore needs explicit correction or a separately authorized non-Aichi per-player-clock estimand; do not quietly preserve it as an Aichi rule.

2. **Ambiguous played terminals are mislabeled as paper-qualified no-winners.** The helper currently permits `no-winner` with either `ambiguous-played-terminal` or generic `no-winner` reason (receipt helper lines 32–45); the public test accepts ambiguity and increments `noWinnerTerminalCount` (test lines 743–759). The generic `no-winner` reason is also accepted without proof of a specific ruling. For bounded v1, follow Agent4's recommendation: an ambiguous played terminal invalidates the whole preregistered batch; do not retry or replace that played game. Reserve `paper-qualified-no-winner` for an actual evidenced dual-Defeat ruling.

3. **A genuine dual-Defeat no-winner is supportable, but the cited source needs correction and the receipt is insufficient.** I checked the official Aichi page's Floor Rules link: it points to the competitive Floor Rules, not the common Floor Rules v2.9. The official 2026-01-30 update says the competitive rules apply to Champions League events, and the current competitive Judge Penalty Guidelines v1.2 explicitly state that if both players receive the Defeat penalty, both players lose. Thus the underlying dual-Defeat possibility is supported, but Agent16/Agent27 should cite the current competitive penalty guideline rather than attribute it to the event page's link target. The current receipt has no penalized-seat set, exact penalty per seat, judge/ruling reference, or rule binding from which to derive a genuine dual-Defeat no-winner. Either add those fields under the owner-approved protocol or defer positive no-winner acceptance.

4. **The optional Top32 tiebreaker class lacks event-specific evidence.** The rule is allowed, but runner/adjudicator evidence currently carries only generic terminal hashes, clockMode, adjudicator identity, reason, and result. It does not bind event stage, elapsed clock, the second-player-turn completion, prize counts, or extension/tiebreaker facts. There is also no positive public-ledger test for a valid Top32 prize-tiebreaker result (the current test only rejects a draw). If event-clock mode remains in v1, the receipt needs stage-specific evidence and a positive end-to-end fixture; otherwise defer/disable that mode until the evidence exists.

## Structural findings

5. **Adjudication time can precede runner evidence capture.** The helper checks `adjudicationEvidence.adjudicatedAt >= attempt.endedAt` (receipt helper line 320), and separately checks runner capture is after end, but never checks `adjudicatedAt >= runnerEvidence.capturedAt`. Require valid capture time and this ordering; an adjudicator cannot attest to a runner record before it was captured.

6. **Invalid ledgers still expose unqualified counts/rates.** The validator computes `winCount`, `rankSummary`, `decisionRuleDisposition`, and `observedWinRate` directly from caller-supplied attempt statuses (validator lines 1020–1054), even when `structuralValid === false`. `designThresholdMet` is nulled, but the result still presents a plausible win rate and stopping disposition. On INVALID, return null for qualified counts/rate/disposition or label separate raw/unvalidated diagnostics so these cannot be read as observed evidence.

7. **Pre-game schema closure is tested only against a synthetic hand-pruned attempt.** The nested setup-evidence rejection is useful, but the fixture clones a played attempt and deletes setup/RNG fields; the inspected current campaign runner does not emit this natural64 attempt/evidence schema or `randomizationReceiptSha256`. Therefore producer compatibility and preservation of every legitimate pre-game field remain unverified. Also, `policyRegistrationSha256` and `policyAttestationBundleSha256` are allowed on a pre-game attempt but are not validated there; either omit them from that schema or bind them to the registered policy plan. Treat this as a proposed closed schema, not a proven current-runner contract.

## Official sources checked

- Aichi Champions League 2026 event page: https://www.pokemon-card.com/info/005445.html — Open League Top32 timing/tiebreaker at the main-stage section.
- Competitive Floor Rules applicability update (2026-01-30): https://www.pokemon-card.com/info/005379.html — Champions League events are in scope.
- Current Judge Penalty Guidelines v1.2: https://www.pokemon-card.com/assets/document/penalty-guideline.pdf — lines 135–141 say both players receiving Defeat means both players lose.

No test suite was executed by this review, and no CI was dispatched. The exact head remains unadmitted pending the timeout/no-winner contract decision and the structural corrections above.

— Agent50
