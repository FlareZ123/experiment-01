# Agent 25: New Moon Perfection as a genuinely distinct 60-card challenger

**17 October 2026. Status: candidate/falsification packet; zero competitively qualified games.** The original [first-person May 13 article](https://ottopoke.hatenablog.com/entry/2026/05/13/183822) and its [33-grid-entry transcription](new-moon-perfection-source-60.json) establish a complete 60-card *name/count* list from an Aichi Open League participant who placed 52nd. The article gives the official Japanese deck code `GxxDYx-a4rD4W-a8xYxc`. The deck is outside the Top32 target.

## Frozen identity for investigation

- [Selected 33 English-effect-equivalent printing IDs, exactly 60 physical slots](new-moon-perfection-english-map.json), independently checked against the bundled English card database. SHA-256 of sorted `id:count\n` rows: `327add6086c4b14853638b40519e835e93c48377e6523ebf4e30b2f35c2ca28b`.
- Quantities: **19 Pokémon, 35 Trainers, six Energy**. The database identifies **17 Basic Pokémon**, counting the two Dusclops as Stage 1. Exactly one ACE SPEC appears, Secret Box.
- **Important precision boundary:** every selected ID is an *English functional equivalent*. This work has **not** obtained the official Japanese physical printing numbers, mapped them to Twinleaf constructors, or certified the complete historical Japanese Expanded ban/errata rules. For example, the English database names the source Battle Compressor as `Battle Compressor Team Flare Gear` (`xy4-92`) and Trainer's Mail as `Trainers' Mail` (`xy6-92`). Solrock's source ability was separately identified as **Sunbeam**, `sm7-62`, from the author's prose. The other mappings select mechanistically matching prints and retain source uncertainty.
- The bundled English print records flag all selected 33 IDs Expanded legal, and the mapped names/identified abilities do not match the project's dated [Japanese ban snapshot](../legality/japan-expanded-aichi-2026.json). These are partial screens, **not Japanese registration proof**.
- Against the [rank-1 Shadow Rider source list](../aichi-2026/benchmark-shadow-rider.md), exactly **20 of 60 slots** overlap by English name at minimum copy counts. Half-`L1` name-count distance is **40 slots**, a structurally different attacker/draw/lock engine. This is a name-level comparison, not a claim of strength. [Source-fidelity regression](../../tests/new-moon-print-map.test.cjs) pins the map's name/count coverage and both hashes.

## Source-authored game plan and constraints

Choose **second** when possible. Source article sequence: on the first own turn, prepare two discarded GX attack donors (**Gengar & Mimikyu-GX** and **Trevenant & Dusknoir-GX**) plus a Basic Psychic Energy, start/bring up **Mewtwo & Mew-GX**, manually attach a Psychic, equip **Powerglass**, bench one or two Duskull, and use **Horror House-GX** through Perfection. This attack prevents the opponent playing cards from hand on their next turn. At the end of that turn, Powerglass can attach a Basic Energy from the discard to the Active holder.

On the following turn, evolve Duskull to **Cursed Blast Dusclops**; self-KO grants the opponent a Prize and therefore enables **Ace Trainer** while the candidate has more Prize cards remaining. Establish **Solrock + New Moon Lunatone**, play **Path to the Peak**, use Ace Trainer to reduce opponent hand to three, attach the third Psychic to Mewtwo & Mew, then copy **Night Watch**. With three cards in the opponent's hand, Night Watch's two **random** cards leave one; its 150 damage continues to apply. Under an active New Moon, the deck intends to ignore Stadium effects on its own Pokémon while constraining opposing Rule Box Abilities.

This line has several independent bottlenecks: the one-Supporter-per-turn rule; Mewtwo's three-Psychic Night Watch attack cost; Powerglass's **after-attack**, Active-only, discarded-*Basic*-Energy requirement; Dusclops evolution timing and self-KO; a live, unblocked Lunatone; spare Bench space; and a playable `Secret Box` discard of **three other cards**. The first turn cannot normally evolve a newly placed Duskull.

## Important falsification: Klefki blocks its own Latias escape

The source recommends Klefki as a going-first Active and mentions using Latias or Escape Rope to move it. The selected **Klefki SVI 96** has `Mischievous Lock`: while Active, *Basic Pokémon on both sides have no Abilities* except Mischievous Lock. The selected **Latias ex SSP 76** is a Basic whose `Skyliner` is precisely an Ability. Consequently a **bare Latias ex on the Bench does not grant free retreat while that Klefki remains Active**. The same lock also suppresses one's own Basic Reconstitute, Farewell Letter, Squawk and Seize and Perfection until Klefki leaves Active.

A legal Klefki exit must instead involve paying its printed **one-Energy retreat cost** (subject to legal modifiers, retreat availability, and once-per-turn retreat), using **Escape Rope**, or another independent switching effect. Latias can help after Mischievous Lock stops applying, but cannot fund this first switch on its own. This is a paper card-text inference requiring a pinned-engine state regression before trusting simulator behavior. It narrows a source-described strategic convenience; it does not invalidate the 60-card list.

In a uniformly shuffled opening seven with 17 starting-eligible Basics, the event **Klefki is the only Basic** has exact probability `C(43,6)/C(60,7) = 1.578546%`; conditional on a valid Basic-containing opening seven it is `1.722246%`. Voluntarily starting Klefki despite holding other Basics is a separate policy event. These are opening-state probabilities, not losses.

## Resource screen, adversaries, and experimental next gate

In the first eight cards (initial seven and one ordinary draw), having at least one of each **Mewtwo & Mew (2), Powerglass (2), any Psychic Energy (6)** occurs with exact probability **2.862955%** in an unconditional uniform eight-card sample. Requiring an actual Basic Psychic Energy (3) instead gives **1.638336%**. Calculated by multivariate hypergeometric inclusion-exclusion. The resource intersection is neither sufficient nor necessary for the full first-turn attack because search, switching, discarded Energy, Stadiums, Basic starters, Supporters, and optional draws are omitted.

| Field branch | Printed placements | Principal falsification target |
| --- | --- | --- |
| Regidrago | 11 including missing source ranks 23/28 | Path removal, Stadium counters, Ability locks, per-list Noivern/Goodra/Tool differences; author's four Regidrago wins are limited anecdotal evidence |
| Raichu Electrode | 3 including missing source rank 25 | Klefki target order, fast multi-Prize knockouts and reset/rebuild after a failed bomb; author reported a loss |
| Iron Thorns | 3 | Initialization blocks Mewtwo's Basic Rule Box Ability independently of New Moon; hard-cast donor and Energy alternatives; author reported a loss |
| Absol Garbodor / Vileplume control | 4 Absol Garbodor plus Vileplume ranks 2 and 15 | Ability- or Item-lock before the four-part combo and available lock-removal options |
| Snorlax stall / Meloetta donk | 2 / 1 | Active traps, delayed damage conversion, and survival through the setup window |

The author reports **six wins and two losses** at that tournament and notes avoiding Garbodor and Item-lock decks. That observation motivates testing, while the named losses and absent lock matchups argue against promoting this source 60 immediately.

**Minimum next engine work:** assert the Klefki/Latias Active-to-Bench lock transition in both seats, then reproduce the source Horror House → Powerglass → Dusclops/Ace Trainer → random Night Watch line with precise prompt RNG and prize changes. Use the already existing manual Aichi workflow and record failures, not a new per-commit CI job. Test fixed 60 unchanged under the candidate's policy and competent opponents before any win-rate comparison. At present **0 qualified competitive wins** are attributable to this contender.

## Compiled pinned-engine falsification (17 October 2026)

[Manual source-coverage CI 39017588920](https://github.com/FlareZ123/experiment-01/actions/runs/39017588920) **passed** at repo head `cd562e956e434ca6351f7cf9c3c1fd007cbe067b` with Twinleaf pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Source-to-map name/count + SHA-256 Node regression passed. The actual compiled Store [Klefki/Latias probe](../../simulation/twinleaf/new-moon-klefki-latias-audit.cjs) passed four scenarios, both physical seats with and without Latias. While Klefki is Active, Skyliner is blocked and Klefki's one-Energy retreat cost remains. After an independent `Player.switchPokemon` transition to Mewtwo & Mew, Latias' Skyliner becomes available and Mewtwo's two-Energy printed retreat cost falls to zero; without Latias it remains two. [Raw JSON artifact](https://github.com/FlareZ123/experiment-01/actions/runs/39017588920/artifacts/12095223829), artifact ZIP SHA-256 `50735a0464dfdb8301b118b3b1eac5128f1f21854d03d66b09794d39a9e846a5`. 

**Scope:** This validates a staged real Store cost/Ability effect and its immediate Active-to-Bench transition. It does not assert that a player can legally pay the retreat from the staged initial board, or that the complete deck's starting-policy, turn sequence, opponent counterplay or matchup outcomes have been tested. The official Japanese printing details remain unverified. `qualifiedForCompetitiveInference:false`.
