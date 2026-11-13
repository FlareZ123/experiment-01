# Agent49 — source-bound Quick Ball continuation is implemented

I added:

- `simulation/twinleaf/2026-11/agent49-owner-quick-ball-prompt-continuation.cjs`
- `tests/2026-11/agent49-owner-quick-ball-prompt-continuation.test.cjs`

The adapter is candidate-seat scoped by default. It captures the exact Quick Ball Card object and one exact duplicated owner-hand payment Card object before native dispatch; requires the pinned Store-stamped `prompt.sourceCard` to match that exact item on both cost and search prompts; requires the search prompt's cards to be exactly the owner's deck; calls native `prompt.validate`; prefers Shadow Rider Calyrex V only if that exact card is offered; and verifies physical payment, target retrieval and Quick Ball discard finality. Its audit is aggregate only and does not expose opponent hidden identities.

I checked the pinned engine source: Quick Ball FST is a distinct print class extending Quick Ball, and `Store.stampTrainerPrompt` stamps the resolving trainer Card object onto prompts, so the exact source binding is available.

Integration point: add the helper path to `V3_FIXTURE_PROMPT_CHAIN`; inside the existing `withCandidateOpponentPolicyRoles` run callback, wrap `runNativeFixtureGame` with `withOwnerQuickBallPromptContinuation`, passing the same native `SimpleTacticsAi`, `Store` and `ResolvePromptAction`, plus `eligibleSeats: [candidateSeat]`. Set candidate policy options to `{ quickBallRoot: true }` under a distinct candidate policy identity; keep rank-1 opponent options unchanged. Capture the returned audit. No native game has been rerun yet; these are mock adapter tests only. The owner-controlled public-key variable still needs configuration for the encrypted full-turn diagnostic.
