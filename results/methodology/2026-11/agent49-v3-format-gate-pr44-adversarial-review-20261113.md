# Agent49: PR #44 Expanded-format gate adversarial review

**Date:** 13 November 2026  
**Reviewed branch:** `agent48/v3-expanded-format-contract-20261113`  
**Reviewed head:** `b874765c42001e9642198e8141c6889236971d66`  
**Current main at review:** `b22624f23e5001c2c39e4762047d5296123d6d94`  
**Disposition:** do not merge or treat as integrated. PR #44 is a useful direction, but it has an event-path runtime defect, rejects the current honest fixture, lacks direct tests for its new field states, and is materially stale relative to main. No Node 22 execution or game result is claimed.

## Question

Does PR #44 safely separate the governing paper Expanded research game from the Japanese Extra Aichi source event, while preserving the current non-admitting fixture and carrying the same format contract through the evaluator, builder, registration and application receipt?

## Findings

### P1 — Event-mode evaluator throws for fully populated review packets

In `simulation/evaluation/2026-11/agent43-independent-outcome-competence-v3.cjs`, `inspectAdmissionV3()` evaluates the new EVENT `printAndCustodyReviewed` expression using `timing.registration?.eventDate` and `trial` before either binding is available. `timing` is never declared in the function. `trial` is declared only after the EVENT branch, so it is still in its temporal dead zone at the point of use.

The event fixtures populate the preceding Japanese Extra fields, so they reach the undefined `timing` reference and throw `ReferenceError`; correcting only that reference would then expose the pre-declaration `trial` access. The existing no-call and official-call event tests should catch this once the Node 22 preflight is actually run.

**Minimal correction:** bind `const trial = bundle?.trial` before the mode branch and compare the event date to `prereg.registration?.eventDate` (or declare `const timing = prereg` before use). Keep both event regression cases.

### P1 — PR #44 rejects the current truthful non-admitting fixture

Current main's Agent36 fixture explicitly records:
- `candidateFormat: 'Expanded'`, `gameRuleset: 'Expanded'`, `opponentSourceEventFormat: 'Japanese Extra'`;
- `expandedLegalityAsOf: null`, `eventDate: null`;
- `formatReviewStatus: 'unverified-fixture-only'`;
- candidate `formatStatus: 'unverified'` with no legality evidence reference;
- the authenticated rank-1 simulation source also remains `formatStatus: 'unverified'`.

That is the correct non-claiming fixture state. PR #44's format-aware Agent12 validator requires the candidate to have `formatStatus: 'legal'`; its `inspectTimingPreregistration()` unconditionally requires a valid Expanded legality date for every untimed trial; and `untimedPaperAttestationValid()` requires independent Expanded legality reviews. `buildV3GameBundleFixture()` calls the same pre-deal field validator and the same V3 evaluator, so the fixture cannot pass the branch's new checks.

Do not relabel the fixture legal, fabricate an Expanded legality date, or attach paper-legality evidence that has not been reviewed. Add an explicit fixture-only structural path that preserves unverified format status, can assemble the engineering artifact, and unconditionally returns non-admitting / non-competitive. Production admission must remain fail-closed and require the actual legality evidence.

### P1 — Production builder and receipt producers are not updated

PR #44 changes only:
- `scripts/agent12-balanced-field-ledger-validator.cjs`;
- `simulation/evaluation/2026-11/agent43-independent-outcome-competence-v3.cjs`;
- `tests/2026-11/agent43-independent-outcome-competence-v3.test.cjs`.

It does not change the current main Agent44 builder or Agent42 receipt producer.

The current `agent44-v3-game-bundle-builder.cjs`:
- does not require/freeze `gameRuleset`, `candidateFormat`, `opponentSourceEventFormat`, and the applicable legality/event date in `validateGameRegistration()`;
- emits a `policyRegistration` without those fields;
- accepts an authenticated opponent rank without requiring `formatStatus === 'legal'`;
- does not bind those fields into the V2 application receipt.

The current `agent42-role-policy-identity.cjs:createPolicyApplicationReceipt()` likewise emits no format identifiers or applicable date in its receipt digest. The new V3 evaluator compares these fields across the plan, registration, trial and receipt. Therefore a production bundle produced by the current builder/receipt path will fail the new evaluator even if the trial itself has correct labels.

Required invariant: the same validated contract must be bound through policy plan → game registration → policy registration → trial → per-game application receipt → evaluator. Keep the Aichi source-event format distinct from the actual game ruleset. Update the builder and receipt producer in coordination; do not silently mutate historical V2 receipt semantics.

### P1 — New incompatible/unverified field semantics have no test coverage

The PR's V3 `makePolicyBundle()` fixture marks every authenticated rank `formatStatus: 'legal'`; its 29-rank case is 29 legal ranks plus three source-unavailable ranks. It does not exercise `incompatible` or `unverified`.

The existing `tests/2026-11/agent49-opponent-policy-field-bundle-validator.test.cjs` remains format-unaware, and the manual Node 22 workflow `.github/workflows/agent49-owner-paper-preflight-pure.yml` does not run that validator test file at all.

Add a current-Expanded-field matrix:
- incompatible: ranks 3, 6, 7, 24, 29;
- source-unavailable: ranks 23, 25, 28;
- remaining 24 authenticated ranks: unverified pending review.

Assert `INCOMPLETE_FIELD`, exact status arrays, no available/policy identity for incompatible or unverified ranks, required incompatible evidence references, and rejection of receipts against both statuses. Keep separate synthetic all-legal fixtures for the 128-stratum completeness path and separate Japanese Extra event-mode fixtures where appropriate. Include the direct validator test in the manual Node 22 preflight.

### P1 — PR branch is materially stale and not mergeable

At review, PR #44's base was `6d88220228cd1572cf293790197d66f306828413`; its head was `b874765c42001e9642198e8141c6889236971d66`; current main was `b22624f23e5001c2c39e4762047d5296123d6d94`. GitHub compare reported the branch diverged, with main 191 commits ahead and the PR head one commit ahead of main; PR metadata reports `mergeable: false`.

Main has since changed the V3 evaluator, Agent44 builder, Agent42 receipt helper and Agent36 runner. A green test run against the stale branch would not validate the integrated pipeline. Rebase/rebuild on current main before treating further review or test results as relevant.

### P2 — Inapplicable date slots are not required to be null throughout the packet

The field validator rejects an inapplicable date in the policy constraints, but the V3 preregistration/evaluator checks the applicable date without requiring the other date slot to be null/absent on registration, trial and receipt. Add mode-specific null-slot assertions so an Expanded packet cannot carry a stale Aichi event date and a Japanese Extra event packet cannot carry an Expanded legality date. This is a consistency hardening, not the primary blocker.

## Chronology boundary retained from the broader V3 review

The pure builder can assemble a bundle from a fabricated but syntactically valid GitHub persistence/deal receipt even when the referenced pre-deal artifact is absent. This is already captured by the explicit regression `production builder can assemble post-deal chronology without a durable pre-deal artifact`. It is an acknowledged pure-builder trust boundary: the independent reviewer must fetch the actual GitHub run, commit/blob, job/step and physical-deal evidence. The signed paper review currently requires `untimedProtocolPreDealVerified`; the review instructions must explicitly define that duty to include verifying the persistence receipt and matching generation step. See the broader [Agent49 V3 builder/runner review](agent49-v3-adversarial-builder-runner-review-20261113.md).

## Actions taken

- Posted the event-path runtime defect, missing format-status tests, manual-workflow coverage gap, fixture incompatibility, and branch-staleness findings on [PR #44](https://github.com/FlareZ123/experiment-01/pull/44).
- Sent detailed handoffs to Agents 42, 43 and 44 and broadcast the cross-component diagnosis.
- Made no edits to Agent48's active branch, Agent42's receipt helper, Agent44's builder, or Agent36's runner.
- Did not run Node 22 tests: this connection has no workflow-dispatch action. The branch is explicitly still draft and no CI pass is claimed.

## Recommended next sequence

1. Agent48 rebases onto current main; fixes the EVENT scope regression; adds a fixture-only non-admitting path and the real format-status matrix tests.
2. Agent42 and Agent44 carry the canonical format/date fields through the production receipt and builder; fixture-only fields remain explicitly unverified.
3. Agent43 verifies event/untimed date-slot separation and makes the external persistence-verification duty explicit in the signed review contract.
4. Run the existing manual Node 22 preflight from a dispatch-capable owner session before merging.
5. Only after the builder, receipt helper, runner and evaluator agree should the production path be considered ready for a real preregistered game.

**Confidence:** high for the static event-scope, fixture-rejection, missing-field and stale-branch findings; no dynamic test execution is claimed. This review produces no deck, matchup result, competitive game, or win-rate estimate.
