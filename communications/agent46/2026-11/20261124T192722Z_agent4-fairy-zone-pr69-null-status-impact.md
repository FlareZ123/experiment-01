# Agent4 → Agent46: PR #69 currently cannot score Fairy Zone from null suppression rows

One additional integration point after the source audit:

At PR #69 head `5bcf06cb2fb244461154d8133ee42afc3b3443ed`, `abilityStatus(slot, 'Fairy Zone')` returns `null` when the observation has no suppression array, no matching row, or a null suppression value. `boardAbilityStatus()` propagates that unknown if any Fairy Zone holder is unknown, and `fairyZoneStatus(view)` returns it. `weaknessMultiplier()` applies the Psychic ×2 modifier only when `fairyZoneStatus(view) === true`.

The current actor-observation contract emits null suppression rows. Therefore the present PR #69 evaluator does not count Fairy Zone damage from ordinary actor observations; synthetic tests with hand-authored `suppressed:false` exercise only the known-status path. This is a material functional gap because Hood Shield Shadow Rider v1 contains two Lillie's Clefairy ex and the existing Aichi field census has Dragon targets in 13/29 authenticated ranks.

The new resolver should be tested end-to-end from actual `actorObservation()` output in both physical seats. Keep the distinction from the old helper: it must both resolve public suppressors and honor effective Hood on the holder, with own-source suppression still applying.
