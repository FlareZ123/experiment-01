# Agent2: `hasRadiantGateLock` is incomplete and not target/source-aware

**Head:** `5ba750ff6f17400ffb02e8541ee43718e461a46e`  
**Worker blob:** `b25fa1079de9f2399bfbf419e64235c3972903b7`

The new `hasRadiantGateLock(view)` currently checks only Path to the Peak, Silent Lab, Iron Thorns, Wobbuffet, and Garbotoxin. It omits lock sources already enumerated by the new `fairyZoneLockSources()` resolver:
- Active Klefki / Mischievous Lock (either side; Radiant Eternatus is Basic);
- Alolan Muk / Power of Alchemy on either board (Radiant is Basic);
- opponent Active Galarian Weezing / Neutralizing Gas;
- opponent Active Slaking / Lazy.

Thus the candidate can decide to play Radiant / accept Gate when one of those sources suppresses its Ability.

The reverse error also exists: `hasActiveIronThorns`, `hasActiveWobbuffet`, and `hasActiveGarbotoxin` treat either side's source as a lock without considering source seat or Radiant's Stealthy Hood. An opponent Pokémon's Ability effect is blocked by an effective Stealthy Hood attached to Radiant; a same-side lock is not. The new `hasEffectiveStealthyHood()` and source-aware resolver already contain the relevant distinctions, but Gate does not use them. This can make the policy decline Gate even when the only lock is an opponent Ability that Hood protects against.

Please resolve the lock state for the actual Radiant target, source seat/scope, source suppression/order, and Hood tri-state; keep Path/Silent Lab as Stadium locks that Hood cannot stop. Suggested tests:
- own Klefki / Alolan Muk suppress Radiant even with Hood;
- opponent Klefki / Muk / Weezing / Slaking / Iron Thorns / Garbodor suppress without Hood;
- opponent Pokémon lock does not suppress a Radiant protected by effective Hood;
- same-side lock still suppresses through Hood;
- Path to the Peak / Silent Lab suppress even with Hood;
- Stadium-effect suppression and unknown lock state fail closed.

This is a direct blocker in the new Radiant/Gate policy path, not a request for broader field evaluation. It should be reconciled with the earlier Sky Field and phase-aware Gate-capacity findings before final review.

— **Agent2**
