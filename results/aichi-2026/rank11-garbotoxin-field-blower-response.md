# First reply to a rank-11 turn-one Garbotoxin: Arven and Field Blower access

**Agent 7, 18 October 2026 UTC. Exact 60-card source-calibrated resource mathematics; no match win-rate inference.**

## Decision context and source evidence

[Agent 6's compiled rank-11 early-lock source fork](rank11-firstturn-boostshake-source-fork.md) and [live lock-exposure audit](rank11-live-underworld-lock-exposure.md) show a legitimate actual-source first-turn Tool-bearing Garbodor BKP followed by a Shadow Rider VMAX **Underworld Door suppressed** on global turn four. Those opponent-policy tests exposed a significant deficiency in the old generic AI, which often failed to establish early Garbotoxin. The ensuing first response is a useful validation target for fixed candidate decks.

The two distinct 60-card Shadow Rider lists studied here are [the published rank-1 champion reference](benchmark-shadow-rider.md) and [the frozen Hood Shield v1 challenger](candidate-hood-shadow-rider.md). Both have **14 starting-eligible Basic Pokémon** and **one Field Blower GRI 125**. Hood adds **one Arven SVI 166** and **two Stealthy Hood UNB 186**, replacing other source cards. Under the stated opponent state, the opponent has Garbodor with a Tool on the Bench, its **Garbotoxin** removes Pokémon Abilities, and the challenger is **going second on its first turn**. Garbotoxin does not itself prevent Item or Supporter cards from being played.

Field Blower, an Item, removes an opposing Pokémon Tool and disables Garbotoxin immediately. Arven, a Supporter permitted on the first turn *going second*, can search Field Blower plus a distinct Pokémon Tool including Stealthy Hood; that searched Item can subsequently be played. Neither card needs an activated Pokémon Ability, unlike Tapu Lele-GX's Wonder Tag or Forest Seal Stone's Star Alchemy under Garbotoxin. These card-text paths are documented by [Arven SVI 166](https://www.serebii.net/card/scarletviolet/166.shtml), [Field Blower GRI 125](https://www.serebii.net/card/guardiansrising/125.shtml), [Garbodor BKP 57](https://www.serebii.net/card/breakpoint/057.shtml), and the supplied Advanced Player's Rulebook.

## Exact restricted resource events

Start with a uniformly shuffled 60, a valid opening seven containing at least one Basic, six unknown Prizes, and the normal first-own-turn draw. These are **eight observed cards**, no optional opposing-mulligan bonuses or extra draws. The relevant card populations are partitioned into Basic / Arven / Field Blower / Hood / all others:

| Frozen candidate | Basic | Arven | Blower | Hood | Others |
| --- | ---: | ---: | ---: | ---: | ---: |
| Rank-1 source champion | 14 | 0 | 1 | 0 | 45 |
| Hood Shield v1 | 14 | 1 | 1 | 2 | 42 |

A direct Field Blower in the initial eight can be played to remove the already equipped opposing Garbodor Tool; it does not require a Supporter. An *additional* Arven route requires Arven in those eight, Field Blower **absent from those eight** and **unprized/searchable in deck**. The two events are disjoint. For a multi-axis subevent, require Arven in the eight plus both Field Blower and **at least one Hood** somewhere in the eight or accessible non-Prize deck cards. This last event counts simultaneous **resources**, even when both cards were already seen, and does not assert that Hood is needed to make the immediate Field Blower effect legal.

| First-response opportunity conditional on own legal opening seven | Rank-1 champion | Hood Shield v1 |
| --- | ---: | ---: |
| Direct Field Blower in first eight | **12.772841963165%** | **12.772841963165%** |
| Additional Arven → unprized Field Blower | 0% | **10.034120405196%** |
| **Direct Blower or Arven search** | **12.772841963165%** | **22.806962368361%** |
| Arven and both Blower/Hood resources accessible | 0% | **11.358399469521%** |

The absolute resource-opportunity gain for Hood's Arven slot is **10.034120405196 percentage points** over the unchanged champion under this narrow condition. **It is not an expected game win-rate gain**, because using Arven consumes the only ordinary Supporter for the turn; early ability recovery may compete with drawing, energy development, evolution access or a more valuable Tool target.

### Reproducible counting

The standard-library-only [exact Python script](../../scripts/rank11_garbotoxin_field_blower_response.py) enumerates all bounded compositions of eight seen cards among five disjoint source categories, weighted by `product_i C(count_i, observed_i)`. If the eight contain exactly one Basic, only seven choices for which one is the eighth card leave a valid initial seven; otherwise all eight positions qualify when at least two Basics are seen. The exact legal-initial-seven normalization is `1 - C(46,7)/C(60,7)`.

For a first-eight composition with directly observed Arven but no Field Blower, exactly `C(51,6)` of `C(52,6)` subsequent Prize configurations leave the singleton Blower in the deck. For the Arven/Blower/Hood joint resource event, if neither Hood is initially seen, subtract `C(49,4)` when Blower is also unheld or `C(50,4)` when Blower is held, representing both remaining Hood copies being Prized. Every term uses exact integers and `Fraction`; we divide by `8 * C(60,8) * C(52,6)` and by the legal-seven probability. The exact Hood direct/Arven union is `30464847/133576960`; direct singleton Field Blower is `8530787/66788480`.

The independent seeded **300,000-deal** physical-category shuffle check (seed `20261060`) produced **257,880 legal openings**, observed direct Blower **12.709012%**, Arven-only additional rescue **10.060105%**, and simultaneous Arven/Blower/Hood **11.393284%**, within 1.0 binomial standard deviation of each exact rate. This check is separate from executable Pokémon game-State tests.

Source card listings:
- [Champion exact source 60](full-decklists.json) (rank 1).
- [Hood Shield fixed print-aware 60](candidate-hood-shadow-rider.json).
- Pure [exact regression](../../tests/test_rank11_garbotoxin_field_blower_response.py).
- Existing manually triggered [Aichi opening audit workflow](../../.github/workflows/aichi-opening-audit.yml), with exact rate tests and generated text output.

## Limits and strategic use

These percentages condition on an **already equipped Garbodor**, with no simultaneous player-level Item lock and with Arven usable as the second player's first-turn Supporter. They exclude non-direct connections through draw Supporters, hand reset, prize recovery and any printed response that demands unavailable Bench slots or discards. They do not model Item lock, searching the opponent's deck, switching the Garbodor in/out, opponent retooling, repeated lock turns, actual defending Pokémon, drawn/Prized attacking VMAX pieces, or an opponent player's adaptive reply.

The direct-Blower opportunity is identical across the two decks under this model because they have identical **Basic=14 and Blower=1** relevant populations. The Hood challenger has a specific extra first-turn search channel; its cost is increased Supporter contention and deck-slot displacement, while the additional Hood resource may help preserve later Underworld Door after an opponent retools. One first-turn opportunity cannot prove a sustained attacker or a favorable matchup.

**Next falsification:** In Agent6's existing real rank-11 early-lock source fixture, find a separate dealt seed where the Hood candidate has Arven in its initial eight and Field Blower unprized, then verify through actual Store prompts that the candidate chooses and executes the response without leaked hidden opponent cards. Contrast with source champion under the same opponent decision policy and both start orders; preserve the first actionable opportunity's actual costs. No effect on **29/32 exact source coverage, zero qualified games or the 99.5% unproven target**.
