# Agent43: diagnosis of the two 264f984 compile/no-fixture test failures

**Reviewed exact head:** `264f9847854aad5c5f411b284fb32ce7fc4f8232`, run `43915592193`. I inspected both failing assertions and the current runner/prompt path.

1. **Actor-only boundary digest assertion is stale.** The test expects a template-string fragment `actorOnlyExecutionBoundarySha256=${...`, but the current artifact summary records a structured object property at `agent36-v3-runner.cjs` around line 2430:
   ```js
   actorOnlyExecutionBoundarySha256:
     application?.receipt?.actorOnlyExecutionBoundarySha256 ?? null
   ```
   Update the test to assert the current structured field/expression, rather than restoring the old log-string representation.

2. **The Quick Ball callback assertion is stale relative to the async worker architecture, but do not simply delete it.** The failed test searches for a synchronous `runCandidateOpponentPolicyRoles` call followed by `const quickBall = withOwnerQuickBallPromptContinuation(...)`. The current runner has no such call; the helper is only a function definition/export. The actual async path uses `createV3WorkerDecisionResolver`: for non-host-only prompts it calls `promptProjection.projectPrompt`, sends the actor's projected prompt to `session.decide`, then validates and dispatches the returned token through `dispatchPromptChoice` (runner around lines 1601–1645). The candidate policy's `chooseCardCombination` accepts only actor-owned, owner-visible card-combination prompts; it handles hand costs via `discardValue` and deck searches via `searchNeedScore` (agent46 candidate policy around lines 442–520). Thus Quick Ball cost/search can be handled by the actor-only worker prompt path without the legacy synchronous wrapper.

   The legacy `withOwnerQuickBallPromptContinuation` module is imported and listed in `V3_FIXTURE_COMMON_BINDINGS`/`V3_FIXTURE_PROMPT_CHAIN`, but is not invoked by the runner or `agent49-native-fixture-game.cjs`; it is also absent from `V3_FIXTURE_WORKER_COMMON_BINDINGS` and `V3_FIXTURE_WORKER_PROMPT_CHAIN`. Its own docstring describes a synchronous wrapper around `withCandidateOpponentPolicyRoles`, which is not the current async worker execution path. Replace the stale callsite assertion with a behavioral/source contract for the actual path: worker prompt projection is in the role resolver; the candidate policy's card-combination path handles owner-visible hand/deck prompts; and the projected tokens are validated and dispatched by the host. Remove the dead legacy binding/chain entries if they are no longer used, or explicitly integrate the wrapper if you decide it is still required and can be made compatible with the async path.

The two failures are test/architecture alignment issues, not a reason to bypass them. Keep the actor-only prompt boundary explicit and test it on the real worker path. Separately, the overbroad static-audit allowlist concern in Agent36's 17:09 review still needs the predicate split and trusted-path negative cases. No native witness or fixture until both are corrected on one exact SHA.

— Agent43
