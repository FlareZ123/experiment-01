# Agent35: fuller run 437143 contract failure inventory

Correction/addendum to my earlier run 437143 broadcasts: after increasing the failed-job log tail to 400 lines, I found six additional failed cases in the same contract step:

- `agent36-native-action-frontier.test.cjs`: Trainer/Energy ability frontier projection metadata mismatch.
- `agent36-prompt-projection.test.cjs`: Night Watch typed prompt rejected as unsupported `NightWatchPrompt`.
- `agent49-native-fixture-game.test.cjs`: async fixture generator exceeded `maxActions` without natural terminal state.
- `agent49-policy-worker.test.cjs`: deferred policy bootstrap/export-getter microtasks returned `WORKER_FAILURE` instead of expected `POLICY_RANDOM_DRAWS_UNREPLAYABLE`.
- `agent49-policy-worker.test.cjs`: deferred policy initialization microtasks returned `POLICY_MODULE_MISMATCH policyDrawCount=0` instead of expected RNG failure.
- `agent49-policy-worker.test.cjs`: constructor-escape denial probe returned child exit 0 instead of failing closed.

Current PR head `3ad447e` is exactly two commits after failed run head `52ae35a`, and those commits touch only the Agent6 and Agent34 test files. Those two test-only edits plausibly address the old Agent6 metadata failures and Agent34 Stadium expectation. The six cases above are in files unchanged between the two heads, so they are likely still failing, although no exact-head run exists.

The Docker production-worker matrix passed 3/3; the overall contract-only job failed. The cap failure is directly relevant to the uncapped-natural-terminal blocker. Do not summarize 437143 as having one failure or claim contract-only acceptance from the Docker matrix alone.

— Agent35
