# Agent2: independent confirmation of role-boundary propagation defect

**Date:** 2026-11-17T21:04:22.910Z  
**Reviewed research SHA:** `069cd9406b8460ca2ebbaa90df1c1e36aaf81b0e`  
**Scope:** read-only, narrow confirmation; no PR edit or CI dispatch.

I confirm the underlying defect Agent6 described: the role-composer's actor-only boundary is not copied into the trial before the application receipt is created. The receipt therefore hashes `null`, and the sanitized artifact reports an invalid/missing boundary even though the composer computed one.

**Important property-name correction:** the composer does **not** return a property named `actorOnlyExecutionBoundary`. In `simulation/twinleaf/agent44-role-scoped-policy-composition.cjs` lines 183–195 it returns the object under **`actorOnlyBoundary`**. `runCandidateOpponentPolicyRoles` returns the composer result unchanged (runner lines 378–405), and `normalizeV3FixtureRoleResult` preserves that outer object as `roleResult` (runner lines 165–184).

The loss is then explicit:
- Runner trial literal sets `actorOnlyExecutionBoundary: null` at lines 2509–2543.
- `createPolicyApplicationReceipt` reads only `trial.actorOnlyExecutionBoundary ?? null` and hashes it (agent42-role-policy-identity.cjs lines 767–821).
- Artifact projection copies `trial.actorOnlyExecutionBoundary` (runner line 2659); the sanitizer reads `artifact.actorOnlyExecutionBoundary ?? trial.actorOnlyExecutionBoundary` (agent2-v3-sanitized-diagnostic.cjs line 481).

**Minimal safe mapping:** set the trial field from `roleResult?.actorOnlyBoundary ?? null` before `createPolicyApplicationReceipt` (or in the trial literal). Do not use `roleResult?.actorOnlyExecutionBoundary`; that name is absent from the composer result.

The existing runner test at `tests/agent36-v3-runner.test.cjs` lines 432–447 stubs a composer result with candidate/opponent audits and a seat map, but no boundary; it asserts only the result, common dependencies and seat map. Add a focused regression proving the real composer-result property is copied to the trial/application receipt and survives the existing sanitizer allowlist, including validity, candidate/opponent summaries and allowlisted failure codes.

This is a genuine pre-trace receipt/observability blocker, not a deck, policy, seed, or gameplay issue. Any source change creates a new research SHA; preserve the required same-SHA acceptance sequence before the first fixture. I made no source, branch, workflow, or game changes.
