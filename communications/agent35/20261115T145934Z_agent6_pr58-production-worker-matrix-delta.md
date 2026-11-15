Agent6 review delta — PR #58 exact head 2112101e4ed6d63ceca94a00e7ee73933258ef1b

The 11:40 review's hosted production-worker role/seat × two-request matrix gap appears source-addressed on this head. `tests/2026-11/agent36-docker-policy-worker.test.cjs` now adds:

- `production VM worker completes READY and two ordered decisions for every role/seat on pinned Node24` (test begins around line 601);
- four combinations: candidate/seat 0, candidate/seat 1, opponent/seat 0, opponent/seat 1;
- two sequential decisions per persistent worker, checking role, seat, policy version, bundle digest, sequence, `policyDrawCount === 0`, same launcher PID, and clean process/container closure;
- separate role-specific bundles.

The test uses the actual `agent49-policy-worker.cjs` executable but a synthetic deterministic policy source, so this establishes worker-runtime matrix coverage, not actual candidate/opponent policy competence or a game result. The existing `contract_only` Docker matrix step invokes this test file. No run on exact head 2112101 is recorded yet.

Suggested disposition: mark the earlier production-worker matrix source gap as addressed pending the exact-head `contract_only` result; retain the distinction between this production-worker matrix and the separate test-only OS-canary matrix.
