# Agent 42: Search-assisted Wobbuffet Turn 2 against Iron Thorns

**17 October 2026. Evidence type:** exact finite-population and hypergeometric source-inventory calculation with a restricted, K0-safe Item policy. This is an *opening resource-opportunity model*. No Twinleaf match win is estimated here.

## Strategic question

Active Wobbuffet PHF 36 suppresses an opposing Active Iron Thorns ex Initialization while preserving Psychic Shadow Rider Calyrex VMAX Underworld Door. It simultaneously suppresses the Dragon-type Radiant Eternatus Climactic Gate. [The companion midgame Store action test](agent42-wobbuffet-thorns-t2.md) confirms a correct-turn-owner Underworld Door Energy attachment and two-card draw. Can the Temple candidate instead naturally evolve Shadow Rider by T2, when one-use Pokemon and Energy search Items are available?

The frozen [Temple v1 60-card source](candidate-temple-shadow-rider.json) supplies **Wobbuffet1, Shadow Rider V4, VMAX3, Psychic Energy11, Fog Crystal4, Mysterious Treasure4, Quick Ball1, 32 other cards**. It has 15 starting Basics. The three published Iron Thorns ranks 6, 24, 29 have four starting Basics each.

## Exact opportunity results

| Accepted opposing mulligan bonuses | No search: direct V/VMAX/Energy | Search-assisted restricted Item policy |
| ---: | ---: | ---: |
| 0 | 1.34250139% | **6.08700043%** |
| 1 | 1.79657051% | 7.23031087% |
| 2 | 2.28805572% | 8.23439596% |
| 3 | 2.80565266% | 9.09639441% |
| 4 | 3.33947260% | 9.82481457% |
| 5 | 3.88115468% | 10.43367397% |
| **Exact four-Basic Iron Thorns offer distribution** | **2.04106361%** | **7.43947655%** |

Every percentage conditions on the Temple player's accepted initial seven. Wobbuffet must be among that **original seven** and chosen as Active; additional cards offered by the opposing player's mulligans may supply V, VMAX, Energy or search Items. We assume the player accepts every offered bonus card, capping at 45 so two normal draws remain possible. Exact bilateral offer distribution follows [Agent 9's setup audit](bilateral-mulligan-externality.md). The 45+ tail has probability approximately 1.025e-10 and uses the direct-draw terminal scenario because searching V would exhaust the deck before the T2 mandatory draw.

With zero extra cards the restricted Item package increases the observed T2 resource opportunity by **4.74449904 percentage points** over the direct-only event. With the Iron Thorns four-Basic bonus distribution the difference is **5.39841294 points**. This quantifies why the narrower no-search measurement cannot be treated as the complete setup probability.

## What the modeled turn can do

The player starts Wobbuffet Active from their first seven. By the end of their first turn they can Bench Shadow Rider V, either by directly drawing V or using one available Quick Ball, Fog Crystal or Mysterious Treasure to take an unprized V from deck. That T1 search removes the actual V from the deck and reshuffles before the T2 draw. On T2 the player draws normally, evolves the V into VMAX from hand or searches an unprized VMAX with a still-unspent Mysterious Treasure, then supplies a Psychic Energy from hand or fetches one with a still-unspent Fog Crystal. The resulting VMAX/hand-energy state could use Underworld Door in the staged opponent lock environment.

Search Items are **single-use connectors**. Fog Crystal used for V cannot also fetch Energy. Mysterious Treasure used for V cannot also fetch VMAX. The source file's Quick Ball counts as a Basic search only. The selected T1 connector maximizes success over the unknown random Prize placements and T2 draw using just the first-turn observed hand composition. This is a restricted **K0 policy**: it does not choose an Item with foreknowledge of the actual upcoming draw or inaccessible Prizes. After T1 search, target visibility becomes K1 where card text permits inspection.

### Important deliberate optimism and omissions

Mysterious Treasure and Quick Ball have discard requirements. This model **assumes those payments can be made while protecting every strategically needed card**, an optimistic simplification that requires DCI/AMR evaluation before real play. It also omits Arven, additional draw, Item chaining outside the named categories, other Basic search, Hisuian Heavy Ball, Energy attachment decisions, attacks, Supporter contention, Bench competition, hand disruption, knockouts, lock collisions and the opponent's response. These omissions mean the percentage is neither a lower bound nor an upper bound on real-game successful T2 setups. It is the **exact result for the explicitly restricted connector decision system**. It says nothing about a matchup game-win rate.

## Mathematical method

Excluding the singleton Wobbuffet, partition the remaining 59 physical cards into the seven source-verified groups `[4,3,11,4,4,1,32]`. Fix Wobbuffet in the initial seven. The remaining six opening cards, all accepted bonus cards and first ordinary turn draw form a uniformly drawn subset of size `7+d` from those 59. Enumerate each category allocation with its exact multivariate hypergeometric multiplicity.

For each observed hand, choose the best T1 V-search connector by maximizing its conditional success over random Prizes and the T2 shuffled-deck draw. An exact six-Prize calculation checks whether all V or all VMAX are Prized; the two complete-prizing events cannot coincide when all four V and all three VMAX are otherwise unseen. Conditional expected remaining deck card counts use integer combinations, including the loss of one V on a successful T1 V search. After the T2 draw, exactly one remaining Mysterious Treasure and one remaining Fog Crystal can solve separate missing VMAX and Energy channels. All weighted counts are computed with `BigInt` before final presentation.

[Executable source-derived model](../../scripts/aichi-wobbuffet-thorns-item-t2.cjs), [independent source-Prize enumeration tests](../../tests/aichi-wobbuffet-thorns-item-t2.test.cjs) and a [manual-only archive workflow](../../.github/workflows/aichi-radiant-start-tradeoff.yml) are committed. The test suite independently enumerates physical six-Prize combinations and each post-search T2 draw for five distinct hands, comparing direct simulation multiplicities with the closed-form Prize moments. It also checks source counts, exact 0..3 bonus fractions, 45+ tail treatment, opponent-weighted rate, and decomposition by chosen connector. **All passed in [CI 38999897924](https://github.com/FlareZ123/experiment-01/actions/runs/38999897924)** at research revision `866f15751a76e4c8807f9d1c17615e77b28b800a`.

## Next research gate

The most consequential follow-up is a **source-dealt two-sided turn replay with an AMR-aware legal discard policy** and a competent Iron Thorns direct-attack response. Iron Thorns Volt Cyclone does 140 versus Wobbuffet's 110 HP, so a first-window KO could invalidate a nominal T2 opportunity. Compare against the actual unchanged rank-1, Hood Shield and Temple candidate 60s, retain both physical seat roles and fixed random seeds, and report actual Prize-taking and game termination only after the simulator is qualified. The full 32-opponent 99.5% objective remains unverified.
