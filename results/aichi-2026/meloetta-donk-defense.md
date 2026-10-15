# Aichi 2026: printed first-turn defenses against Meloetta Crisis Punch

## Scope and reproducibility

This study refines the [player-verified rank-26 Meloetta donk line](meloetta-donk-als.md) by classifying **which printed Basic Pokémon could withstand, block, or suppress its first-turn Crisis Punch line if selected as the defending Active Pokémon**.

The [printing-resolved audit](../../scripts/aichi_donk_resilience.cjs) uses the Limitless set/collector-number in each of the 29 published lists and resolves that pair through `resources/sets/en.json` and the English card data. No fallback to name-only printings is permitted. The full 28-defender table and [tests](../../tests/aichi_donk_resilience.test.cjs) were generated successfully by the manual [Aichi opening audit CI, run 38821844955](https://github.com/FlareZ123/experiment-01/actions/runs/38821844955). Ranks 23, 25 and 28 are unpublished and unassessed.

The matchup setup model is explicitly limited: Meloetta ex is Psychic-type and uses an otherwise unmodified **280-damage** TM Crisis Punch. Pokémon's printed Psychic Weakness and Resistance adjust that damage, before checking the printed HP. Four named Active-dependent Abilities are separately flagged. No other modifications, opponent Items, or search policies are included.

## Defensive mechanism taxonomy

| Printed Basic | Source printing | Mechanism against the first-turn line | Important qualification |
| --- | --- | --- | --- |
| **Mega Kangaskhan ex**, 300 HP | MEG 104 | With Fighting Weakness and no Psychic Resistance, it **survives 280 damage with 20 HP** | Other attack modifiers could change this; rank-26 published combo has no damage-boosting Tool |
| **Iron Thorns ex**, 230 HP | TWM 77 | **Initialization** suppresses Abilities of non-Future Rule Box Pokémon, including Meloetta ex | Rank-26 deck has **one Canceling Cologne**, which could suppress Initialization on the defending Active for a turn |
| **Klefki**, 70 HP | SVI 96 | **Mischievous Lock** suppresses Abilities of Basic Pokémon **in play**, including Meloetta ex and Benched Tapu Koko ◇. It does **not** suppress Exeggcute's Propagation while Exeggcute is in the discard pile | Its effect is attached to the defending Active and is potentially disabled by Canceling Cologne |
| **Flutter Mane**, 90 HP | TEF 78 | **Midnight Fluttering** suppresses the opponent's Active Pokémon's Ability, preventing first-turn Debut Performance from functioning | Meloetta must be Active to attack; Canceling Cologne is an answer |
| **Mimikyu**, 70 HP | PAL 97 | **Safeguard** prevents damage from attacks of Pokémon ex and Pokémon V, including a Tool-provided attack used by Meloetta ex | Canceling Cologne may temporarily turn off Safeguard |
| **Empoleon V**, 210 HP | BST 40 | **Emperor's Eyes** suppresses Abilities of non-Rule Box Basic Pokémon | Crucially, Meloetta ex **has a Rule Box**, so Emperor's Eyes cannot suppress Debut Performance |
| **Wobbuffet**, 110 HP | PHF 36 | **Bide Barricade** suppresses the Grass-type Exeggcute's Propagation even in the discard pile, and Lightning-type Tapu Koko ◇ on the Bench, disrupting the required self-KO and acceleration lines | Meloetta ex is Psychic, so Debut Performance itself remains available; Canceling Cologne could disable Wobbuffet's lock |

The first five and Wobbuffet are *potential defensive exceptions* to the single-Active first-turn sequence. Empoleon V is a counterexample because its Rule Box exception leaves Meloetta ex and Tapu Koko ◇ unaffected; Exeggcute's Propagation activates in the discard pile, outside Emperor's Eyes' in-play scope. Wobbuffet's unusual **in-play, hand and discard-pile** suppression is the key distinction. Actual protection must be judged with full interaction state and opposing counters.

## Quantitative impact on the opening-state model

The companion [exact bonus-draw and solo-Active model](../../scripts/aichi_solo_start.cjs) computes the conditional probability of exactly one Basic Pokémon in a valid initial seven and after accepting all optional bonus cards from the 12-Basic Meloetta deck. When exactly one Basic appears, it must occupy the Active Spot. Under the printed-only classifier, classify that Basic's copies as nominally HP-surviving, Ability-protected, or unprotected. As the initial seven is exchangeable across Basic copies, the event of a lone unprotected Active has probability:

`P(lone after all bonuses) * (unprotected Basic copies / total Basic copies)`.

Selected cases:

| Defender | Basics | Relevant protecting Basic copies | P(lone Active after bonuses) | P(lone Active with no listed intrinsic defense) |
| --- | ---: | --- | ---: | ---: |
| Rank 1 Shadow Rider Calyrex | 14 | None identified | 37.507% | **37.507%** |
| Rank 3 Snorlax Stall | 11 | 1 Safeguard Mimikyu | 49.446% | **44.951%** |
| Rank 4 Raichu Electrode Combo | 13 | 1 Mischievous Lock Klefki | 41.279% | **38.104%** |
| Rank 6 Iron Thorns | 4 | 4 Initialization Iron Thorns ex | 83.674% | **0.000%** |
| Rank 7 Snorlax Stall | 12 | 3 Safeguard Mimikyu and 3 Bide Barricade Wobbuffet | 45.261% | **22.630%** |
| Rank 10 Regidrago | 15 | 1 Bide Barricade Wobbuffet | 33.946% | **31.683%** |
| Rank 18 Regidrago | 16 | 1 300-HP Mega Kangaskhan ex | 30.598% | **28.685%** |
| Rank 19 Raging Bolt | 16 | 1 Midnight Fluttering Flutter Mane | 30.598% | **28.685%** |
| Rank 21 Regidrago | 14 | 1 Bide Barricade Wobbuffet | 37.507% | **34.828%** |
| Rank 24 / 29 Iron Thorns | 4 | 4 Initialization Iron Thorns ex | 83.674% | **0.000%** |

The 0% in Iron Thorns refers **only to the class of lone Active Pokémon with no intrinsic defense against the unmodified turn-one plan**. It says nothing about the probability of Meloetta finding **Canceling Cologne** and disabling that Ability. Conversely, starting any lone unprotected Basic is only a necessary *board exposure*, and the attacking deck must still execute an elaborate five-self-KO line, find Energy, establish first-turn attacking permission, and inflict enough damage.

Bench availability matters independently of all these classes. An additional Basic Benched at setup can prevent a lone-Active instant win even when the Active is otherwise fragile.

## Optimization relevance

The analysis suggests several discrete evaluation axes for any proposed single fixed deck:

- How many Basic Pokémon can safely open without exposing a one-Pokémon instant-loss condition?
- How many of those Basics intrinsically resist the specific attack at the precise opening phase?
- If a defensive Ability matters, what are the attacker's realistic search paths to the one Canceling Cologne, given Prize cards and other required resources?
- How much do additional starters or defensive tech cost in other archetype matchups?

A naive setup optimizer rewarding only more Basic Pokémon or a card graph rewarding search connectivity misses these opening hazards. This audit supplies exact starting-state probabilities and card-text candidate defenses. It **does not** validate an improved 60-card list or an overall matchup win rate.
