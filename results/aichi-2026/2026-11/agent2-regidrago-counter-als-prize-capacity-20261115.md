# Hood Shield Shadow Rider: Regidrago counter-ALS Prize-capacity analysis

**Agent 2 | 15 November 2026**

## Question

Hood Shield Shadow Rider v1 preserves the matchup-specific line:

**Mimikyu GRI 58 Copycat → opposing Regidrago VSTAR Apex Dragon → Dialga-GX UPR 100 Timeless-GX from the player's discard pile.**

This note asks how often the three-card access package can be made unavailable by the six Prize cards alone, and whether a second Hisuian Heavy Ball improves that package more efficiently than duplicating either Pokémon.

## Exact v1 package

- Mimikyu GRI 58 ×1 — Basic Psychic Pokémon;
- Dialga-GX UPR 100 ×1 — Basic Dragon Pokémon; this Dragon printing is required for Apex Dragon;
- Hisuian Heavy Ball ASR 146 ×1 — Item that can retrieve one Basic Pokémon from the Prize cards;
- Mysterious Treasure ×4 — searches either Psychic or Dragon Pokémon when a card is discarded.

The list has 14 Basic Pokémon. Hisuian Heavy Ball permits playing any number of Item cards during a turn, so two unprized copies can retrieve two different Prized Basics in the same turn if no other effect prevents Item play.

## Method

The script enumerates the exact standard setup distribution:

1. Draw a seven-card opening hand, conditioned on containing at least one Basic Pokémon (the final legal hand after any mulligans).
2. Draw six Prize cards uniformly from the remaining 53 cards.
3. A required Pokémon is missing only when none of its copies is in the opening hand and every remaining copy is in the six Prizes.
4. Optimistically treat every Heavy Ball copy not in the six Prizes as available, whether already in hand or later accessed from the deck.
5. Prize-only access fails when the number of missing required Pokémon types (Mimikyu and/or Dialga) exceeds the number of Heavy Ball copies not in the Prizes.

This is an exact combinatorial count over legal opening-hand/Prize pairs, not a Monte Carlo estimate. The reproducible standard-library implementation is [agent2-regidrago-counter-als-prize-capacity-20261115.py](agent2-regidrago-counter-als-prize-capacity-20261115.py).

## Results

| Package | Basic count | Prize-only access failure, conditional on a legal opening 7 |
| --- | ---: | ---: |
| v1: 1 Mimikyu / 1 Dialga / 1 Heavy Ball | 14 | **2.366909%** |
| Add a second Heavy Ball | 14 | **0.219492%** |
| Add a second Mimikyu instead (cut a non-Basic) | 15 | 0.943573% |
| Add a second Dialga instead (cut a non-Basic) | 15 | 0.943573% |

For v1, the exact count is 180,773,768,498,400 failing pairs out of 7,637,545,871,155,200 legal opening-hand/Prize pairs. With a second Heavy Ball, it is 16,763,792,549,504 out of the same denominator.

A second Heavy Ball reduces this idealized Prize-only failure rate by **90.7266%** (about 10.78×). It is more effective on this narrow metric than adding a second copy of either Pokémon. The comparison variants that add a Basic Pokémon assume the cut is a non-Basic card, increasing the list's Basic count to 15.

## Interpretation

The v1 package has two distinct one-of Basic payloads but only one one-use Prize-recovery resource. A second Heavy Ball increases recovery capacity: if both Mimikyu and Dialga are Prized, two unprized Heavy Balls can retrieve both; if only one is Prized, either available copy can retrieve it. The card is therefore a flexible recovery connector rather than merely redundancy for one Pokémon.

This is a concrete one-slot variant worth comparing against v1 after the current V3 execution gate is accepted. It does **not** justify a specific cut, does not change the frozen v1 list, and does not establish an improved Regidrago matchup. The slot cost must be compared against the lost function of the card removed; cutting the second Stealthy Hood, for example, would trade away redundancy against opposing Tool removal.

## Limitations

This result measures only Prize-configuration failure under optimistic access assumptions. It is not a probability that the counterline is executed or that the game is won.

- It assumes every unprized Mimikyu and Dialga is searchable/usable. Mysterious Treasure's discard cost, hand contents, and sequencing are not modeled.
- It assumes every Heavy Ball not in the Prizes can be accessed and played. A Heavy Ball still in the deck may require Arven or a natural draw; Supporter contention, Item lock, and discard decisions are omitted.
- It assumes a Heavy Ball can be preserved until needed and that no effect prevents it from retrieving a Basic Pokémon.
- It does not model whether the opponent used Apex Dragon on the immediately preceding turn, Mimikyu's Active position and two-Energy payment, Dialga's placement in the discard pile, GX-marker availability, or opponent counterplay.
- It does not estimate any of the 11 Regidrago matchups, aggregate field performance, or a game win rate.

The idealized figure is therefore a lower bound on total counterline inaccessibility once card access, sequencing, locks, and opponent interaction are included. Keep the distinction between a mathematically demonstrated Prize-capacity property and untested matchup strength.

## Decision

Preserve Hood Shield Shadow Rider v1 unchanged. Add a second-Hisuian-Heavy-Ball variant to the future candidate comparison only if it can be tested as a fixed 60-card list against the same authenticated field and equally competent policies. No card swap is promoted on Prize arithmetic alone.
