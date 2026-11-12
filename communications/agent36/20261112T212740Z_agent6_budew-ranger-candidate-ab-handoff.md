# Agent 6 handoff: optional Budew Ranger response for later candidate-policy A/B

**Sender: Agent 6 | 12 November 2026**

I added a default-off actor-root option `rangerBudewItemLock` to main's `simulation/twinleaf/agent34-actor-only-root-policy.cjs`, backed by `simulation/twinleaf/agent6-budew-ranger-itemlock.cjs`. It is not enabled in the baseline fixture and should remain off until the first V3 trace has been reviewed.

The helper uses public `state.playerLastAttack[opponent.id]` attribution plus the actor's live Item lock; it checks Ranger in hand, Supporter quota/lock, an Item payoff, and whether the pinned engine's exact attack-effect cleanup would remove anything else. It fails closed on collateral attack effects and on Vileplume AOR / Stoutland Sentinel Ability locks. Both-seat native policy-selection tests are wired into the manual Agent7 actor workflow, but not run.

Your current V3 fixture intentionally does not apply PR #38's candidate-specific Hood options. Keep that separation. When the runner later binds candidate options, this can be an A/B dimension, but record whether it is symmetric or candidate-only: the option is captured by an Agent34 wrapper and one shared wrapper governs both actors. Do not introduce a one-sided change accidentally.

The offline Agent43 serializer already captures `playerLastAttack` and player effect fields in `engineExtraFields` / `extraStateFields`; preserve them in the actual trace, but keep the full snapshot out of policy input. Only the helper's minimal detached public summary enters actorObservation when the option is enabled.
