# Prize-aware Phantom Dive allocation and effect-defense fidelity

**Agent 37, 16 October 2026.** Research-only tactical decision policy and focused pinned-engine action fixtures. **No competitive matchup win rate or qualified full game is inferred.**

## Correcting the immediate-tactical objective

The [six-counter allocation resolver](../../simulation/twinleaf/apex-spread-damage-resolver.cjs) previously maximized the number of Knocked Out opposing Pokémon. That objective can choose two single-Prize Knock Outs over one three-Prize Knock Out when both consume six ten-damage counters. For the user's single-deck objective, this is an avoidable one-turn tactical misvaluation.

The revised helper `nominalKnockoutPrizes` mirrors the pinned Twinleaf `KnockOutEffect` rules from `ptcg-server/src/game/store/effect-reducers/game-effect.ts` at revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:

- baseline single Prize;
- one additional Prize from the listed Pokémon ex, EX, GX, V or VSTAR tags;
- one additional from Mega ex, TAG TEAM or dual LEGEND tags;
- two additional from VMAX or V-UNION tags;
- the target's currently armed next-turn zero/extra-Prize flags.

This is **nominal, locally projected** Prize value. Other in-play card effects, conditional rule changes, simultaneous Knock Outs and game-level responses can change the realized result.

The allocation objective now compares complete `PutDamagePrompt` maps by immediate win feasibility when a positive Prize count is available, then nominal Prize cards from covered Knock Outs, then KO count, minimizing wasted counters and preserving progress. Every submitted result must pass the actual `prompt.validate`. The nonwinning potential of a defensive Goodra `Rolling Iron` copy remains outside the model.

## Source-backed rule and actual Prize-action tests

[Pure tests](../../tests/apex-spread-damage-resolver.test.cjs) verify printed-rule tags and next-turn Prize modifiers. A distinct test with opposing 30/30/50 HP windows chooses a three-Prize VMAX KO rather than the alternate two-Basic-KO split.

The actual Store test uses Pokémon from the registered rank-15 Lopunny Vileplume inventory: Active Pidgey FLF / Pidgeotto TEU / Pidgeot ex OBF; two Benched Budew ASC; and a Benched Buneary PFL / Mega Lopunny ex PFL evolved chain with 280 damage already present (50 HP remaining). Regidrago VSTAR SIT, Dragapult ex TWM and Hisuian Goodra VSTAR LOR copy payloads are in registered rank 10. The staged paid `Apex Dragon` copies `Phantom Dive`, allocates five counters to Mega Lopunny ex, finishes prompts, and actually **takes three Prizes** from the Bench KO. Both Budew survive. [Manual compiled CI 38880399986 passed](https://github.com/FlareZ123/experiment-01/actions/runs/38880399986). This injected board is source-inventory-consistent and mechanically executable; it is not a complete match.

## Attack-effect protective Energy

A second failure mode was identified against the pinned card sources for Mist Energy TEF, Wash Water Energy VIV and Wonder Energy PRC. These can prevent effects of opposing attacks, including the `PutCountersEffect` made by Phantom Dive under applicable attachment/type/lock conditions. The earlier copy selection would treat a 30-HP Pokémon holding such an Energy as an unconditional Prize window.

[Shared conservative defense screen](../../simulation/twinleaf/apex-spread-counter-protection.cjs) is now used by both the [copied-attack selector](../../simulation/twinleaf/apex-spread-copy-resolver.cjs) and the counter allocator. It excludes Pokémon with visible Tools, powers or one of these attached effect-protective Energy names as **certain** KO targets. An actual target may lose its protection under Energy lock or typing changes; this intentionally biased filter requires later game-state rules to upgrade that target to a reliable tactical opportunity.

A synthetic staged Store regression puts Mist Energy TEF on one Budew ASC and manually assigns 30 Phantom Dive damage to it and a clean Budew. Under actual pinned card reducer behavior, **the protected Budew takes zero counters while the unprotected Budew is Knocked Out and one Prize is taken**. The Mist card was added synthetically and was not part of the published rank-15 deck; it establishes isolated interaction behavior. The [CI 38880889281 logs](https://github.com/FlareZ123/experiment-01/actions/runs/38880889281) showed the pinned subtest passed, though that *overall run failed* on an over-specific pure assertion about surplus counters. The corrected complete suite **passed manual pinned CI 38881186490**: [run and evidence](https://github.com/FlareZ123/experiment-01/actions/runs/38881186490).

## Remaining validation

The model does not evaluate every external protective Ability, Special Energy denial condition, on-KO countereffect, Prize-changing Trainer, turn sequencing, discarded alternate Dragon payload, opponent response or winning multi-turn line. The targets have been injected directly with available Energy and damage; neither source-ranked player decision policy nor an unchanged 60-card benchmark game has been validated.

Next critical step is a source-locked rank-10 versus rank-15 replay with competent opponent decisions and both physical seats, preserving a full action and prompt trace. No change to the single nominated deck is justified by these tactical fixtures alone.
