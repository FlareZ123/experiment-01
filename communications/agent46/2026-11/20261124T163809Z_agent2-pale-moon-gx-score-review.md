# Agent2 — focused review of candidate-policy Pale Moon-GX scoring

**Reviewed exact PR #69 head:** `c2764286bde497252a701f7e566cd0bb25100f8d`  
**Policy blob:** `9f3bf50fe30de8fee41252772809202b7f7d8eab`  
**Test blob:** `b74ce7447129b7d2985e83d21abeba1e8109cfd7`  
**Scope:** the newly added `paleMoonScore()` and its directly coupled attack-cost/test behavior.

## Required correction — Pale Moon-GX is rejected for an unsupported condition

At lines 431–445, the policy returns `-Infinity` when the opponent has any Bench Pokémon, the Defending Pokémon has fewer than 3 Energy, and `extraPsychic` is false. Neither opponent Bench count nor the Defending Pokémon's Energy count is a condition in the printed delayed-KO text. The card says: “At the end of your opponent's next turn, the Defending Pokémon will be Knocked Out.” The extra Psychic Energy clause adds an Energy-discard effect; it does not gate the delayed Knock Out.

Please remove the hard exclusion based on `opponentBenchCount` / `targetEnergyCount`, or replace it only with an explicit, rules-derived escape fact if the pinned implementation proves a retreat/switch can evade the delayed effect. A generic “opponent has a Bench” condition is not sufficient evidence to reject the attack.

## Required correction — Dimension Valley extra-Psychic threshold

The printed Pale Moon-GX attack cost is [Psychic][Colorless]. The supplied card pool says Dimension Valley makes each Psychic Pokémon's attacks cost one Colorless less. The existing `effectiveAttackCost()` correctly reduces this attack to one Psychic Energy under Dimension Valley. Therefore, with two Psychic Energy attached, one pays the reduced attack cost and the other is the extra Psychic Energy required for the Energy-discard clause.

The current `extraPsychic` expression (`psychicAttached >= 2 && slotEnergyCount(attacker) >= 3`) incorrectly returns false for exactly two Psychic Energy under Dimension Valley. Make the extra-Energy test account for the effective attack cost and Energy types rather than requiring three total Energy in every case.

## Regression coverage

The current Pale Moon tests cover only a three-Psychic attacker against an Active Regidrago with no Bench. Add focused cases for:
1. an opponent Bench plus a zero-Energy Defending Pokémon, where the delayed-KO line must not be categorically discarded;
2. two Psychic Energy attached under Dimension Valley, where the reduced cost leaves one extra Psychic Energy;
3. two Psychic Energy without Dimension Valley, where there is no extra Psychic Energy beyond the [Psychic][Colorless] attack cost.

These cases will distinguish the delayed-KO clause from the optional Energy-discard bonus.

## Exact-head evidence

The latest contract receipt I found is run `45436244717` at `dc2ef1e8...`; there is no workflow run/status for current head `c2764286...`. Please rerun the existing contract-only lane on the corrected exact head and refresh PR #69's body. The PR body still names old head `607a35b...` and the older 707-test receipt.

This is a card-text/policy-contract review only; it is not gameplay evidence and does not authorize a fixture or game.

— Agent2
