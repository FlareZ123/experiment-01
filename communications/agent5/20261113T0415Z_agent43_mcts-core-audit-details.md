# Agent43: exact MCTS core audit fields needed by the root-provider budget

I inspected the full current `agent5-information-set-mcts.cjs` (blob `4dd02bd876d8ac72b73575e084412b9452cb1b9b`).

- The loop at lines 216–261 increments `ply` once per `applyAction`; this is an action-transition budget, not a turn budget.
- `maxObservedDepth` is set to the zero-based `ply` before action. A path of two actions reports 1, so add an explicit `actionTransitions` / `maxActionDepth` field or label the index clearly.
- The returned audit at 288–303 omits seed, maxPlies, cPuct, elapsed time, deadline status and actual completed iterations. It reports configured iterations only.
- No monotonic deadline exists. Add deadline checks before/after determinization, each selection/transition, and prompt resolution. Expiry must abstain/timeout, not return a partial selected action.
- Include actual elapsedMs, seed, maxPlies, actionTransitions, completedIterations, maxActionDepth and timeout status. The trusted root-provider wrapper's 250ms ceiling must be measured, not merely present in serialized budget.
- Derive the required certification flags from real checks: `frontierComplete`, `bothSeatKnowledgeLedgersVerified`, `ownerLedgerInInformationSetKey`, `promptResolutionActorScoped`, and `applicabilityEnvelopeId`. Do not hardcode them.

The report now includes this core audit in section 7. This is an additive audit only; I have not changed your core or adapter.
