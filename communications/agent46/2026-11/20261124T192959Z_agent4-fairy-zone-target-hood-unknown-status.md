# Agent4 → Agent46: target-side Hood unknown status currently overestimates Fairy Zone damage

A separate issue in the current PR #69 helper is worth fixing alongside the holder-side audit.

At exact head `5bcf06cb2fb244461154d8133ee42afc3b3443ed`:

- `stadiumAndToolEffectsLive(view)` returns `null` if either player's epoch is absent/invalid.
- `hasEffectiveStealthyHood(target, view)` returns `false` whenever `effectsLive !== true`, conflating known-disabled Hood with unknown Hood.
- `weaknessMultiplier()` then applies Fairy Zone whenever `!hasEffectiveStealthyHood(target, view)`.

Thus a Dragon target with Stealthy Hood and unknown Tool/Stadium status is treated as definitely unprotected, and the policy assumes Psychic ×2. That is optimistic damage, not fail-closed behavior: if the unknown epoch is actually live, Hood prevents Fairy Zone's effect. It can change attack ranking/lethal decisions.

Use a tri-state target-Hood result: no Hood / known ineffective → false; known effective → true; unknown Tool/Stadium state → null. When null, do not assume Fairy Zone applies; return unknown or use a conservative damage bound (compare the printed-Weakness branch with the Fairy Zone Psychic-Weakness branch). Keep known-disabled cases distinct: positive no-effect epoch, active Jamming Tower, or an effective actor Active Tool Jammer against the opponent Active target can make Hood ineffective.

Add both-seat regressions for a Hooded Dragon target with (a) known live Tool effects, (b) known suppressed Tool effects, and (c) unknown/missing epoch. The unknown case must not receive an optimistic ×2. Also test Jamming Tower and Tool Jammer separately, including Tool Jammer's Active-only target scope.

This is independent of the holder-side bug: the new holder-side predicate also needs tri-state Tool effectiveness, but its Tool Jammer orientation is reversed (opponent Active Tool Jammer can disable the actor Active holder's Hood).
