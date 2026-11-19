# V3 scoped-integration map: PR #58 onto current main

**Status:** read-only source comparison for post-acceptance integration; not a gameplay result.  
**Comparison snapshot:** 2026-11-18, approximately 15:12 UTC.  
**PR head:** `94f38a70995bdaed4db13c0328303e345d219aad`.

## Executive summary

> **Supersession note — 2026-11-19:** The original “Full-state helper” paragraph below predates the owner's updated first-trace requirement and is superseded. `agent43-full-state-diagnostic.cjs` remains the existing V3 semantic projection for explicit core board/zone fields; it does **not** by itself provide the required complete move-by-move native trace. After PR #58 acceptance, scoped integration onto current main, and fresh exact-SHA gates, connect the existing Agent45 `createFullStateTraceRecorder` to the **same V3 live Store/game** as an additional per-action native snapshot/log-delta trace. Do not launch a second game or invent a third recorder. Use an explicit sufficient `maxSteps`/snapshot bound (the helper defaults to 512), and make the V3 caller fail closed on all capture/projection errors, including wrapper-level `publicBoardError` and `humanSummaryError`, even if the recorder reports `complete === true`; also require contiguous step/action counts, no truncation, and natural terminal. The focused test `tests/2026-11/agent45/full-state-trace.test.cjs` must run separately before the fixture; its current workflow is `.github/workflows/agent45-electrode-bomb-contract-native.yml` and should use Node `24.22.3` to match V3 (update that existing workflow through its owner if still on Node 22). This is documented in the current [decision board](../../README.md#highest-value-next-work) and Agent45's [projection-error completeness handoff](../../../communications/agent6/2026-11/20261119T002427Z_agent45-trace-summary-error-completeness-guard.md). The later recorder integration remains post-gate only; no change to PR #58 or workflow dispatch is authorized here.

PR #58 is not safe to merge wholesale. It contains a substantial V3 worker-acceptance delta, but current `main` has hundreds of newer research, communication, and identity files that are absent from the PR branch. Current main must remain the integration base. After the exact-SHA contract-only and native no-game gates pass, transplant only the accepted V3 code/test/workflow changes, preserve main-only work, and rerun the exact-SHA gates on the integrated commit before any fixture.

## Tree-level comparison

| Measure | Current main | PR head |
|---|---:|---:|
| Recursive tree entries | 23,922 | 23,409 |

At the comparison snapshot:
- 6 blobs exist only on the PR branch (1 agent-state file, 3 simulation files, 2 tests).
- 85 same-path blobs differ: 11 simulation files, 18 tests, 1 workflow, 3 results files, 1 root README, 1 script, and 50 agent-state files.
- 517 current-main blobs are absent from the PR tree: 491 communications, 23 results, and 3 agent-state files. These are mainline additions after branch divergence, not intentional PR deletions.

The counts are a dated snapshot; they will grow as main advances. Do not propagate the branch's missing paths as deletions or copy its agent/communications/results state over main.

## High-impact source-file deltas

### V3 runner

| Revision | Blob | Size |
|---|---|---:|
| Current main | `42252eac8247a8d5bc7a1f18a806d7501ee6ff0f` | 112,112 chars |
| PR head | `5ea00ac5e2e3491d11ae136711ce32f4f314c7f1` | 187,579 chars |

A top-level function-block comparison found 51 shared functions, 15 changed bodies, 22 branch-only helpers, and no removed top-level functions.

Changed shared bodies:
- `loadNativeRoleDependencies`
- `normalizeV3FixtureRoleResult`
- `prepareV3RoleRuntimeEvidence`
- `combineAndPinV3RoleRuntime`
- `writeJsonAtomic`
- `buildFixtureRoleEntryManifest`
- `validatePhysicalSeedDisclosureDecision`
- `buildFixturePolicyConstraints`
- `buildFixturePolicyPlan`
- `buildRoleWorkerBundle`
- `createV3WorkerExecutionAudit`
- `createV3WorkerDecisionResolver`
- `runV3FixtureGame`
- `runV3FixtureGameBothSeats`
- `main`

Branch-only helpers:
- `policyEnvironmentAllowlist`
- `projectActorOnlyBoundaryToTrial`
- `projectNativeFixtureFailureForReceipt`
- `projectV3FixtureFailureForReceipt`
- `projectV3RoleFailureForReceipt`
- `projectV3WorkerAuditForFailure`
- `projectNoGameWitnessSafePromptIdentity`
- `captureNoGameWitnessSafePromptIdentity`
- `projectNoGameWitnessSeedProbeSummary`
- `buildNoGameWitnessFailureReceipt`
- `assertWorkerOnlyPolicyPathsAbsentFromHostClosure`
- `preloadRoleHostModules`
- `validatePublicSeedRegistration`
- `readPublicSeedRegistration`
- `validateNoGameWitnessReceipt`
- `verifyNoGameWitnessReceipt`
- `buildV3RunnerFailureError`
- `resolveNoGameWitnessSeedPrompt`
- `classifyNoGameWitnessSeedProbeFailure`
- `findNoGameWitnessSeed`
- `runV3NativeNoGameWitness`
- `runV3CompiledSeatWitness`

The runner diff is semantic, not a copy operation. `writeJsonAtomic`, the decision resolver, and both fixture-run functions have changed bodies. Preserve current-main behavior while transplanting accepted gate/diagnostic deltas.

### Native game driver

| Revision | Blob | Size |
|---|---|---:|
| Current main | `5de6326c9e5bbff0a497f613c77cab55b8bfaa5e` | 41,423 chars |
| PR head | `d5b0b63e4990fa318f03c8e3538ec002c296c587` | 53,118 chars |

A top-level comparison found 21 common functions; two common bodies differ:
- `validateInputs` (approximately 30.8 KB → 37.9 KB)
- `runNativeFixtureGameAsync`

Branch-only helpers:
- `createStoreStateSnapshotter`
- `createValidationRandomScope`

The branch adds actor-scoped `actionFrontier` and cloned-Store `validationReceipt` capture. Current main's `validateInputs` is a large existing legality-validation function; merge the Store-snapshot, validation-random-scope, and frontier changes without discarding main-only validation behavior.

### Full-state helper

`simulation/twinleaf/2026-11/agent43-full-state-diagnostic.cjs` is already present and byte-identical on main and PR branch:
- Blob: `d937777c92209f96d7497c5789e1e83f9b291581`
- Size: 17,088 chars

No helper transplant is needed. Keep using this existing V3 capture; do not add Agent45's separate recorder.

### Workflow

Only `.github/workflows/agent36-bilateral-competence-v9.yml` differs among workflow files.

Current main has a pre-fixture step, **“Validate owner-controlled V3 diagnostic recipient key before native fixture,”** which fails if `vars.AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` is absent.

PR #58 replaces it with **“Select encrypted or sanitized-only V3 diagnostic mode.”** When the variable is absent, the branch deliberately selects `sanitized-only` and continues. This conflicts with the owner's mandatory encrypted-full first-trace requirement. Preserve fail-closed behavior for the registered `agent36_v3_fixture_game` mode after acceptance; no-game witness does not need the key. If the key is absent or invalid, the registered fixture must be owner-blocked rather than run sanitized-only.

## Integration order

1. Do not alter PR #58 before its exact-94f contract-only gate and same-SHA native no-game witness.
2. Once accepted, use current `main` as the base. Do not merge/rebase the stale branch wholesale.
3. Transplant only accepted V3 worker, game-driver, test, and workflow deltas. Preserve current-main legality validation, workflow behavior, and all main-only results, communications, and identity state.
4. Add the owner-required post-acceptance trace instrumentation (actor frontier, validation receipt, versioned actor-only `policyAudit`) and mandatory encrypted-full fixture preflight. Keep the registered decks, policy behavior, seed, and seat assignments fixed.
5. Run exact-SHA contract-only → compile/no-fixture → both-role/both-seat native no-game gates on the integrated SHA.
6. Only after those pass and the owner public key is configured may Agent6 run the registered encrypted-full natural-terminal trace.

## Limitations

This is a structural source comparison, not a semantic proof that every changed function is correct. It does not authorize merging any individual function. Agent49 remains the canonical implementation and dispatch owner; Agent6 provides this map and owns the first trace only after the gates pass.
