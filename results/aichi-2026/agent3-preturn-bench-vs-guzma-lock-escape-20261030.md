# Setup Bench safety versus Guzma lock escape in the Aichi source field

**Agent 3 | 30 October 2026 | exact source-hand mathematical events; no settled native game.**

An Active **Jellicent ex WHT45** locks the opponent's Items and Tools from hand through Oceanic Curse. The printed **Guzma BUS115** remains an available Supporter line while that Ability is active. It can switch a candidate Benched Pokémon into the Active position, ending Jellicent's Active-only lock. A candidate without a Bench denies this particular gust target.

The [rank26 Meloetta Donk setup calculation](agent3-meloetta-donk-lone-basic-setup-risk-20261030.md) identifies the opposing pressure: with 12 total Basics, a candidate Basic-valid initial seven, and all optional opponent-mulligan bonus draws, **44.907837%** of candidate setups have only one Basic Pokémon. A source-first rank26 that genuinely Knocks Out that lone Active before candidate turn would win by leaving no Pokémon in play. Adding a second setup Basic protects against a *single-Knock-Out* loss but supplies the opponent a Guzma target in all matchups.

The exact Aichi original corpus contains **48 Guzma copies across 25/29 authenticated original source 60s**. These are printed cards, not a played-action census.

## Exact first-turn source Guzma availability

The [BigInt calculator](../../scripts/agent3-jellicent-guzma-setup-counter.cjs), [three V8-pass tests](../../tests/agent3-jellicent-guzma-setup-counter.test.cjs), and independent combinatorial calculation condition source's original seven on a valid Basic. One ordinary source turn draw is included. Six Prizes are implicitly marginalized using exchangeability.

| Source rank | Original Basic copies | Guzma copies | Guzma in first eight, conditioned valid seven |
| ---: | ---: | ---: | ---: |
| 2 Vileplume Control | 14 | 2 | **24.115761%** |
| 6 Iron Thorns | 4 | 3 | **32.592570%** |
| 11 Absol Garbodor | 11 | 2 | **23.807914%** |
| 15 Lopunny Vileplume | 14 | 2 | **24.115761%** |
| 26 Meloetta Donk | 12 | 0 | **0%** |

These are access probabilities, **not probabilities of actually using Guzma**. The player going first cannot play a Supporter on its first turn; a source going second may, if there is a legal Benched target, Supporter quota and no other preclusive effect. Source search, draw, future turns and competing Supporters are omitted.

The [candidate joint two-Basic setup intersection](agent3-secretbox-bench-safe-joint-opener-20261030.md) demonstrates that the 4F/4J/4Boost/4Lab/4Hood/4Arven/1 Secret Box 12-Basic construction has **24.450935%** search-only double-lock opportunity going second, falling to **15.514351%** when the initial seven must also contain a second Basic. This is a pre-combat safety condition, not actual survival probability. The source rank26 itself has zero Guzma, while 25 other published sources collectively carry Guzma, producing a genuine opponent-specific Bench tradeoff.

**Native falsification gate:** In the existing bilateral chooser, compare candidate-first Active Jellicent board **without a Bench** to one with a legally set second Basic, holding the original source rank2 or6 deal constant. An opponent-owned Guzma must be chosen, Store accepted, switch the Benched target Active and immediately remove the Item lock if all conditions apply. Separately, original source-first rank26 must actually demonstrate an executable first-turn single-Active KO before any claim that the candidate's solo setup is automatically fatal. Candidate pregame Bench placement may respond to legitimate **public opponent mulligan reveals**, but must never inspect an unrevealed source card.

**Conclusion:** maximizing Bench safety and denying Guzma share opposing demands across this fixed 32-list benchmark. These mathematical source-access results motivate an owner-information-safe pregame Bench policy, and are not a validated complete 60 or tournament win rate. **29/32** original source lists authenticated, **zero** competitive-qualified games.
