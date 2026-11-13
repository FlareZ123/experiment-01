# PR46 panel-receipt fixture-marker review

**Status:** source-level gap addressed in PR #46 head `eec71827c2f474515b1864fcb722d50e4cf7a180`; the expanded Node 22 regression suite passed in run `43402869315`. Agent48 added explicit-null fixture-marker coverage across all V3 bundle marker slots. Independent review and a base refresh onto current main remain pending; do not merge until those are complete.

## Scope and reviewed revision

The finding was identified at PR #46 head `47046ad1b7f8d98ef2febcb031617bb7c0d2b476`. Agent43 added panel-receipt guards and cross-layer regressions to head `704a8e21a6c36d0e550c1643864d4692c67d88c9`; Agent48 then expanded the production evaluator's marker-source scan to cover explicit-null markers across all V3 bundle slots on head `eec71827c2f474515b1864fcb722d50e4cf7a180`. Node 22 run `43402869315` completed successfully. The earlier green runs `43400088615` and `43401517246` predate the final explicit-null expansion.

## Finding

A fixture-only marker on a **non-current** item in `bundle.policyPanelReceipts[]` appears able to pass the production builder and exported evaluator while the current bundle, trial, core and `policyApplicationReceipt` remain unmarked.

The path is visible in four places:

1. `simulation/evaluation/2026-11/agent43-independent-outcome-competence-v3.cjs:596-630` — `inspectPolicyPanelConsistency()` constructs `panelReceipts` from `bundle.policyPanelReceipts`. Its `receiptValid` predicate checks schema, digest, plan/attestation/registration bindings, rank format status, dates, policy identities, seat mapping and actor-only boundaries, but does not inspect `item.fixtureOnly`.
2. `simulation/evaluation/2026-11/agent43-independent-outcome-competence-v3.cjs:1184-1217` — `evaluateCompetitiveAdmissionV3()` scans fixture markers on the bundle, current trial/preregistration, policy-plan core, registration and **current** application receipt. It omits `bundle.policyPanelReceipts[*].fixtureOnly`. It does include panel receipt `formatReviewStatus`, but an item can carry `fixtureOnly:true` while retaining `formatReviewStatus:'independently-reviewed'`.
3. `simulation/evaluation/2026-11/agent44-v3-game-bundle-builder.cjs:343-359` — `checkedReceipt()` validates receipt schema, V2 runtime fields and the receipt digest; it does not reject or propagate a fixture marker. `validateReceiptAgainstPlan()` begins at line 362 and binds the receipt to the plan, format, dates, seats and policy identities, but does not inspect `fixtureOnly`. The builder passes each panel item through `checkedReceipt()` at lines 626-630 before panel validation.
4. `scripts/agent12-balanced-field-ledger-validator.cjs:323-454` — the standalone field validator validates each `gameReceipts` item and its rank/format/policy bindings, but does not inspect a receipt's `fixtureOnly` property.

The test helper `populatePanelCoverage()` at `tests/2026-11/agent43-independent-outcome-competence-v3.test.cjs:532+` creates the panel ledger across every authenticated rank, both candidate seats and both first-player seats (up to 128 entries). Thus the panel array is part of the actual full-field contract, not a dead property.

## Reproduction to add

Use the existing `makeFullClosurePolicyBundle()` / `populatePanelCoverage()` fixture. Before generating the signed review set:

1. Select a panel receipt whose `trialId` differs from `bundle.policyApplicationReceipt.trialId`.
2. Add `fixtureOnly: true` (and in a second variant, `fixtureOnly: 'true'`).
3. Recompute that receipt's `receiptSha256` with the existing canonical `evidenceBundleSha256()` helper.
4. Recompute the bundle-level reviews/signatures after the mutation, so the test isolates the admission guard rather than failing on stale digests.
5. Exercise both the exported `evaluateCompetitiveAdmissionV3()` path and the production `buildV3GameBundle()` path.

Expected production result: explicit rejection; `fixtureOnly:true`, `acceptanceReady:false`, `competitiveAdmission:false`, and `admissionEligible:false` (or a builder rejection before admission). The malformed-string variant must also fail closed. Keep `inspectAdmissionV3()` available for non-admitting fixture diagnostics.

## Likely repair boundary

- Include every `policyPanelReceipts[*].fixtureOnly` value in the production evaluator's fixture-marker scan; any present non-boolean marker must be invalid/fail-closed.
- Reject fixture markers on individual receipts in the production builder / panel receipt validator, or explicitly propagate them into the fixture-only determination. Do not rely on the builder alone: the exported evaluator is independently callable.
- Add regressions for both boolean `true` and malformed string values on a **non-current** panel receipt. Keep the existing trial/core fixture regressions.
- Rebase the PR onto current main and rerun its existing Node 22 workflow after the correction.

## Confidence and limitations

Confidence is **high that the original source omitted this marker path**, because the relevant arrays and validators were inspected directly. Boolean-true and malformed-string mutations on a non-current panel receipt are covered across the evaluator, field validator and production builder; explicit-null markers are also covered across V3 bundle slots. The expanded patched suite passed Node 22 run `43402869315`. Agent48 has added further null-marker coverage; Agent49 independent review and a current-main rebase remain pending. This is still a production-admission contract result, not evidence about any deck's competitive strength.

This is a production-admission contract issue only. It is not a Pokémon card-interaction conclusion, a simulator result, a physical-game result, or evidence about any deck's competitive strength.
