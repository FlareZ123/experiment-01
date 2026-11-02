# Source-registered 29-deck Supporter inventory and native Wally bug reachability

**Agent 18 | 2 November 2026 | exact original source-60 inventory audit, not actual played-Supporter frequency.**

## What is counted

The authenticated [Aichi Open League 2026 original deck archive](../aichi-2026/full-decklists.json) contains **29 complete registered 60-card lists**, with original ranks **23, 25 and 28 missing**. This census counts **physical Supporter copies** in each original list and the intersection of **Wally ROS94** with **old uppercase-name Pokémon-EX** in the same original deck. This establishes a narrow possible payoff and paper-native bug exposure inventory; it does not simulate a match.

The [reproducible CJS census](../../scripts/agent18-source29-supporter-wally-oldex-census.cjs) reads the actual source 60 and every printed Trainer name in the bundled English archive. Eight original-printing names are **absent from that supplied archive**, so they have **explicitly isolated, audited non-Supporter type overrides** rather than being treated as if bundled evidence existed. These are Battle Compressor, Robo Substitute and Target Whistle (Items), Palace Book (Item), Palace Belt (Pokémon Tool), and Thunder Mountain ♢, Wondrous Labyrinth ♢ and Player's Ceremony (Stadiums). Their set/number identities come from the original 60, and the type checks use [Phantom Forces printing taxonomy](https://pkmnex.co.uk/en/set/xy4), [Palace Book](https://bulbapedia.bulbagarden.net/wiki/Palace_Book_%28XY-P_Promo%29), [Palace Belt](https://limitlesstcg.com/cards/jp/BWP/153), [Wondrous Labyrinth](https://limitlesstcg.com/cards/TEU/158), and [Thunder Mountain](https://pokemon.tradingcarddex.com/database/Thunder-Mountain-191-214-Lost-Thunder-details), and the [official Japanese Player's Ceremony SP 127 printing](https://www.pokemon-card.com/card-search/details.php/card/38633/regu/XY). The [four source tests](../../tests/agent18-source29-supporter-wally-oldex-census.test.cjs) assert all 29 identities, source rank distribution, Wally/EX non-coincidence, and type override reproducibility.

## Supporter inventory by original 60

| Field statistic | Printed Supporter copies per 60 |
| --- | ---: |
| Minimum | **2** (rank 26 Meloetta Donk: Carmine x1, Iono x1) |
| Median across 29 ranked originals | **9** |
| Maximum | **24** (rank 24 Iron Thorns) |
| At least 20 copies | Ranks **3, 6, 7, 24, 29** |
| At most 2 copies | Rank **26** only |

This is a **physical deck-inventory** result. Supporter cards can be Prized, discarded, fetched, recycled or denied; many copies do not guarantee the opponent has one in hand on the relevant turn. The rank26 two-Supporter deck is not necessarily immune to Supporter lock, but its planned attacker and draw/actions may depend much more on Items and Energy rather than using Supporters every turn. The tactical payoff of Exeggutor PLF's attack-based Supporter denial is therefore **matchup and game-state dependent**, and cannot be inferred directly from average supporter density. Compare to [the two-turn native Blockade action certificate](../als/agent40-exeggutor-blockade-two-turn-native-and-direct-access-20261102.md): an unblocked opponent turn occurs before the lock in that line.

## Exact Wally and old Pokémon-EX intersection

| Original source identity | Ranks | Notes |
| --- | --- | --- |
| At least one Wally ROS94 | **5, 8, 22** | One Wally each |
| At least one old uppercase Pokémon-EX | **19** | Original rank19 Raging Bolt has one Pokémon-EX |
| **Both in the same original registered 60** | **None of 29** | Exact card-name inventory intersection zero |

This is important for interpreting [the genuine pinned Twinleaf Wally bug](../simulation/agent18-pinned-wally-ex-target-native-bug-and-guard-20261102.md), where Wally can illegally stack Exeggutor PLF on an unrelated Mewtwo-EX BKT if that target exists. We demonstrated the defect and a research-owned fix through compiled native Store scenarios, but **the 29 known original field decks do not contain both Wally and an old Pokémon-EX internally**. Thus no actual baseline original-field game has been shown to exercise that exact illegal move. A future candidate 60 combining them can trigger it and should use the opted-in paper guard. Other legality defects require separate tests.

## Interpretation and next experiment

The result gives a useful *tactical priority hypothesis* for candidate Exeggutor against high-Supporter original sources such as ranks 6 and 24, without asserting that a specific source will be locked or lose. A credible comparison needs unchanged original source 60s, actually chosen and settled Supporter roots before and after Blockade, native owner-only prompts, exact original six-Prize physical card arrangements, adversarial continuation and failure-inclusive rows. The new exact model is a **roster census** and no game-win evidence.

**Coverage: 29/32 original printed field lists. Competitively qualified games: zero. No validated 99.5% field rate.**
