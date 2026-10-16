# Aichi Open League 2026 opponent field

**Event:** CL Aichi Open League, 10 May 2026, 926 participants.

**Primary sources**
- [Tournament rankings](https://limitlesstcg.com/tournaments/566)
- [Published decklists](https://www.limitlesstcg.com/tournaments/566/decklists)
- [Regidrago tournament history](https://limitlesstcg.com/decks/260/results)
- [Raichu Electrode Combo tournament history](https://limitlesstcg.com/decks/282/results)

## New field-average evidence method (Agent 17)

[Fixed-horizon global 64-cell evidence gate](agent17-balanced-global-gate.md) provides a conservative one-sided 95% hypothesis test for the 99.5% **equal-rank/equal-seat** benchmark, conditional on independent complete games across all 32 ranks, frozen lists/policies and strong simulator fidelity. Ten games in each of 64 cells, all 640 wins, would meet the statistical threshold (`p=0.0404363`). Fifteen per cell, 959/960 wins, would also pass (`p=0.0473574`). These are hypothetical test planning numbers, not played games or present strength evidence. Full-match and missing-rank blockers remain.

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

## Completed printed-HP Fairy Zone Copycat KO fixture (Agent 1)

[The integrated pinned-engine knockout test](../twinleaf/mimikyu-printed-hp-ko-prize.md) now uses the printed 280-HP Regidrago VSTAR, Mimikyu GRI's Copycat borrowing Apex Dragon, an own-discarded Dialga-GX Timeless-GX and Benched Lillie's Clefairy ex. The completed effect/resolution sequence deals **300**, discards Regidrago, awards **two Prizes**, promotes spare Dratini, and gives the attacking player the next turn. It passed [manual CI 38863207837](https://github.com/FlareZ123/experiment-01/actions/runs/38863207837), including real deferred Wait, ChoosePrize and ChoosePokemon prompts. This is a staged mechanic contract; the setup, bot and opponent decisions are not certified.

## Mimikyu copied GX actual turn progression (Agent 1)

The [two real declared-attack fixture](../twinleaf/mimikyu-extra-turn-progression.md) now resolves real WaitPrompts after Regidrago Apex Dragon -> Mimikyu Copycat -> own-discard Timeless-GX. In the pinned engine with **opt-in** Copycat and declared-history compatibility hooks, it dealt 150, consumed GX allowance and advanced from turn 5 to turn 6 **without changing the attacking player** (three WaitPrompts); [manual CI 38861914912](https://github.com/FlareZ123/experiment-01/actions/runs/38861914912) passed. This prepared-board effect/turn contract does **not** establish legal full-match outcomes, policy competency or a Regidrago matchup win rate.

## Joint critical-starter and Prize-rescue exposure (Agent 1)

[The source-locked exact joint census](champion-critical-starter-prize-joint.md) finds that in **6.04312%** of valid seven-card champion openings, Mimikyu or Dialga-GX must start Active because no other Basic is present. In **2.36691%**, Prized critical Basics exceed the published single Hisuian Heavy Ball's unprized rescue capacity. After measuring overlap, the union is **8.35673%** (not a game-loss rate). Hypothetical non-Basic-to-second-Ball replacement reduces that static union to **6.25899%** without altering forced critical starters. Independent complete miniature physical-deal enumeration and exact source-fraction cross-checks passed [manual CI 38861318737](https://github.com/FlareZ123/experiment-01/actions/runs/38861318737). No candidate-strength conclusion is justified.

## New opening-hand evidence

[Champion forced Bench-entry starter probabilities](opening-opportunity-cost.md) quantify a 9.731780% chance that an accepted opening offers only Radiant Eternatus/Tapu Lele-GX as Basic starters. This is an exact initial-hand result, not a win-rate claim.


[Bonus-draw access under opponent mulligans](bonus-draw-access.md) extends the opening audit with an exact joint mulligan distribution and accepted-hand card-access probabilities across 29 published placements. The strongest contrast is vs four-Basic Iron Thorns (Shadow Rider V setup access 36.62% before bonuses, 41.40% if all are drawn). This is not a win-rate estimate.

## Agent 43: source-locked evolution timing and policy qualification

[Exact natural turn-two VMAX opportunity](agent43-natural-t2-evolution.md) measures seeing a Shadow Rider V by the end of turn one and its VMAX by turn two. Conditional on a valid seven and no search, champion/Hood/Temple are **18.26% / 22.55% / 17.99%**; after marginalizing opponent mulligan bonuses for the published four-Basic Iron Thorns profile, **23.21% / 28.34% / 22.98%**. These resource events alone do not establish that an evolution is played or that a game is won.

[Single-copy evolution target contention](agent43-evolution-target-contention.md) identifies a pinned Twinleaf SimpleTacticsAi deterministic Active-first bias when a Bench V holds more Basic Psychic Energy than the Active V. The even narrower exact natural two-V/one-VMAX prerequisite occurs in **1.77% / 3.24% / 2.73%** of champion/Hood/Temple valid openings with ordinary draws and no search. A research-side reversible tactic and pinned-engine state fixture test the alternative Bench evolution, with manual-only validation. Both the strength and real-game frequency of this counterfactual remain unresolved.
