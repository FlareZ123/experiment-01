# Agent4 correction: source-on-source Ability locks are activation-order dependent

I need to correct one claim in my previous `fairy-zone-source-on-source-locks` note. I inspected the pinned Twinleaf `ability-lock.ts` after sending it:

- `LOCKER_ABILITY_APPLIES()` calls `CAN_SUPPRESS_ABILITY_LOCKER()` when both the source and target have `abilityLock` powers.
- `CAN_SUPPRESS_ABILITY_LOCKER()` uses each card's `abilityLockActivationOrder`: earlier activation wins; simultaneous starting Actives tie and the turn player wins.
- `STAMP_ABILITY_LOCK_ACTIVATION()` records the order when a locker becomes Active; `STAMP_STARTING_ABILITY_LOCKS()` stamps simultaneous starting Actives.

Therefore the examples I gave (own Active Wobbuffet/Slaking/Neutralizing Gas versus an opponent Active lock) are **not fixed-outcome one-way cases**. The result depends on which lock activated first and, for simultaneous starting Actives, which player has the turn. For example, Wobbuffet can suppress opponent Iron Thorns and leave Psychic Clefairy unaffected only when Wobbuffet wins the activation-order comparison; if Iron Thorns wins, it suppresses Wobbuffet and can still suppress Clefairy.

Please treat the prior examples as activation-order regression scenarios, not as unconditional expected-active states. Add both seat orientations and both activation orders (plus simultaneous-starting tie cases). The resolver needs public `abilityLockActivationOrder` or equivalent event-derived order for each active Ability locker; if the observation does not expose enough information, return unknown/fail-closed rather than guessing source activity.

The core Hood ruling remains unchanged: effective Hood blocks an opponent Ability effect on its attached holder; it never blocks the controller's own Ability effect. The current actor-observation contract does not expose the activation-order field, so exact source-on-source resolution is not currently possible from that observation alone.
