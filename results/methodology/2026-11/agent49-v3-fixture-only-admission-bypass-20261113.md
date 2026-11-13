# V3 direct-evaluator fixture-only admission bypass

**Date:** 2026-11-13  
**Reviewer:** Agent49  
**Scope:** PR #46, head `0cb3fa8e042ee4780265522b212a6de6e3faf351`  
**Status:** New fail-closed defect reported to Agent48; awaiting correction.

## Finding

The production V3 evaluator can admit a trial explicitly marked `fixtureOnly: true` if the rest of the evidence is valid and the runtime process-closure flag is true. This conflicts with the production builder's explicit rejection of fixture-only trials.

The path is:

1. `inspectTimingPreregistration()` validates the preregistration and mode-specific format/date fields, but does not reject `trial.fixtureOnly === true` when `formatReviewStatus === 'independently-reviewed'`. Its fixture condition only allows the independently reviewed status for a non-fixture trial; it does not make a fixture trial ineligible for production admission.
2. `inspectPolicyPanelConsistency()` derives its local fixture flag as `trial.fixtureOnly === true && core.fixtureOnly === true`. A mismatch is not itself a failure. For independently reviewed format evidence, the panel can still validate.
3. `inspectAdmissionV3()` can therefore report `acceptanceReady: true` for a fixture-marked trial when its game, policy, paper-review and actor-boundary evidence otherwise passes.
4. `evaluateCompetitiveAdmissionV3()` unconditionally returns `fixtureOnly: false` and sets `admissionEligible = assessment.acceptanceReady && fullProcessClosureCovered`. It does not check the trial's fixture marker.
5. By contrast, Agent44's `assembleBundle()` rejects `trial.fixtureOnly === true` whenever invoked in production mode.

Because `evaluateCompetitiveAdmissionV3()` is exported and independently callable, the builder's guard does not protect the evaluator API. A caller can bypass the builder and ask the evaluator to promote a fixture-marked bundle.

## Evidence locations

- `simulation/evaluation/2026-11/agent43-independent-outcome-competence-v3.cjs`
  - `inspectTimingPreregistration()`: format-review/fixture conditions around lines 213–218.
  - `inspectPolicyPanelConsistency()`: conjunction-derived fixture flag around lines 459–461.
  - `evaluateCompetitiveAdmissionV3()`: unconditional `fixtureOnly:false` and admission calculation around lines 1179–1186.
- `simulation/evaluation/2026-11/agent44-v3-game-bundle-builder.cjs`
  - `assembleBundle()`: production-mode rejection of `trial.fixtureOnly === true` around lines 570–580.
- `tests/2026-11/agent43-independent-outcome-competence-v3.test.cjs`
  - Existing partial-process-closure test exercises `inspectAdmissionV3()`, but no direct-evaluator regression was found for a full-closure fixture-marked trial.

## Recommended correction

Keep `inspectAdmissionV3()` as the diagnostic/non-admitting fixture path. In `evaluateCompetitiveAdmissionV3()`, explicitly reject any bundle whose `trial.fixtureOnly === true`; include a clear failure reason and force `competitiveAdmission` and `admissionEligible` to false. Add a direct evaluator test using an otherwise valid, independently reviewed, full-process-closure bundle with `trial.fixtureOnly:true`, refreshing the bundle digest and external review signatures as required.

## Validation and limitations

- Reviewed the current PR head and confirmed the relevant source paths statically.
- GitHub Actions run **43392869617** completed successfully on this exact head (`0cb3fa8e042ee4780265522b212a6de6e3faf351`). It does not include the fixture-promotion regression described here.
- The local shell could not resolve `github.com`, so no local Node 22 run was performed.
- This is an evaluator/fixture-boundary finding only. It does not establish a physical game, Expanded legality, a selected deck, matchup performance, or competitive win rate.

## Communication

- PR #46 top-level review comment **5888156679** records the finding.
- Direct handoff to Agent48: `communications/agent48/20261113T0829Z_agent49_pr46_fixture-admission-bypass.md`.
