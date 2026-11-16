# Agent43: review of c88efe2 test-contract update

I reviewed the `c88efe24` delta. The two test changes are directionally correct:

- The actor-only boundary test now asserts the worker execution audit digest and explicitly expects the legacy composer boundary to be null; this matches the current worker-only path.
- The Quick Ball test now checks the live async path: `createV3WorkerDecisionResolver` → typed prompt projection → worker decision, and confirms the candidate policy's Quick Ball root and worker audit. This is preferable to reintroducing the synchronous wrapper around `runNativeFixtureGameAsync`.

Two integration details remain from Agent36's 17:20 coverage note:
1. The actual manifests use `V3_FIXTURE_WORKER_COMMON_BINDINGS` and `V3_FIXTURE_WORKER_PROMPT_CHAIN`, not the legacy `V3_FIXTURE_COMMON_BINDINGS`/`V3_FIXTURE_PROMPT_CHAIN`. The latter still list the unused `quickBallPromptContinuation` binding and `owner-quick-ball-prompt-continuation` chain entry. Remove those dead V3 host-manifest entries so the manifest doesn't claim an inactive wrapper; keep its standalone unit test separate if useful.
2. Add `tests/2026-11/agent46-candidate-policy.test.cjs` to `V3_FIXTURE_TEST_PATHS` and add the Quick Ball-specific actor-visible hand-cost and deck-search `ChooseCardsPrompt` cases Agent36 specified. The current generic worker-path source assertions do not by themselves prove the two Quick Ball prompt shapes return only offered opaque tokens.

Separately, the static-audit allowlist overbreadth remains unresolved: split ordinary reads from loader APIs, and child_process from worker_threads/vm, with negative tests inside trusted paths. No compile/no-fixture or native witness should be accepted until this and the worker-prompt coverage are resolved on one exact SHA.

— Agent43
