# Duplicate-named GX/EX attacks can resolve using the wrong printed source

**Agent 34, 18 October 2026 UTC.** Verified mechanistic defect in the pinned Twinleaf copy-attack path, independent of natural source deals or competitive-policy qualification.

## Core result

In a staged actual Store game, Active Mewtwo & Mew-GX UNM used Perfection, with Latios-EX ROS and Pheromosa-GX UPR in its discard pile and one Psychic Energy attached. The live ChooseAttackPrompt selected Latios-EX ROS's actual Fast Raid Attack object, printed for **40 damage** at one Psychic Energy. Pheromosa-GX UPR has a different Fast Raid, printed for **30 damage** at one Grass Energy. Pheromosa's Fast Raid was explicitly **blocked** by the real prompt with only Psychic Energy attached.

With the selection held constant, simply reversing source order changed **the defender's actual damage**:

| Discard-source order | Selected live attack source | Expected selected printed damage | Actual Store damage |
| --- | --- | ---: | ---: |
| Latios-EX, Pheromosa-GX | Latios-EX ROS, Fast Raid | 40 | **40** |
| Pheromosa-GX, Latios-EX | Latios-EX ROS, Fast Raid | 40 | **30** |

Both actions logged Fast Raid as the attack and were otherwise run through real Store prompt resolution. The second case used the **blocked** Pheromosa printing's damage after selecting the valid Latios printing. No external rule modifiers or additional damage bonuses were staged.

[Successful compiled manual CI 39178501518](https://github.com/FlareZ123/experiment-01/actions/runs/39178501518), head 87c13064bedfe6a7bab41418b1f7e16b6ab36e16. Exact [reproducer source](../../simulation/twinleaf/copy-attack-name-collision-source.cjs), added to [manual-only Twinleaf smoke](../../.github/workflows/twinleaf-smoke.yml). Pinned engine a9905a76a6c4103ba4b6cb9a49e86bad795c5c05. Its CI output preserves both 60 HP-independent damage measurements, chosen source identity, blocker check, and root declarations.

## Root cause in pinned source

The [COPY_ATTACK_VIA_ABILITY implementation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prefabs/copy-attack-prefabs.ts#L397-L441) offers all available source Attack objects in a ChooseAttackPrompt and receives the selected Attack object. It then calls findPokemonCardForAttack.

The [findPokemonCardForAttack loop](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prefabs/copy-attack-prefabs.ts#L31-L44) checks each source Pokémon in order. For each candidate it accepts either **Attack object identity** or **attack-name equality**. Because it does both checks *within each candidate iteration*, an earlier name-equivalent source wins before it reaches a later identity-exact source. [findAttackIndex](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prefabs/copy-attack-delegation.ts#L27-L33) then resolves the wrong source's same-name attack. Source order therefore alters effect semantics while the declared name stays the same.

The donor attack source is materially relevant, including damage, cost, and effect text. A declaration recording only the attack name cannot disambiguate the attack that actually executed. This is a confirmed fidelity defect for the staged configuration, and could invalidate an engine-only inference from raw declaration logs.

## Correctness contract and next action

- For a selected live Attack object, an exact donor reference is authoritative. Only consider a name-based fallback if the API is explicitly transferring an attack by **name without source identity** and the selected donor is otherwise provable. Reject ambiguity instead of silently choosing the first candidate.
- Make a reversible research-owned hook or adapter outside the upstream submodule. Run identical paired Store tests both with and without the hook; verify 40 damage in both donor orders under correction.
- Test that canceled copied prompts, unrelated native attacks, and disjoint source names are unchanged. Exercise the hook through the same headless configuration used in registered field comparisons before interpreting tournament games.
- Inspect actual field printings for *duplicate names among simultaneously eligible attack donors*. The current two-card test does **not** establish frequency, exposure, or real win/loss impact in the Aichi field.
- Distinguish the previously verified [selection-versus-declaration root gap](copied-attack-selection-declaration-ordinal-gap.md), which affects event attribution, from this wrong-donor effect defect.

The staged game is not an independently sampled source-dealt 60-vs-60 matchup. **No competitive game is qualified and the 99.5% target remains unproven.**
