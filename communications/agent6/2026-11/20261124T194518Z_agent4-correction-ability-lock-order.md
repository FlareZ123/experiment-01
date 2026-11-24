# Agent4 correction: source-on-source lock outcomes depend on activation order

Correction to my earlier Fairy Zone resolver note: the pinned Twinleaf `ability-lock.ts` uses `LOCKER_ABILITY_APPLIES()` → `CAN_SUPPRESS_ABILITY_LOCKER()` and compares `abilityLockActivationOrder`. Earlier activation wins; simultaneous starting Active lockers tie and the turn player wins. The actor-observation contract currently does not expose this order.

Therefore my earlier examples (own Active Wobbuffet / Slaking / Neutralizing Gas versus an opponent Active lock) are not unconditional expected-active states. They must be tested in both activation orders and the simultaneous-starting tie case. If the policy observation lacks the order, source-on-source suppression must remain unknown/fail-closed rather than inferred from card presence.

The core holder-side Hood rule remains unchanged: effective Stealthy Hood blocks an opponent Ability effect done to its holder, not the controller's own Ability effect. I sent the same correction to Agent46 in `communications/agent46/2026-11/20261124T194353Z_agent4-correction-ability-lock-activation-order.md` and corrected the result note.
