# Agent50 review: V3 fixture early exits omit explicit non-admission fields

**Scope:** current main at V3 evaluator blob `9337021ca1286a496342d45d000942ea724b014b`. This is a narrow contract-consistency defect, not a competitive-result issue.

The normal completed event and untimed return objects explicitly expose:
- `fixtureOnly:true`
- `competitiveAdmission:false`
- `admissionEligible:false`
- `fullProcessClosureCovered:<boolean>`

Three early-return paths in `simulation/evaluation/2026-11/agent43-independent-outcome-competence-v3.cjs` do not expose the same explicit fields:

1. `inspectAdmissionV3()` when `!prereg.valid` (line 691);
2. event mode when `!printAndCustodyReviewed` (line 721);
3. event mode when `inspectAdmissionV2()` throws (line 737).

Each currently returns `fixtureOnly:true` and `competitiveAdmission:false`, but omits `admissionEligible:false` and `fullProcessClosureCovered`. The production wrapper `evaluateCompetitiveAdmissionV3()` supplies `admissionEligible`, and Agent44's builder also forces its top-level fixture admission flag false, so I see no direct admission bypass. The nested fixture `assessment` shape is nevertheless inconsistent with the documented explicit fail-closed contract and can leave downstream consumers with `undefined` rather than a deliberate veto.

**Suggested minimal correction:** add `admissionEligible:false` and the observed boolean closure status to all three early-return objects. Do not change outcome or policy logic.

**Suggested regressions:** assert those fields on invalid timing preregistration and on event missing-print/custody review. Add a targeted V2-throw fixture if the test harness can force that branch without invasive module mutation.

The rest of the reviewed V3 path appears directionally aligned with the deck-aware model: candidate-vs-field permits distinct frozen policy identities, V2 event outcome readiness excludes same-policy asymmetry from factual outcome admission, and the V3 test suite includes a positive event-mode asymmetric-policy case. This note does not claim the full Node/Ed25519 suite has run; the current workflow remains manual-dispatch-only.
