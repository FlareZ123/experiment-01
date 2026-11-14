# Regidrago Apex Dragon attack-choice evaluator

**Status:** reusable heuristic component; not a complete opponent policy and not a game-result claim.

## Purpose

The Aichi diagnostic field contains multiple Regidrago lists. The rank-10 normalized list includes Regidrago V/VSTAR plus Dragon attack payloads including Dragapult ex TWM 130, Dialga-GX UPR 100, Koraidon ex TEF 120, Kyurem SFA 47, and Hisuian Goodra VSTAR LOR 136. The exact printing matters: the native Apex Dragon prompt is the legality authority and supplies the attack choices that can actually be selected.

The helper at `simulation/evaluation/2026-11/agent43-regidrago-apex-choice.cjs` ranks those offered choices using only the acting player's observation. It exports:
- `evaluateApexAttackChoice(choice, observation)`
- `rankApexChoices(choices, observation)`
- `chooseApexAttack(choices, observation)`

The last function returns only the protocol decision `{ kind: "select-choice", token }` or a fail-closed abstention.

## Modeled attack semantics

- **Timeless-GX:** 150 damage and an immediate extra turn; unavailable unless the actor's public GX-use flag is explicitly false. An immediate prize win outranks the ordinary extra-turn preference.
- **Kaiser Tackle:** 280 damage, 60 self-damage; includes Muscle Band before Dragon Weakness and penalizes self-KO unless the attack wins immediately.
- **Phantom Dive:** 200 Active damage plus six damage counters on the opponent's Bench. A small knapsack calculation allocates the six counters to maximize actual Prize value; Bench damage counters do not receive Weakness or Resistance.
- **Trifrost:** 110 damage to three opposing Pokémon; applies Weakness/Resistance to the Active target, not Benched targets, and discounts the attack for discarding all Energy.
- **Rolling Iron:** 200 damage plus the 80-damage reduction effect on the attacker during the opponent's next turn.
- **Dragon Laser / Frost Spear:** models Active damage separately from their small Bench damage.
- **Outrage / Retribution Strike:** scales from damage counters on the attacking Regidrago.
- **Shred:** models its Active damage and effect-piercing role.
- **Overclock / Celestial Roar:** lower-priority draw-to-six and top-three Energy-acceleration options.

For direct Active damage, the helper applies the target's printed Dragon Weakness/Resistance and an attached Muscle Band. It uses the actor's own remaining Prize count to identify immediate wins.

## Validation

The focused Node test file is `tests/2026-11/agent43-regidrago-apex-choice.test.cjs`. **17/17 tests passed locally** with Node's built-in test runner. Coverage includes GX fail-closed behavior, immediate-win priority, weakness and Muscle Band ordering, Kaiser self-KO risk, Phantom Dive Prize allocation, Trifrost multi-KOs, and deterministic choice selection.

## Limitations

- The scoring weights are heuristic and have not been calibrated against game outcomes.
- The helper ranks only attack choices already offered by the native prompt. It does not construct legal attacks or independently validate Energy costs.
- It does not resolve subsequent target-allocation prompts for Phantom Dive or Trifrost.
- It does not model every damage modifier, prevention effect, status, ability lock, or future-turn line.
- It is not a complete rank-10 policy, does not run Twinleaf matches, and provides no matchup win-rate evidence.

## Next integration step

Import this helper from a Regidrago opponent policy, use the native prompt for legality, implement the subsequent target-selection prompts, and test the integrated policy in the contract-only worker before any game fixtures. The same evaluator can be reused across Regidrago ranks when the corresponding attack is actually offered.
