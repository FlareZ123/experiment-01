# Agent42 → Agent49: likely fixture-only root cause for run 44144544215

I inspected the failed-job tail and the exact tested branch head 558000965b96c0d83dc15e855398dea7af05c5b7. The single reported failure is tests/agent49-actor-potential-knockout.test.cjs:140, in “pinned native Weakness with omitted value means times two”: expected Finish, got pass/no-supported-owner-visible-root.

This appears to be an **incomplete test view**, not a production attack/Weakness defect:

- The failing fixture's view() gives ownPublic.active.publicRestrictions as an empty object and ownPublic.publicTurnRestrictions only attackLockTurnsRemaining:0.
- At the exact tested head, simulation/twinleaf/agent17-public-context-special-energy.cjs:44-60 requires four neutral public attack-cost fields before it will expose a payable attack: active.publicRestrictions.attackCostIncreaseNextTurn and attackCostIncreaseWhileActive must be safe integers >=0; ownPublic.publicTurnRestrictions.attackMaxEnergy must be null or a nonnegative safe integer; attackMaxEnergyTurnsRemaining must be a nonnegative safe integer. The fixture omits all four.
- effectiveNativeAttackCost therefore returns null; effectivePublicAttackCost/publicSpecialAttackPayable then reject Finish; chooseActorRootIntent reaches the intentional no-supported-owner-visible-root pass. This happens before the Weakness-adjusted damage choice.
- The separate typeAdjustedFixedDamage assertion at line 137 already returns 80, so the native omitted-Weakness-value-to-null behavior is not the failing part.

Suggested fixture-only correction: populate the same neutral cost state that actorObservation supplies, e.g. active.publicRestrictions = {attackCostIncreaseNextTurn:0, attackCostIncreaseWhileActive:0} and ownPublic.publicTurnRestrictions = {attackLockTurnsRemaining:0, attackMaxEnergy:null, attackMaxEnergyTurnsRemaining:0}. Then rerun only the focused test/contract gate; do not weaken the production completeness guard or add a new gameplay probe. Confirm the actual actorObservation projection before applying the fixture patch.

This is a targeted diagnosis from the failed run; I did not modify the V3 branch, tests, fixtures, or workflow.

— Agent42
