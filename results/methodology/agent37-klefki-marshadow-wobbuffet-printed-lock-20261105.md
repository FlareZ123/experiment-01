# Aichi Raichu counterplay: Klefki self-locks its own Resetting Hole Marshadow

**Agent37 | 5 November 2026 | Card-text deduction and legality-source cross-check | No native Store test, game or inferred matchup win rate.**

## Motivating original-player evidence

The public [14 May 2026 first-person kume Alolan Raichu report](https://note.com/kume_pokeca/n/n6cfd126f5774) discusses **Klefki** as a possible early answer to Regidrago's Basic support Abilities and separately names **Marshadow** as a possible answer to Path to the Peak. These are the writer's proposed *counterplay options*. The article's exact deck inventory is paywalled, and it does **not** establish that both cards were in the same final 60 or used in the same game. This note tests the technical **interaction between the candidate answers** from printed card text. For the missing original rank25, retain the [source admission warning](agent37-kume-raichu-2026-firsthand-counterplay-evidence.md).

## Exact printings and effect statements

The supplied complete `resources/cards/en` database contains:

| Printing ID | Card | Relevant text |
| --- | --- | --- |
| `sv1-96` | Klefki, Scarlet & Violet | **Mischievous Lock**: while Klefki is Active, Basic Pokémon in play on both sides have no Abilities except Mischievous Lock |
| `sm10-81` | Marshadow, Unbroken Bonds | **Resetting Hole**: while Marshadow is Benched, once during your turn you may discard a Stadium in play; if you do, discard Marshadow and attachments |
| `xy4-36`, `g1-RC11` | Wobbuffet, Phantom Forces / Generations | **Bide Barricade**: while Wobbuffet is Active, Pokémon in play, hand and discard pile have no Abilities **except Psychic Pokémon** |
| `sm35-45`, `smp-SM85` | Marshadow, Shining Legends / promo | **Let Loose**: disruptive when-Benched draw/shuffle effect, a different printing and not a Stadium-removal Ability |

Both Marshadow `sm10-81` and Klefki `sv1-96` are **Basic Psychic Pokémon** in the supplied database. Wobbuffet `xy4-36` is also Psychic. [Limitless identifies Marshadow UNB81 as Expanded-legal](https://limitlesstcg.com/cards/UNB/81/formats), consistent with the [2026 Expanded Black & White onward format announcement](https://www.pokemon.com/us/news/2026-pokemon-tcg-standard-format-rotation-announcement). **Marshadow SHL45 and promo SM85** with *Let Loose* are on the [Expanded banned card list](https://www.pokemon.com/us/play-pokemon/about/pokemon-tcg-banned-card-list). [This printing-specific banlist mirror](https://tcgcontender.com/pokemon/reference?format=expanded&view=banlist) independently lists SHL45. Do not globally mark every card named Marshadow banned or assume every Marshadow has Resetting Hole.

## Direct rule consequence

Assume `sv1-96` Klefki is your **Active Pokémon** and `sm10-81` Marshadow is on your **Bench**, with no special interaction neutralizing Klefki's Ability.

1. Active Klefki's Mischievous Lock is automatic and applies to **your own Basic Pokémon** as well as the opponent's.
2. Benched UNB81 Marshadow is a Basic Pokémon with the Resetting Hole Ability.
3. While Klefki's Mischievous Lock applies, that Marshadow **has no Resetting Hole Ability** and cannot announce it, even if the opponent's Stadium is in play.
4. To use Marshadow's Resetting Hole from the Bench, first remove the relevant Ability denial, for example by moving Klefki out of the Active Spot through a legally available switch/retreat line, or by otherwise disabling the lock. Merely having Marshadow searchable or present on the Bench is not enough. If Marshadow itself is Active, its Ability fails the separate Bench-position condition.

**Contrast with Active Wobbuffet `xy4-36`:** Bide Barricade expressly exempts **Psychic Pokémon**. Marshadow `sm10-81` is Psychic, so Wobbuffet's own lock **does not suppress Resetting Hole**, leaving it usable on the Bench if the remaining game state permits. Other independent Ability locks, Bench restrictions, card-text requirements and Stadium restrictions can still prevent the action.

| Our Active | Our UNB81 Marshadow position | Direct lock/position conclusion |
| --- | --- | --- |
| Klefki `sv1-96`, Mischievous Lock active | Bench | Resetting Hole absent due to own Klefki |
| Wobbuffet `xy4-36`, Bide Barricade active | Bench | Resetting Hole survives Wobbuffet's Psychic exception |
| Any ordinary Active without applicable Ability denial | Bench | Resetting Hole is available **subject to other applicable rules** |
| Any Active | Active Marshadow itself | Resetting Hole's Bench-only condition is not satisfied |

The supplied [Advanced Player's Rulebook](../../resources/manual/EN_advanced_manual-2025-transcription-structured.md) §A-02 distinguishes optional announced Abilities from automatically active passive Abilities. The Pokémon's **current board position** and all other applicable effects matter when determining whether a proposed action is available.

## Why the distinction matters in a solver

An associativity graph might register Klefki as an independent early lock and Marshadow as a cheap Path to the Peak answer. If it rewards both connections simultaneously while keeping Klefki Active, it overestimates attainable card access. The precise option has a **sequential switching/position cost** and potential **self-Ability-lock draw cost**, exactly the kind of AMR/lock-interaction problem described in [the shared prior concepts](../../resources/human_concepts.md).

A future authentic Raichu original-source policy should test a **real print-specific branch** that stages any owner-dependent Basic support Abilities and Stadium removal before committing to Klefki's Active lock, then compare with an alternative Wobbuffet Active line where Marshadow remains Ability-enabled. Check whether Wobbuffet actually affects other necessary owner Basics and whether moving the Active can be funded. Preserve both players' legal answers and real physical attachment and attack payoffs.

**Evidence status:** Direct card-text inference, pending native physical-State observation. There is no validated 60-card rank25 source, no logged native Store action proving this exact original line occurred, and no new qualified Aichi outcome. The known original-source admission denominator remains **29/32**.
