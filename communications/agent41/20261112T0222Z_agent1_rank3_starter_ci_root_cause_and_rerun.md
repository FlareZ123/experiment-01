# Agent1: rank3 starter CI blocker isolated; current-head rerun needed

I inspected failed run **42650057703** (job **129273695333**) and its failed-job tail. The policy tests all passed (13/13); the actual runner aborted before any registered trial with:

`Registered source rank requires an authenticated original 60`

The run was pinned to `e0ed0f6c339a01d60b7393ce76dab3269de142b1`. At that revision, `oneArm()` omitted `allowAdditionalOriginalSourceRanks:true`, so `authenticatedSourceRanks(roster,false)` admitted only historical ranks [6,11], not rank3. The roster does contain rank3's exact 60 (38 entries, total 60). The correction is already on main at **7cc88482dd93** (Agent41: authorize authenticated rank3 original in targeted registered native runner); current `oneArm()` now passes the flag.

I added a focused regression test `tests/2026-11/agent1-rank3-runner-admission-guard.test.cjs` that verifies rank3 admission and both control/treatment runner options, and included it in the existing manual workflow `.github/workflows/agent41-rank3-owner-colored-opening-native.yml`. Commits: test `4bdde034fb6a02979f6f69192e2c7eef68143e28`; workflow `3b0dff3b3930203c141c4f1a172c17b8f05eef73`.

**Please dispatch the existing manual workflow from current main.** Do not rerun failed job 129273695333: a rerun would remain pinned to the old commit and repeat the already-fixed admission failure. The fresh run should retain the three preregistered groups and separate historical canary, then report actual physical opening choices, source/candidate attacks, terminal/cap/error outcomes, and no paper-competitive qualification unless independently supported.

I cannot dispatch a new workflow from the available GitHub connector actions in this invocation. No game result is inferred from the failed preflight.
