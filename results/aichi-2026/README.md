# Aichi Open League 2026 opponent field

**Event:** CL Aichi Open League, 10 May 2026, 926 participants.

**Primary sources**
- [Tournament rankings](https://limitlesstcg.com/tournaments/566)
- [Published decklists](https://www.limitlesstcg.com/tournaments/566/decklists)
- [Regidrago tournament history](https://limitlesstcg.com/decks/260/results)
- [Raichu Electrode Combo tournament history](https://limitlesstcg.com/decks/282/results)

## Coverage

The [field manifest](field.csv) records **32 of 32** ranked players with verified archetype labels. The decklist page publishes **29 of 32** full lists.

Full lists absent from the decklist page:
- Rank 23: Yuki Ueno, Regidrago. Archetype independently displayed in Regidrago tournament history.
- Rank 25: Kazuki Kumegawa, Raichu Electrode Combo. Archetype independently displayed in Raichu Electrode tournament history.
- Rank 28: Jo Kato, Regidrago. Archetype independently displayed in Regidrago tournament history. An [unconfirmed 28th-seed alias lead](rank23-rank28-source-scout.md) does not supply a 60-card list.

These three players' exact 60-card lists are **unknown**. See [the rank-23/28 source scout](rank23-rank28-source-scout.md) and [the rank-25 first-person scout](rank25-source-scout.md). Do not substitute a nearby player's version and label it as their list.

## Field archetypes

| Archetype | Number of players |
| --- | ---: |
| Regidrago | 11 |
| Absol Garbodor | 4 |
| Iron Thorns | 3 |
| Raichu Electrode Combo | 3 |
| Snorlax Stall | 2 |
| Shadow Rider Calyrex | 1 |
| Vileplume Control | 1 |
| Mew Genesect | 1 |
| Absol Electrode | 1 |
| Lopunny Vileplume | 1 |
| Raging Bolt | 1 |
| Meloetta Donk | 1 |
| Lillie's Clefairy | 1 |
| Dusknoir Chimecho | 1 |

## First reproducible candidate

[Winning Shadow Rider Calyrex champion deck, 60 cards](benchmark-shadow-rider.md) is an unoptimized tournament reference and the first evaluation candidate, chosen because its complete list and tournament ranking are independently documented. There are no controlled match trials for this list.

For its 14 ordinary Basic Pokémon, exact hypergeometric opening calculations give a 13.85907% chance of a 7-card hand with no Basic and a 36.61785% chance of one or more Shadow Rider Calyrex V conditioned on a valid seven-card opening. This excludes replacement mulligans, bonus draws, prizes, start restrictions and match decisions.

## Legality and evidence constraints

The Aichi event used Japanese Expanded. The repository's `resources/INDEX.md` explicitly warns that `resources/cards/en` is an English snapshot and **not** a complete Japanese Expanded pool. The tournament page labels Palace Book, Player's Ceremony and other cards as unreleased in the English-language display. Treat English-data absences as **coverage gaps**, pending regional legality verification.

The published event decklist is not a sufficient engine test. Before a reported win rate can be treated as meaningful, establish region-specific card legality, card IDs/printings and errata, actual Twinleaf support, strong game-playing policies, first-turn rules, mulligans/prize effects, matching 60-card opponent lists, sample sizes, confidence intervals, and per-placement outcomes. Inaccessible matchups must be explicitly identified. **The 99.5% target is unverified.**

## New opening-hand evidence

[Champion forced Bench-entry starter probabilities](opening-opportunity-cost.md) quantify a 9.731780% chance that an accepted opening offers only Radiant Eternatus/Tapu Lele-GX as Basic starters. This is an exact initial-hand result, not a win-rate claim.


[Bonus-draw access under opponent mulligans](bonus-draw-access.md) extends the opening audit with an exact joint mulligan distribution and accepted-hand card-access probabilities across 29 published placements. The strongest contrast is vs four-Basic Iron Thorns (Shadow Rider V setup access 36.62% before bonuses, 41.40% if all are drawn). This is not a win-rate estimate.
