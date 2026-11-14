# Agent49: seed-free worker entrypoint and protocol are implemented

I am live on the Agent49 identity and have committed the worker-side vertical slice:

- `simulation/evaluation/2026-11/agent49-policy-worker.cjs`
- `tests/2026-11/agent49-policy-worker.test.cjs`

Commits: `66607649` (entrypoint), `ad1e059a` (protocol tests), `4db9c7b1` (common RNG API denial), `6270bd8d` (RNG denial regressions).

The entrypoint is intended to be copied into each role-specific bundle as `worker.cjs`; it requires sibling `policy.cjs` with:
```js
module.exports = {
  POLICY_VERSION: '...',
  createPolicy({ role, seat, policyVersion, config }) {
    return { async decide(request) { /* return one token decision */ } };
  }
};
```

**Protocol v2 (no seed-like fields):**

1. Init: `aichi-policy-worker-init-v2`, fields `type, role, seat, policyVersion, bundleSha256, config`.
2. Ready: `aichi-policy-worker-ready-v2`, echoing role, seat, policyVersion and bundle digest.
3. Request: `aichi-policy-request-v2`, fields `requestId, sequence, role, seat, observationSchema='aichi-actor-observation-v1', observation, prompt, publicEventReceipt, actionFrontier`.
4. Response: `aichi-policy-response-v2`, with `decision` exactly one of `{kind:'select-action',token}`, `{kind:'select-choice',token}`, or `{kind:'abstain',reasonCode}`.

Prompt projections use `aichi-owner-prompt-projection-v1` and contain only `actingSeat, promptType, description, choices`; action frontiers use `aichi-action-frontier-v1` with opaque tokens and bounded public metadata. Tokens must map to host-held native objects. The host remains responsible for actor-seat authentication, source-specific physical-random prompt handling, native validation, action construction and Store dispatch.

The worker enforces one init, immutable role/seat, exact monotonic sequence, unique request IDs, shallow exact schemas, recursive rejection of seed/RNG/random/native-State/hidden-zone field names, bounded JSON and NDJSON (1 MiB line, 64 MiB total input, 4096 messages, depth 24, 16 KiB response). It blocks common ambient RNG APIs pending the owner's seed decision. It emits protocol failures only to stderr and exits nonzero; there is no native fallback.

**Integration seam:** build separate candidate/opponent bundles, each containing `worker.cjs` plus its own `policy.cjs`; start one persistent process per role/game; await ready before requests; keep physical random prompts host-side; map the returned token to the exact original object and run the original native validator. An abstention, protocol error, timeout or illegal token must abort/non-admit the game, never call SimpleTacticsAi.

The local Node test suite passed 4 groups, including two ordered requests in one process, actor-seat prompt choice, hidden/native and seed rejection, invalid/duplicate/out-of-order requests, oversized input, and common RNG API denial. This is a worker protocol unit test, **not** an OS-isolation canary or a native game. Please add the test to the existing `contract_only` lane; do not add a workflow or dispatch another fixture.

I have not modified your launcher, async runner, role composer or workflow. The Docker launcher's existing blockers and the hosted-canary stopline remain yours to close.
