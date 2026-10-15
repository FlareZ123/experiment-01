# Energy composition of the published Aichi 2026 Top 32 (Agent 11)

**Source:** [published 29-list printing-aware manifest](full-decklists.json), previously source-audited by other agents. Ranks 23, 25 and 28 have no published complete list. Reproduce with [the pure CommonJS census](../../scripts/aichi_energy_audit.cjs) and [the deterministic test](../../scripts/test-aichi-energy-audit.cjs). The [manual workflow](../../.github/workflows/aichi-energy-census.yml) passed on [run 38821042563](https://github.com/FlareZ123/experiment-01/actions/runs/38821042563).

## Observed deck-construction counts

| Measure | Published field count |
| --- | ---: |
| Full lists observed | 29 |
| Total Energy card slots | 238 |
| Basic Energy slots | 120 |
| Special Energy slots | 118 |
| Decks with at least one Special Energy | 24 |
| Decks with four or more Special Energy | 18 |
| Special-Energy-only decks | 7 |
| Basic-Energy-only decks | 5 |
| Decks containing both | 17 |

**Special-only ranks:** 4 (Raichu Electrode Combo), 5 (Mew Genesect), 6 (Iron Thorns), 7 (Snorlax Stall), 17 (Raichu Electrode Combo), 24 and 29 (Iron Thorns). Their Energy is respectively 12, 4, 8, 4, 12, 8, 8 cards, all Special Energy. The Special-only lists still include other means of pursuing their game plans, and these counts alone cannot establish their vulnerability or win probability.

**Basic-only ranks:** 1 (Shadow Rider Calyrex), 8, 11, 16 and 22 (all four Absol Garbodor). The remaining 17 decks use both kinds.

**Regidrago concentration:** All nine published Regidrago placements, ranks 10, 12, 13, 14, 18, 20, 21, 27 and 32, include three or four Double Dragon Energy copies. Their other Energy cards are Basic Grass and Fire. Published Regidrago counts must not be generalized to ranks 23 and 28, whose exact lists are missing.

### Strategic hypothesis worth testing

In the bundled card snapshot, **Temple of Sinnoh (Astral Radiance 155)** reads: “All Special Energy attached to Pokémon (both yours and your opponent's) provide Colorless Energy and have no other effect.”

The straightforward rules-level implication is that, while Temple's effect applies, **Double Dragon Energy cannot furnish the Grass or Fire Energy** Regidrago VSTAR's Apex Dragon requires. Likewise, Speed Lightning Energy cannot furnish the Lightning Energy printed in Iron Thorns ex's Volt Cyclone cost. These interactions depend on all other board effects and the availability of suitable attached Energy. They are **hypotheses for tested game-state lines**, rather than findings about successful lock establishment or match outcomes.

Temple itself is a Stadium, so opponents may replace it or have alternative Energy and attack routes. The seven Special-only lists each include other Stadium cards; for example, rank 5 lists Sky Field and Path to the Peak, while Iron Thorns ranks 6, 24 and 29 list Thunder Mountain Prism Star. Stadium competition, search access and Supporter contention therefore matter.

A candidate deck that spends slots on Temple or Special Energy removal must be tested for lost consistency, attacker requirements, dead cards against Basic-only opponents, lock timing and opponents' stadium-bump frequency. Four Absol Garbodor placements and the champion use only Basic Energy, so this interference axis is not universal.

### Suggested experimental gates

1. Verify exact Twinleaf effects for Temple of Sinnoh, Double Dragon Energy, Speed Lightning Energy, and opposing Stadium replacement using concrete state-level fixtures matched against card text and the advanced rulebook.
2. Compare fixed candidate lists with and without the proposed disruption package using the *same seeds, both starting seats, and verified adversarial policies*. Preserve every error and non-finished game separately.
3. Record Temple's active-turn frequency, affected Energy, whether intended attacks are truly unavailable, Supporter and search resources spent establishing the Stadium, and opponent replacement timing. An arbitrary “special-only” flag cannot substitute for a game-state transition model.
4. Evaluate all available ranks, especially control and Basic-only opponents; maintain the three missing lists as unknown. Do not infer 99.5% from Energy inventory percentages.

## Scope and reproducibility

The script classifies the nine named Basic Energy types as Basic and other entries under the published manifest's Energy category as Special. It checks each published list totals 60 cards, reports rank-level names and quantities, and performs no legality or rules adjudication. The 238 denominator counts Energy **card slots** across 29 decks, not probability of attachments or shares of observed games. The 29 sourced decklists are a snapshot; refresh the audit if publication or printings change.

**Evidence level:** exact tally of a sourced decklist dataset, successfully checked on manual CI. Tactical efficacy, full-game performance and the central 99.5% objective remain untested.
