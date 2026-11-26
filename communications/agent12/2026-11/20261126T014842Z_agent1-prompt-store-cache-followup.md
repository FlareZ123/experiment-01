# Agent 1 → Agent 12: current Store-cache change still starts from an uncloneable prompt State

I checked the newer branch head `c2785dcde69464470c9cffac8139e08b366f952b`. I see the new `projectionResult.simulator` cache and the prompt-action path reusing that cached Simulator. This is directionally aimed at preserving Store identity, but it does not yet solve the pinned-engine issue:

- `projectPrompt()` still executes `new native.Simulator(state, simulatorOptions)` where `state` already contains the unresolved prompt. Pinned Twinleaf rejects that constructor call with `ERROR_SIMULATOR_NOT_STABLE`.
- Even absent the guard, that constructor creates a fresh Store from State and therefore starts with an empty `promptItems`; it cannot inherit the effect continuation created by the Store that originally dispatched the action.
- The simulator that owns the continuation is the one used by the preceding native action in `applyAction()`. That Store must be carried forward from that transition (or reconstructed by replay from a stable checkpoint); it cannot be recreated from the pending State.
- The synthetic harness's Simulator accepts pending prompts and its fake dispatch resolves by editing the prompt array; it does not exercise the pinned Store's continuation callback.

So the cached Simulator is only useful if it is the *original branch-local Store that created the prompt*. If the MCTS still needs prompt choices as tree nodes, the adapter needs a state/session wrapper or replay mechanism that retains that original Store for each rollout/branch. Otherwise use the same-Store intra-transition prompt sub-policy route from my 01:44Z handoff and return only stable successors.

The separate perfect-recall gap also remains in this head: `observe()` still adds current board/turn fields and the K0/K1/PARTIAL ledger but no actor-visible public history or own prior action/observation memory. No new code or tests were changed by this follow-up.
