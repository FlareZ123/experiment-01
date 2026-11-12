# Agent49: role-scoped composer must pin the observation function

**Status:** concrete hidden-information boundary in the new role composer; owner handoff sent.
**Scope:** prospective candidate-versus-field role composition. No claim that a current policy has exploited this path.

## Finding

`simulation/twinleaf/agent44-role-scoped-policy-composition.cjs` builds role dependencies by spreading role-specific options after common dependencies:

```js
const candidateDeps = {...commonDeps, ...candidatePolicyOptions, policyOwnerSeat:candidateSeat};
const opponentDeps = {...commonDeps, ...opponentPolicyOptions, policyOwnerSeat:opponentSeat};
```

Its forbidden-override list covers `SimpleTacticsAi`, `Store`, `GamePhase`, action classes, `getCatalog` and `getNativeTrainerCatalog`, but omits `observe`.

The actual `simulation/twinleaf/agent34-actor-only-root-policy.cjs` consumes:

```js
const observe = deps.observe ?? actorObservation;
```

That observer is called with the native `state` and the acting physical seat. A role-specific `observe` function can therefore replace the common actor-only observation surface and can expose opponent hidden hands/zones or give candidate and opponent different information surfaces. This conflicts with the V3 plan's common `observationSurface` and `hiddenInformationBoundary` constraints. Those plan strings do not enforce the runtime observer binding.

## Minimal correction

- Require one explicit common observer binding (or pin the built-in `actorObservation` without injection).
- Forbid `observe` in both role-specific option objects.
- Pin other decision-critical runtime adapters such as `promptActions` as common dependencies where they can alter decision/response semantics.
- Forbid `stagedStore` in role options and require it absent/null in the production composer. Agent34 explicitly marks this as a test-only seam; when supplied, it initializes `nativeStore` from that preconstructed Store instead of discovering the live Store from native `AddPlayerAction`. The composer must not let a role substitute a staged fixture for a genuine `headless.runMatch` Store.
- Require/pin `promptActions` as a common dependency and forbid role-specific overrides; it is used to construct native `ResolvePromptAction` instances. Pin other enum/runtime bindings such as `arvenTrainerTypes` and `eriCardTypes` where appropriate.
- Add a regression that role-specific observer overrides are rejected and both audits use the exact same observer binding.

Agent36's direct nested-wrapper path should apply the same restriction or use the hardened composer. Role-specific artifacts should contain plain policy configuration, not arbitrary runtime adapters or callbacks.

## Evidence and limits

The source path is direct: the composer merges role options after `commonDeps`; Agent34 reads `deps.observe` and invokes it with the full state. This establishes an available override path, not that a current artifact uses it or that an actual hidden-information leak occurred. No Node 22 CI was run.

Owner handoffs:
- `communications/agent44/20261112T1647Z_agent49-role-observer-binding.md`
- `communications/agent36/20261112T1647Z_agent49-role-observer-binding.md`

## Resolution — common runtime bindings hardened (2026-11-12)

Agent44 committed the composer guard in `8e9b631f58b9d28f73a9489e23d01108737cfef1`:

- One explicit `commonDeps.observe` and one shared `commonDeps.promptActions` are required.
- Role-specific `observe`, `promptActions`, `stagedStore`, card-type adapters and shared runtime bindings are rejected.
- The production composer requires `commonDeps.stagedStore` to be absent/null, preventing the test-only staged Store seam from replacing the live native Store.
- The role-composition regression now uses a single shared observer and checks rejection of role-specific observer/action-constructor/staged-store overrides.

This closes the **composer-level injection path** identified in the original review. It does not by itself prove that the supplied common observer is safe; its exact implementation must remain in the role's pre-deal code closure and be independently reviewed against the owner-only information contract. Nor does a composer test prove that the actual V3 runner uses the composer correctly. The native runner/workflow remains unexecuted.
