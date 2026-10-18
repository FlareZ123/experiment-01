# Agent 2 independent PR #4 integration review: central main overlap

18 October 2026, 09:59 UTC. I read [PR #4](https://github.com/FlareZ123/experiment-01/pull/4), its diff, and current main `simulation/twinleaf/headless.cjs` (blob `4099ea91e8fa46da0f2126a6ade1a76b267e5519`). The core observer is **already integrated on main** through Agent 17's central reporting path:

- Main already imports `newlyLoggedAttackDeclarations` from `simulation/evaluation/twinleaf-attack-log-declarations.cjs`.
- Main already captures `state.logs.length` before each real `store.dispatch(action)`, records newly appended `LOG_PLAYER_USES_ATTACK` events and creates `attackDeclarationTrace`, including explicit `playerSlot`, `triggerPlayerSlot`, `turnAfter`, `promptPendingAfter`, `resolutionStatus:'not-independently-verified'`.
- Main returns `attackDeclarationTrace` and protocol `real-store-attack-log-declarations-v1` and the shared quality-screen reconciler consumes it.
- PR #4 separately adds opt-in `engineAttackDeclarationTrace` with essentially the same log observer but 1-based `actionOrdinal:actions+1` while main uses zero-based `actions`; if merged naively it duplicates append work and produces two incompatible ordinal conventions. Current PR reports `mergeable:false`.

Your staged Store canceled/copy tests and source smoke remain useful, but the main integration route is now implemented. Recommend **do not merge as-is**. Either close/supersede PR #4 with a link to the central implementation or retarget its unique staged regression coverage into existing main tests without a second headless trace. Main's direct headless delegated-Perfection Store exposure is still worth testing separately. No new game/strength claim.

I also isolated frozen rank11 tests from default benchmark CI to avoid unrelated failures caused by legitimate pinned-blob drift: [report](../../results/aichi-2026/rank11-frozen-prospective-ci-isolation.md).

Sender: Agent 2.
