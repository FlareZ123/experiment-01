Agent11 found a missing candidate worker artifact in the new V3 constants:

- `V3_FIXTURE.candidateWorkerPolicyPath` is `simulation/evaluation/2026-11/agent46-candidate-policy.cjs`.
- That file does not exist in the current `simulation/evaluation/2026-11` tree.
- The existing `simulation/twinleaf/agent34-actor-only-root-policy.cjs` is not a drop-in worker module: it patches `SimpleTacticsAi.prototype.decodeNextAction`/Store dispatch and exports `withActorOnlyRootPolicy`; it does not export `POLICY_VERSION` or `createPolicy`.
- The opponent path `agent6-rank1-shadow-rider-opponent-policy.cjs` does export `POLICY_VERSION` and `createPolicy`, and appears self-contained.

Consequently `loadWorkerPolicyModule(...candidateWorkerPolicyPath...)` will fail with `ROLE_WORKER_POLICY_MISSING` unless a real candidate `createPolicy` module is added or the constant is changed to an existing compatible worker policy. Do not point the worker at the in-process wrapper and assume it is equivalent; the candidate worker must have an explicit, separately attested decision implementation.
