# Aichi Technical Machine attack-choice policy defect and opt-in correction

**Agent 23, 16 October 2026.** Status: **compiled pinned-engine policy regression passed**. This is a decision-policy finding; no game-win inference.

## Problem and source evidence

Twinleaf's pinned upstream `simple-bot/simple-tactics/attack-tactic.ts` enumerates only `active.attacks`. The same pinned engine makes attacks granted by a Pokémon Tool available to legal gameplay through `CheckPokemonAttacksEffect`, which reads the attached Tool's `attacks`, and through `player-turn-reducer.ts`, which appends those attacks for `AttackAction` resolution.

Consequently, the generic `SimpleTacticsAi` can execute a Tool-granted attack when commanded but its default attack choice cannot propose one. This is a **policy omission**, not evidence that the attack implementation is missing.

The [published Aichi list manifest](../aichi-2026/full-decklists.json) contains six relevant Tool copies across three of 29 available opponent lists:

| Opponent rank | Archetype | Tool-granted attack | Copies |
| --- | --- | --- | ---: |
| 2 | Vileplume Control | Technical Machine: Evolution | 2 |
| 15 | Lopunny Vileplume | Technical Machine: Evolution | 2 |
| 26 | Meloetta Donk | Technical Machine: Crisis Punch | 2 |

Because attacks on these Tools are central to source-representable archetype lines, unmodified generic-bot games risk systematically understating opponent threat.

## Reproducible real-engine test

The [staged Meloetta decision probe](../../simulation/twinleaf/tm-attack-policy-characterization.cjs) initializes the pinned compiled Twinleaf engine with Meloetta ex carrying TM Crisis Punch, three Basic Psychic Energy, a 320-HP Shadow Rider Calyrex VMAX defender, and exactly one opponent Prize remaining at turn four. The state deliberately bypasses setup and draw consistency; all actions nevertheless pass through real `SimpleTacticsAi` and `Store`.

The default bot did not select Crisis Punch, since that attack is absent from Meloetta's printed attacks. An opt-in policy selected `AttackAction('Crisis Punch')`. The Store accepted the action and, after an actual `WaitPrompt` animation continuation, applied **280 damage** to the defender.

The first [manual CI run 38833189731](https://github.com/FlareZ123/experiment-01/actions/runs/38833189731) passed the selection checks but failed the damage assertion because it inspected damage before resolving the animation prompt. This was a fixture timing error, not a proven engine damage defect. The corrected [run 38833649980](https://github.com/FlareZ123/experiment-01/actions/runs/38833649980) passed all four regression tests, including the positive policy action, negative attack condition with two defender Prizes, printed field census and configuration guard.

Test code: [tests/tm_attack_policy.test.cjs](../../tests/tm_attack_policy.test.cjs). Manual workflow: [aichi-tm-attack-policy.yml](../../.github/workflows/aichi-tm-attack-policy.yml). No upstream vendor modification was made.

## Opt-in tactic and limitations

The [tool-attack-policy.cjs](../../simulation/twinleaf/tool-attack-policy.cjs) adapter inserts `ToolAwareAttackTactic` immediately before the upstream `AttackTactic`. It merges the Active's printed attacks with `CheckPokemonAttacksEffect` attacks, deduplicates attack names, and uses the existing upstream simulated-action evaluator and score thresholds. The default policy remains unchanged unless the option is explicitly enabled.

This implementation is a candidate policy component, not a competitive opponent. It may still choose poor attacks, fail to prioritize Bench evolution, or fail other required setup lines. The test does not cover full source-deck draw sequences, game wins, multiple attackers, lock response, sophisticated timing, or rank 2/15 Bunnelby double-evolution decisions. For a separate reducer-level check of the rank-2 line, see [Agent 22's Bunnelby double-TM test](../../simulation/twinleaf/vileplume-double-tm-board.cjs).

**Action for evaluation agents:** Treat the unmodified SimpleTacticsAi as missing a relevant class of attack options, preserve policy version labels, and run first/second actual-turn policy regression fixtures before any sampled matchup conclusions. The 99.5% goal remains completely unverified.
