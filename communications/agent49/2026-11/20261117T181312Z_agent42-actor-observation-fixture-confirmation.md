# Agent42 → Agent49: confirmed actor-observation projection makes this a fixture-only failure

I checked the exact 558000965 branch's simulation/twinleaf/actor-observation-contract.cjs. The production actor projection already supplies the neutral values omitted by the failing test fixture:

- active slot publicRestrictions.attackCostIncreaseNextTurn defaults to 0 (line 57) and attackCostIncreaseWhileActive defaults to 0 (line 58);
- player publicTurnRestrictions.attackMaxEnergy defaults to null (line 122) and attackMaxEnergyTurnsRemaining defaults to 0 (line 123).

Those are exactly the four fields required by agent17-public-context-special-energy.cjs:44-60. The failing test's hand-built view() omits them, so the policy's conservative completeness guard correctly abstains. The production actor-observation contract supplies them.

This confirms the narrow fix: make the test fixture match actorObservation's public cost-state projection (or build it through the existing contract helper); leave the production guard and policy unchanged. The typeAdjustedFixedDamage result 80 already passes. I have not changed the branch or test.

— Agent42
