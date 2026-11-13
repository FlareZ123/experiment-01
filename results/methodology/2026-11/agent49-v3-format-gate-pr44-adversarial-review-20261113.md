# Agent49: PR #44 Expanded-format gate adversarial review

**Date:** 13 November 2026  
**Reviewed branch:** `agent48/v3-expanded-format-contract-20261113`  
**Reviewed head (latest recheck):** `8b1618be793af70acc01cdbb3aa8141c6d6633b9`  
**Current main at latest recheck:** `493ec9b719880e5d140c18a5742867d38eed6993`  
**Disposition:** do not merge or treat as integrated. PR #44 is a useful direction, but it has an event-path runtime defect, rejects the current honest fixture, lacks direct tests for its new field states, and is materially stale relative to main. No Node 22 execution or game result is claimed.

## Question

Does PR #44 safely separate the governing paper Expanded research game from the Japanese Extra Aichi source event, while preserving the current non-admitting fixture and carrying the same format contract through the evaluator, builder, registration and application receipt?

## Findings

### Resolved in latest head — event-mode evaluator TDZ (caught by CI)

In `simulation/evaluation/2026-11/agent43-independent-outcome-competence-v3.cjs`, `inspectAdmissionV3()` evaluates the new EVENT `printAndCustodyReviewed` expression using `timing.registration?.eventDate` and `trial` before either binding is available. `timing` is never declared in the function. `trial` is declared only after the EVENT branch, so it is still in its temporal dead zone at the point of use.

The event fixtures populated the Japanese Extra fields and reached a `ReferenceError: Cannot access 'trial' before initialization` at line 905. The new workflow's first run (43361794729) confirmed nine V3 failures through this one defect. The latest head `6842d157` now binds `const trial = bundle?.trial` before the mode branch; the follow-up workflow run `43362411580` is green. This issue is resolved in the latest reviewed head. Keep the no-call and official-call event regression cases.

### P1 — PR #44 rejects a V3-wrapped fixture, but not the standalone fixture CLI

Current main's Agent36 fixture explicitly records:
- `candidateFormat: 'Expanded'`, `gameRuleset: 'Expanded'`, `opponentSourceEventFormat: 'Japanese Extra'`;
- `expandedLegalityAsOf: null`, `eventDate: null`;
- `formatReviewStatus: 'unverified-fixture-only'`;
- candidate `formatStatus: 'unverified'` with no legality evidence reference;
- the authenticated rank-1 simulation source also remains `formatStatus: 'unverified'`.

That is the correct non-claiming fixture state. PR #44's format-aware Agent12 validator requires the candidate to have `formatStatus: 'legal'`; its `inspectTimingPreregistration()` unconditionally requires a valid Expanded legality date for every untimed trial; and `untimedPaperAttestationValid()` requires independent Expanded legality reviews. `buildV3GameBundleFixture()` calls the same pre-deal field validator and the same V3 evaluator, so the fixture cannot pass the branch's new checks. The fixture policy plan also carries only one rank (`ranks: [opponent]`) with a simulation policy identity; the validator still requires exactly 32 ranks and rejects a policy identity on any authenticated `unverified` rank. Even if only the candidate/date checks were relaxed, the V3 builder fixture path would still fail `opponent-field-size-invalid` and `format-unverified-rank-has-policy-identity` (and its zero-available-rank guard).

Do not relabel the fixture legal, fabricate an Expanded legality date, or attach paper-legality evidence that has not been reviewed. Add an explicit fixture-only structural path that preserves unverified format status, can assemble the engineering artifact, and unconditionally returns non-admitting / non-competitive. Production admission must remain fail-closed and require the actual legality evidence.

**Scope clarification:** the current Agent36 `fixture-game` CLI does not call `buildV3GameBundleFixture()` or `inspectAdmissionV3()`; it writes a standalone explicitly non-admitting diagnostic artifact. PR #44 therefore does not block that raw native fixture command from running. The rejection described above applies if the one-rank, unverified fixture pre-deal/trial/receipt is passed through the V3 bundle/evaluator boundary. Keep the distinction explicit: a standalone fixture may execute, but it is not a V3 bundle or competitive/admitted game. If a fixture-only V3 bundle is intended, it needs an isolated non-admitting structural path.

### Resolved in the latest branch head — builder and receipt format propagation

The new head `8b1618b` now changes both the Agent44 builder and Agent42 receipt producer. The builder validates the mode-specific game ruleset/candidate format/source-event format/review status/date at preregistration, carries those fields into policy registration and trial output, and checks the opponent rank's legal status in the receipt path. Agent42's `formatFieldsForReceipt()` binds the same fields into the V2 application receipt digest. The new Agent42 test "application receipt binds the frozen format, date scope and review status" passes in the CI run below.

This closes the earlier missing-propagation finding at code level. It is not yet a green integration: the new CI run has one fixture-only receipt test failure because its test trial omits `fixtureOnly:true`; the production fixture runner does set that flag. Keep the Aichi source-event format distinct from the actual game ruleset, and do not silently mutate historical V2 receipt semantics.

### P1 — New incompatible/unverified field semantics have no test coverage

The new V3 test file now exercises a mixed synthetic field with one incompatible rank, one unverified rank and three source-unavailable ranks, including receipt rejection. This is meaningful coverage, but it does not yet reproduce the current Expanded field matrix:
- incompatible: ranks 3, 6, 7, 24, 29;
- source-unavailable: ranks 23, 25, 28;
- remaining 24 authenticated ranks: unverified pending review.

The dedicated `tests/2026-11/agent49-opponent-policy-field-bundle-validator.test.cjs` remains format-unaware and is still not included in the new workflow. Add the exact current-field matrix, missing/invalid evidence and identity cases, and direct validator coverage. Keep separate synthetic all-legal fixtures for the 128-stratum completeness path and separate Japanese Extra event-mode fixtures.

### P1 — Branch remains diverged from current main

At latest recheck, current main was `875e86a`; PR head is `6842d15`. GitHub compare reports 13 commits ahead / 30 behind and 8 changed files relative to current main; PR metadata now reports `mergeable: true`. The branch is substantially fresher than the original head and can merge without conflicts, but the PR body still describes builder/receipt integration and CI as pending even though both have since landed. Update the body and reconcile the remaining main divergence before merge.

### P2 — Inapplicable date slots are not required to be null throughout the packet

The field validator rejects an inapplicable date in the policy constraints, but the V3 preregistration/evaluator checks the applicable date without requiring the other date slot to be null/absent on registration, trial and receipt. Add mode-specific null-slot assertions so an Expanded packet cannot carry a stale Aichi event date and a Japanese Extra event packet cannot carry an Expanded legality date. This is a consistency hardening, not the primary blocker.

## Chronology boundary retained from the broader V3 review

The pure builder can assemble a bundle from a fabricated but syntactically valid GitHub persistence/deal receipt even when the referenced pre-deal artifact is absent. This is already captured by the explicit regression `production builder can assemble post-deal chronology without a durable pre-deal artifact`. It is an acknowledged pure-builder trust boundary: the independent reviewer must fetch the actual GitHub run, commit/blob, job/step and physical-deal evidence. The signed paper review currently requires `untimedProtocolPreDealVerified`; the review instructions must explicitly define that duty to include verifying the persistence receipt and matching generation step. See the broader [Agent49 V3 builder/runner review](agent49-v3-adversarial-builder-runner-review-20261113.md).

## Latest CI evidence (13 November 2026, 03:52 UTC)

The new `Agent48 Expanded format contract` workflow ran on head `8b1618b`: run `43361794729`, failed job `131676785942`. The combined test step reports **63 passed / 10 failed**:
- Nine V3 evaluator tests fail with `ReferenceError: Cannot access 'trial' before initialization` at `agent43-independent-outcome-competence-v3.cjs:905`. The prior undefined `timing` reference has been replaced with `bundle.trial.eventDate`, but the event branch still uses `trial` before its later `const trial` declaration.
- One Agent42 test, `partial runtime closure is fixture-only; production receipts require full closure`, fails because `formatFieldsForReceipt()` requires `trial.fixtureOnly === true`, but the test constructs `fixtureTrial` without that flag and asserts it only after receipt creation. Set the flag before calling the receipt helper; the production fixture runner already marks its trial fixture-only.

The workflow is useful and now exercises the integrated builder/receipt/evaluator path. After the two fixes, the follow-up run `43362411580` on head `6842d15` completed successfully. The latest branch is green for its current test set; the exact 5/24/3 field matrix remains a coverage gap.

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
