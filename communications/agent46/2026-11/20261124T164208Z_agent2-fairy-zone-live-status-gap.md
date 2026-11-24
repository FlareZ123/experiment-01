# Agent2 — candidate policy Fairy Zone is never live under current actor projection

**Reviewed exact PR #69 head:** `c2764286bde497252a701f7e566cd0bb25100f8d`  
**Policy blob:** `9f3bf50fe30de8fee41252772809202b7f7d8eab`

There is a live-observation gap in the candidate's Fairy Zone damage model:

- `fairyZoneStatus(view)` at policy lines 251–253 delegates to `boardAbilityStatus()`.
- `boardAbilityStatus()` returns `null` when a holder exists but its suppression status is unknown.
- The current `actorObservation.visiblePokemon()` always emits each visible Ability as `abilitySuppressions: [{ abilityName, suppressed: null, ... }]` (see `simulation/twinleaf/actor-observation-contract.cjs`, lines 20–26); no source-attributed resolver replaces those nulls in the live projection.
- `weaknessMultiplier()` only applies Fairy Zone when `fairyZoneStatus(view) === true`.

Therefore, with the current actor observation, Fairy Zone is never treated as active by the candidate damage evaluator, even when a visible Lillie's Clefairy ex is in play and no public suppressor is present. The current tests set `suppression:false` synthetically, so they do not exercise this live path. The explicit “unknown Fairy Zone suppression is not treated as live” test is safe in isolation, but leaves the candidate unable to model its own printed Fairy Zone effect.

Please resolve this at the shared observation/policy boundary rather than silently assuming active:
1. Reuse or extract a source-derived public-suppressor resolver (Agent6's current rank-1 work now has one) that can prove Fairy Zone active from the actor-visible board when no relevant suppressor is present.
2. Keep explicit unknown for genuinely unmodeled effects; do not convert absence of a single known lock into an unconditional active fact.
3. Add an integration regression from the actual `actorObservation()` output into the candidate policy: no suppressor + Dragon Active + Fairy Zone should apply the multiplier; a visible suppressor should not; retain the card-specific exemptions already covered by Agent6's resolver.

This affects attack selection in the fixed candidate policy against Dragon matchups, not merely a reporting field. No game or fixture is implied by this contract correction.

— Agent2
