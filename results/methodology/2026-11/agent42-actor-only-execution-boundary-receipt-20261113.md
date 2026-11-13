# V3 actor-only execution boundary: receipt binding and outcome separation

**Status:** implementation committed; JavaScript syntax parsed successfully; runtime test suites and a native Twinleaf game have not been executed. This is a policy-evidence integrity change, not a deck-strength result.

## Problem

The role composer already produced per-role actor-only audit counters, but a detached diagnostic object was not sufficient evidence that the exact audit governed a particular trial. A postgame receipt needed to bind the actual per-game boundary, and the V3 evaluator needed to independently verify it. A second failure mode was treating a failed policy audit as if it erased the factual result of a game that had already reached a natural terminal.

## Contract now implemented

1. `simulation/twinleaf/agent44-role-scoped-policy-composition.cjs` emits `aichi-actor-only-execution-boundary-v1` with candidate/opponent role labels, physical-seat mapping, wrapper version, observation origin/schema, fallback flags and counters. The composer rejects diagnostic full-state fallback switches in shared dependencies and role-local options. Runtime-observed invalid counters are returned in the boundary summary; they do not throw away the completed match result.
2. `simulation/evaluation/2026-11/agent36-v3-runner.cjs` carries the exact `roleResult.actorOnlyBoundary` into `trial.actorOnlyExecutionBoundary`, and preserves the full raw role audits in the diagnostic artifact.
3. `simulation/evaluation/2026-11/agent42-role-policy-identity.cjs` hashes the trial boundary into `actorOnlyExecutionBoundarySha256` and includes both the boundary and digest in the V2 policy-application receipt. Missing or non-qualifying summaries are still recorded rather than preventing a factual application receipt.
4. `simulation/evaluation/2026-11/agent43-independent-outcome-competence-v3.cjs` independently checks the boundary schema/digest, equality with the current trial, candidate/opponent seat mapping, role labels, observation origin/schema, explicit fallback flags and all counters. It evaluates every field-panel receipt, not only the current game.

Comparative policy competence requires both role audits to have explicit false values for `nativeOwnerTrainerFallbackEnabled`, `ownerFallbackDiagnosticViewEnabled`, and `nativePolicyMayUseHiddenInformation`, plus zero values for:

- `unsupportedPromptFallbacks`
- `nonLiveSpeculativeFallbacks`
- `nonOwnerNativeDelegations`
- `nonTurnPhaseFallbacks`
- `nonOwnerSeatBypassCalls`
- `nativeOwnerTrainerFallbackAttemptedUnsupportedPasses`

The evaluator deliberately keeps this status separate from factual game-outcome admission. A digest-valid receipt with a failed/nonzero actor boundary can preserve a verified natural-terminal outcome while failing comparative policy competence. Missing or malformed boundaries likewise cannot qualify policy competence.

## Regression coverage

- `tests/agent50-v3-actor-only-boundary.test.cjs`: fallback flags, observation binding, missing/nonzero counters and both roles' physical seats.
- `tests/agent42-role-policy-identity.test.cjs`: recursive identity-option denial and application-receipt boundary hashing, including missing and non-qualifying summaries.
- `tests/2026-11/agent43-independent-outcome-competence-v3.test.cjs`: valid boundary, missing boundary and a nonzero speculative fallback; the latter two preserve factual outcome admission but block comparative policy competence.

All modified JavaScript files and test files were syntax-parsed after the changes. An isolated V8 harness executed the actual extracted evaluator boundary helper with a deterministic digest stub: clean boundary → verified/eligible; digest-valid nonzero speculative fallback → verified but ineligible; missing boundary → unverified/ineligible. This checks the three status branches, not the production digest implementation or full Node suites. This is not a substitute for executing the Node test suites. The repository README specifies that V3 preflight/native execution uses existing manually dispatched workflows and that the Agent36 diagnostic public-key variable must be owner-configured before fixture compilation. No workflow was dispatched here.

## Limits and next actions

- Agent36's current runner now attaches the boundary, but the pinned Twinleaf Store fixture has not run; no native-game behavior or policy strength is demonstrated.
- Run the existing Node 22 pure preflight and Node 20.19 manual native fixture only after the owner-managed diagnostic public-key variable is configured. Inspect both role traces and verify that the boundary summary matches the raw audits.
- Agent43 should independently review the evaluator contract and its panel coverage; Agent49 should adversarially test that the summary cannot be detached from the receipt/trial.
- A passing actor-only boundary establishes only an execution constraint. It does not establish Expanded paper legality, deck-aware competence, matchup strength, a selected fixed 60, or any portion of the 99.5% target.
