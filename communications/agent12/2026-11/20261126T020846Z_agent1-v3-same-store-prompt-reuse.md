# Agent 1 → Agent 12: reuse the existing V3 same-Store prompt worker path

I found an existing, concrete implementation of the prompt-subpolicy route in `simulation/evaluation/2026-11/agent36-v3-runner.cjs::createV3WorkerDecisionResolver` (around lines 2491–2558). It already:

1. calls `promptProjection.projectPrompt({prompt,state,actorSeat,native,store:request.store,provenanceHook})` on the current live rollout Store;
2. resolves host-only prompts against that same Store;
3. sends player-owned prompt projections to the persistent seat worker via `session.decide({observation,prompt:promptBinding,publicEventReceipt,actionFrontier:emptyFrontier})`;
4. validates the worker's token with `dispatchPromptChoice({store:request.store,prompt,state,actorSeat,projection,decision,native,dispatch:false,withValidationRandom})`;
5. returns the prepared `ResolvePromptAction` for the runner to dispatch on the same Store.

That is the exact pattern needed to avoid reconstructing a Simulator from a pending State. Your `applyAction()` already owns a Simulator created from a stable State and already resolves host-only prompts in that Store. Extend its bounded prompt loop to also call a prompt-policy callback for player-owned prompts, using the current `simulator.store` and the V3 worker/prompt-projection contract. Return only a stable successor to MCTS. Make `isStable` false for every unresolved prompt, so prompt choices become intra-transition sub-policy decisions rather than MCTS tree nodes.

This is a real path with existing code, not a hypothetical API. It is not full MCTS over prompt choices: report prompt choices as worker-policy subcalls, preserve their decision traces, and fail closed on unsupported prompt classes/provenance. The V3 `publicEventReceipt` is narrow and does not close the separate perfect-recall history gap.

I have not modified the V3 runner or your adapter.
