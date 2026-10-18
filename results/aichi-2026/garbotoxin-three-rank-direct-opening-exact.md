# First-turn Garbotoxin direct-access census across three actual Aichi lists

**Agent 11, 18 October 2026.** Exact, source-print-counted combinatorial evidence. This is a **resource availability calculation** for source **going first**. It is no measure of opponent policy execution, matchup win rate or competitive strength.

## Inputs and legal action

The [verified registered 60s](full-decklists.json) for ranks 8, 11 and 16 include Trubbish, Garbotoxin Garbodor, Boost Shake and attachable Pokémon Tools. Boost Shake EVS 142 searches an evolution, explicitly permitting first-turn or newly played Pokémon evolution, and immediately ends the turn. Garbodor LTR 68 and BKP 57 have identical relevant Garbotoxin Abilities, active while the Pokémon holds **any Pokémon Tool**. Float Stone BKT 137 and Muscle Band XY 121 can be attached to Trubbish. **Forest Seal Stone SIT 156 can also legally attach to a non-V Pokémon**, although its VSTAR Power is only usable by Pokémon V. Using that Stone on Trubbish gives up its separate VSTAR function.

| Rank | Trubbish | Boost Shake | Float Stone | Muscle Band | Forest Seal Stone | Garbotoxin Garbodor | Other Basics |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 8 | 2 | 1 | 4 | 1 | 1 | 2 | 8 |
| 11 | 2 | 2 | 3 | 1 | 2 | 2 | 9 |
| 16 | 2 | 2 | 4 | 1 | 1 | 3 | 9 |

We require direct access, among the first seven plus first own draw, to **Trubbish, Boost Shake, one eligible Tool**, plus **at least one Garbotoxin Garbodor in the deck after six Prizes**. There is no extra Item, Supporter, Stadium, Ability draw, mulligan bonus, search connector or opponent action. A source player with these cards can play Trubbish, attach Tool and use Boost Shake for Garbodor, subject to any pregame passive constraints.

## Exact results conditional on an accepted initial seven with a Basic

| Aichi rank | Tool = Float Stone / Muscle Band | Also admitting Forest Seal Stone |
| --- | ---: | ---: |
| **8** | **1.612897609579%** | **1.851836170090%** |
| **11** | **2.470613835987%** | **3.389133366966%** |
| **16** | **3.043861618864%** | **3.494125489662%** |

Reduced exact fractions:

| Rank | Excluding Stone | Including Stone |
| --- | --- | --- |
| 8 | 54091677403 / 3353695676760 | 1881968169 / 101627141720 |
| 11 | 797280257 / 32270533152 | 1354685947 / 39971455836 |
| 16 | 35689156879 / 1172496037856 | 10242120731 / 293124009464 |

## Mathematical derivation and verification

From a uniformly shuffled 60, positions 1 through 7 form the starting hand; positions 8 through 13 form six hidden Prizes; position 14 is the first own turn's draw. The union of the seven and fourteenth positions is a uniform eight-subset. Conditional on this eight-subset, Prize cards are a uniform six-subset of the remaining 52. Enumerate multivariate eight-card counts over the six disjoint categories: Trubbish, Boost Shake, eligible Tools, Garbotoxin Garbodor, other Basic, remaining cards.

An eight-subset with two or more Basics admits all eight choices of which card was drawn on turn one while keeping its opening seven legal. If it contains exactly one Basic, only seven choices are legal. Denote this legal orientation count by L, equal to 8, 7 or 0. For any eight-subset containing the three direct resources, let g be the number of Garbotoxin copies among the other 52 cards. Exactly binomial(52,6) minus binomial(52-g,6-g) Prize configurations leave a Garbotoxin searchable in the deck. Sum each six-category multivariate-hypergeometric eight-subset multiplicity, weighted by L and the available-Prize count. Divide by 8 × binomial(60,8) × binomial(52,6), then condition on a legal original seven by dividing by:

P(legal seven) = [binomial(60,7) − binomial(60 − B,7)] / binomial(60,7),

where B is the source count of Basic Pokémon. This exactly accounts for the rare hands containing the only Basic as their subsequent first draw.

**Compiled independent workflow check:** Manual [Aichi opening audit CI 39098983950](https://github.com/FlareZ123/experiment-01/actions/runs/39098983950) on source head 1172c72f **completed successfully**, including the new exact six-fraction assertion step. The [opening evidence artifact](https://github.com/FlareZ123/experiment-01/actions/runs/39098983950/artifacts/12125224985) contains machine-readable aichi-three-rank-garbotoxin-direct.json. This certifies the source inventory counts and implemented mathematical calculation on the repository checkout; it does not run any opponent-policy game.

**Reproducible executable:** [scripts/aichi-direct-garbotoxin-opening.cjs](../../scripts/aichi-direct-garbotoxin-opening.cjs) reads the fixed registered full-decklist manifest, checks source 60-card totals, explicitly verifies the printings and Pokémon Stage assumptions, computes reduced fractions with BigInt, and asserts the six expected results. Independent Python Fraction arithmetic reproduced all six. Fixed-seed Monte Carlo (250,000 permutations per list) gave consistent frequencies.

## Interpretation

These are **restricted direct-access subsets**, smaller than the genuine search-inclusive potential. Quick Ball, Secret Box, Battle VIP Pass, Ultra Ball, Adventure Bag and Pokémon Ability draw can establish more opportunities. Actual execution may be **less frequent** because of strategic resource contention, defensive decisions or opposing passive effects. They must not be used as observed turn-one lock rates.

Previous source experiments [rank8 Secret Box + Boost Shake counterfork](rank8-boostshake-authentic-counterline.md) and [rank11 Oranguru / Battle VIP opening census](rank11-oranguru-firstturn-tool-lock-exact.md) include other potentially overlapping routes. Their estimates cannot be naively added to these figures.

Next gate: preregister actual source-first deal sampling across this direct event and its complement, record source-player true action execution, then test real candidate response choices. There remain **zero independently qualified competitive games** toward the 99.5% fixed-deck target.
