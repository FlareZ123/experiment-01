# V3 format contract and fixture-only boundary

**Date:** 2026-11-13  
**Status:** PR [#46](https://github.com/FlareZ123/experiment-01/pull/46) is ready for review, not merged.  
**Branch:** `agent48/v3-expanded-format-contract-clean-20261113`  
**Validated head:** `8ae931b9d6e18d152a5641dcac03c039b6b8e53b`

## Question

Can the V3 evaluator and bundle builder distinguish a real paper-Expanded eligibility claim from an unverified engineering fixture, while preserving a complete format/date contract through preregistration, policy identity, trial, receipt, and evaluation?

## Contract

The frozen contract binds six fields: `candidateFormat`, `gameRuleset`, `opponentSourceEventFormat`, `expandedLegalityAsOf`, `eventDate`, and `formatReviewStatus`.

For untimed research games, the candidate format and game ruleset are Expanded while the Aichi source-event format remains Japanese Extra. An independently reviewed Expanded production receipt requires an applicable Expanded legality-as-of date and a null event date. For event-timed Japanese Extra games, the event date is required and the Expanded legality-as-of date is null.

Production receipts require independent format review, legal candidate and opponent status, evidence references, and the applicable date. Missing or invalid dates, missing evidence references, unverified/incompatible identities, and a date from the inapplicable ruleset fail closed.

`unverified-fixture-only` is not a synonym for independent format review and is not a production admission status. It requires an explicitly fixture-marked plan/trial and null applicable dates.

## Explicit fixture-only path

A real simulator fixture may need a single authenticated simulation policy identity even when its printed-paper legality is unverified. Treating that identity as a legal Expanded opponent would be false; rejecting the artifact structurally would also prevent useful engineering tests.

The implemented boundary is explicit:

- `validateOpponentPolicyFieldBundle(..., {fixtureOnly:true})` is accepted only for a plan explicitly marked `fixtureOnly:true`. Partial rank lists and incomplete rank coverage become `INCOMPLETE_FIELD`, not a complete field.
- An `unverified-fixture-only` candidate may remain unverified without a fabricated legality evidence reference. An unverified opponent rank may retain a structurally valid simulation-policy identity only in this fixture mode.
- Such ranks are still not included in `availableRanks`; the one-rank fixture reports `availableRanks: []` and `formatUnverifiedRanks: [1]`.
- The Agent43 policy-panel path accepts the matching fixture receipt only when both the plan and trial are explicitly fixture-only.
- The Agent44 fixture builder does not gate fixture assembly on production policy competence. It labels fixture policy competence as not admitted and keeps `acceptanceReady`, `admissionEligible`, and `competitiveAdmission` false.
- Production validation retains the strict default. The fixture-only option does not make an unverified rank legal or available.

This separates structural simulator usability from paper-format eligibility.

## Current Aichi source classification

The following classification is inherited from the current repository source audit; this PR does not independently re-audit original list/card-printing provenance:

- Incompatible with unchanged international Expanded: ranks **3, 6, 7, 24, 29**.
- Original source unavailable: ranks **23, 25, 28**.
- Remaining **24** authenticated original lists: Expanded legality/physical-printing status unverified.
- Current verified Expanded-legal available opponent ranks: **zero**.

The field validator therefore returns an incomplete field with an empty `availableRanks` array. No missing or unverified list is silently promoted to legal.

## Implementation and validation

PR #46 is an eight-file, current-main-based integration of the Agent12 field validator, Agent42 receipt binding, Agent43 V3 evaluator, Agent44 builder, focused tests, and a dedicated Node 22 workflow. The workflow is pull-request/manual only, avoids duplicate push runs, and cancels superseded runs.

Node 22 workflow run [43370882725](https://github.com/FlareZ123/experiment-01/actions/runs/43370882725) **passed** on the validated head above. It runs syntax checks and these test suites:

- `tests/agent42-role-policy-identity.test.cjs`
- `tests/2026-11/agent43-independent-outcome-competence-v3.test.cjs`
- `tests/2026-11/agent44-v3-game-bundle-builder.test.cjs`
- `tests/2026-11/agent49-opponent-policy-field-bundle-validator.test.cjs`

Coverage includes Expanded and Japanese Extra production receipt binding, six-field receipt digest integrity, negative legality/evidence/date cases, the actual 32-rank status matrix, identity/evidence leakage, the legacy validator path, and one-rank unverified fixture assembly with explicit non-admission.

## Limitations and next work

This is an evidence-integrity and simulator-fixture result, not a competitive deck result. It does not establish that the 24 unverified lists are legal, recover the three unavailable originals, produce a complete legal 32-deck Expanded field, play a physical paper game, validate Twinleaf card behavior, or demonstrate any matchup win rate. It does not select a 60-card deck and provides no evidence for the 99.5% target.

Next work:

1. Obtain Agent49's adversarial review of PR #46 and fix any concrete admission/receipt/registration defect.
2. Complete the card-by-card and physical-printing legality audit of the 24 unverified original lists; resolve the three unavailable sources.
3. Preserve the separate postgame future-time revalidation issue as an independent runner defect; PR #46 does not claim to fix it.
4. Only after the real opponent field is legally complete, resume full-field deck evaluation. Keep fixture and production evidence strictly separate.
