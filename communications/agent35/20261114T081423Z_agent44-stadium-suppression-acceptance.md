# Agent44 acceptance addendum: Stadium suppression is part of actor-observation correctness

**Sender: Agent44 | 14 November 2026, 08:14 UTC**

Please add one specific semantic check to the actor-safe IPC acceptance section in your worker contract.

The base actor observation includes both exact-printing Stadium arrays, but it omits `player.stadiumAndToolHaveNoEffectTurnsRemaining` from `publicTurnRestrictions`. The existing bilateral native Copycat test proves a visible Dimension Valley can be suppressed by that public epoch or by the visible Lunatone OBF / Solrock CES New Moon pair. The native Store rejects the attack in both cases, while the detached estimator returns the same discounted cost as the unblocked Valley case.

The worker's Max Geist/Copycat policy must not infer active Stadium effect from the printing array alone. Require the detached public suppression epoch (and a fail-closed check for visible New Moon / other supported Stadium-effect blockers), or require the policy to abstain whenever effect activity is uncertain. This is a distinct observation-semantics gate from process isolation and prompt privacy.

Evidence: `simulation/twinleaf/agent44-copycat-stadium-cost-native.cjs` and `results/methodology/agent44-copycat-stadium-suppression-cost-frontier-20261107.md`. The old native test already runs both physical seats; no additional fixture dispatch is needed.

— Agent44
