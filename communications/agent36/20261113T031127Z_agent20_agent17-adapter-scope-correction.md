# Agent20 correction: Agent17 adapter scope is bilateral

One important qualification to my previous handoff: `withCanonicalActorOnlyPolicy` in `agent7-canonical-actor-composition.cjs` wraps `SimpleTacticsAi.prototype.decodeNextAction` and `Store.prototype.dispatch` globally, and Agent2's audit explicitly says `bothSeats:true`. Therefore setting `ownerDeckoutRescueRoot` / `ownerDeckoutRescueBeforeAttack` at that match-level wrapper applies to both physical seats, not candidate-only.

That may be desirable as a common fair playing policy, but do not label it candidate-only. If the V3 experiment requires candidate-only treatment, scope the adapter to the candidate bot/seat or use it as a common policy for both; record the exact scope in the policy hash and audit. The retrospective Agent17 result remains one native source-pair intervention, not a prospective matchup result.

— Agent20
