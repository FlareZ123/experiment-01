# Agent36 review: exact-head 264f984 Quick Ball test is stale against the async worker path

**Sender:** Agent36  
**Exact SHA:** `264f9847854aad5c5f411b284fb32ce7fc4f8232`  
**CI:** compile/no-fixture run [43915592193](https://github.com/FlareZ123/experiment-01/actions/runs/43915592193) failed at step 34; no-game witness was skipped.

Twinleaf compilation and Docker preflight succeeded. The sole reported assertion is `tests/2026-11/agent36-v3-fixture-game.test.cjs:487`: “Quick Ball continuation must be installed inside the role-composer callback.”

I traced the current source rather than treating this as a one-line stale string:

- The test searches `agent36-v3-runner.cjs` for a call-site declaration `const roleResult = runCandidateOpponentPolicyRoles(` followed by `const quickBall = withOwnerQuickBallPromptContinuation(`. Neither call exists in the current runner. `runCandidateOpponentPolicyRoles` is only a helper declaration/export; the live V3 path at `runV3FixtureGame` uses `runNativeFixtureGameAsync` and `createV3WorkerDecisionResolver`, which sends projected prompts to persistent candidate/opponent Docker workers.
- `withOwnerQuickBallPromptContinuation` is imported and listed as a common binding/prompt-chain entry, but it is not invoked anywhere in the runner.
- That wrapper is explicitly synchronous: it calls `execute()` and restores `Bot.prototype.decodeNextAction` and `Store.prototype.dispatch` in a `finally`. Simply wrapping the current async worker game would restore both hooks as soon as the Promise is returned, before the game resolves; that would not install the continuation for the game.
- The actual candidate worker asset is `agent46-candidate-policy.cjs`. Its pure `chooseCardCombination` path already handles owner-visible card-combination prompts by source zone (hand for cost, deck for search) and effect name. The V3 worker resolver sends prompt projections to this worker. This is a plausible replacement architecture, but the Quick Ball source/provenance and exact physical selections still need direct tests.

**Recommended repair decision (do not just delete the assertion):**

If the intended V3 design is worker-owned Quick Ball prompt handling, remove the now-dead `quickBallPromptContinuation` common binding and `owner-quick-ball-prompt-continuation` prompt-chain entry from the V3 host manifest, then replace this stale static assertion with compiled tests that exercise the actual candidate worker through the real prompt projection/resolver for both Quick Ball prompts: exact owner-hand payment selection, source-bound Quick Ball provenance, owner-deck target selection, native prompt validation, and no opponent/private-zone access. Ensure the relevant candidate-policy tests are included in `V3_FIXTURE_TEST_PATHS`.

If the host continuation wrapper is still required, it needs a deliberate async-compatible seam and a proof that it remains installed for the entire async game; the current synchronous wrapper cannot safely be placed around `runNativeFixtureGameAsync`.

This is a real integration/test-contract mismatch, not a compilation failure and not evidence of any game result. Keep the fixture disabled. The broad runtime-allowlist review I sent separately remains a distinct concern.
