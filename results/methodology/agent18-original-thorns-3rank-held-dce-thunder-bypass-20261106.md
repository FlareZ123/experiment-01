# Agent18: original ranks 6, 24 and 29 direct-held Thunder Mountain / DCE opportunity census

**6 November 2026 | exact finite-population opening arithmetic | source originals only.** Extends [the rank6 disjoint-opening proof](agent18-original-rank6-direct-held-stadium-energy-bypass-20261106.md) using all three published original Aichi 2026 Iron Thorns 60-card name/count inventories in [full-decklists.json](../aichi-2026/full-decklists.json). No native match was executed for this extension; **no paper-competitive game is qualified**.

## Original list differences and physical opening question

The three original decks each have **four Basic Iron Thorns ex TWM**, their **only Pokémon**, exactly one **Thunder Mountain ◇ LOT**, two **Guzma & Hala CEC**, and two **Tag Call CEC**. They differ in Double Colorless Energy (DCE), Trainers' Mail and Guzma counts:

| Original Aichi Top32 rank | Player | DCE SUM | Trainers' Mail ROS | Guzma BUS |
| --- | --- | ---: | ---: | ---: |
| 6 | Kazuma Kashi | **1** | 3 | 3 |
| 24 | Ryoya Fujii | **3** | 4 | 2 |
| 29 | Kohei Hamamichi | **1** | 2 | 3 |

The question is the probability that a Basic-valid initial seven and the first natural going-second draw produce a hand holding **Thunder Mountain and at least one DCE**, with **no held G&H, Tag Call or Trainers' Mail**. These are the connector-free states excluded from the previous direct/Mail **G&H-only** rank6 resource-route census. A card in hand is physically available; an attack still depends on legal Stadium/attachment timing, public attack cost, opponent restrictions, optional Bench, chosen action and actual next turn.

## Exact disjoint-resource probabilities

| Original rank | E: Thunder + at least one DCE held, no connectors | E and only one Basic among eight (solo) | E and at least one Guzma held | E, solo and Guzma held |
| --- | ---: | ---: | ---: | ---: |
| **6** | **0.636384%** | 0.525235% | 0.179566% | 0.153376% |
| **24** | **1.539457%** | 1.259560% | 0.314123% | 0.266822% |
| **29** | **0.707404%** | 0.586309% | 0.195954% | 0.167967% |

Every percentage conditions on a successful Basic-containing seven. **Opponent mulligan-compensation draws are excluded**: an opponent's mulligan can increase the actual opening hand beyond seven before the first natural turn draw, making these exact probabilities a restricted no-compensation reference rather than an exhaustive practical first-turn occurrence rate. The opponent's starting Bench, the source's Stadium/Supporter/Energy quota, lock effects, damage targets, Prize opportunities and follow-on play are **not** included. An extra held Guzma is a possible tactical resource only when a legal opponent Bench target exists. Official [Guzma solo-Bench ruling and prior actual source Store test](../aichi-2026/rank6-solo-thorns-guzma-no-bench.md) support the possibility of gusting without switching one's own sole Active, while showing that the unmodified Store needs an explicit no-opponent-Bench legality guard. The already proven native solo-Guzma mechanics are **not claimed as a new discovery** by this calculation.

Rank 24 has three DCE rather than one, and more connector-free held DCE/Thunder openings in this specifically defined population; its extra Trainers' Mail also reduces the probability of meeting the **zero-connectors** condition. This is an exact marginal deck-composition observation. It does **not** prove rank24's deck, its setup, or any altered fixed contender outperforms another across games. Some connector-bearing openings can be superior; the model excludes them by design.

## Broader direct-held pair, including connector-bearing hands

The **zero-connectors E** rates above are intentionally disjoint from the earlier G&H/Tag/Mail access model. To avoid treating them as the full prevalence of naturally held attack resources, the same exact eight-card calculation also permits any number of those connector cards among the other held cards. The event is **Thunder Mountain plus at least one DCE held by the first own turn**, whether or not a G&H/Tag/Mail is also held.

| Rank | Broader direct-held pair probability | Exact fraction | Strict no-connector E subset |
| --- | ---: | --- | ---: |
| **6** | **1.278355%** | `13697/1071455` | 0.636384% |
| **24** | **3.499748%** | `722693/20649860` | 1.539457% |
| **29** | **1.278355%** | `13697/1071455` | 0.707404% |

Ranks6 and29 have identical broader probabilities because they have the same four Basics, one Thunder and one DCE; the number of held G&H/Tag/Mail and Guzma does not matter once those card identities are allowed as generic fillers. Rank24's three DCE copies raise the exact direct-held opportunity to 3.499748%. **The broader direct-held event overlaps** the G&H/Tag/Mail search route. It must not be added to the prior route probability without explicit intersection accounting. The E subset is suitable for the previously stated disjoint union; neither version includes opponent play or realized attack actions.

## Exact fractions and reproducible count

| Event | Rank 6 | Rank 24 | Rank 29 |
| --- | --- | --- | --- |
| E | `113129/17776836` | `31471673/2044336140` | `3615428/511084035` |
| E + exactly one Basic | `2021/384780` | `30401/2413620` | `188/32065` |
| E + held Guzma | `1223641/681445380` | `83399/26549820` | `4005959/2044336140` |
| E + solo + held Guzma | `40721/26549820` | `86583/32449780` | `991/589996` |

Exact denominator is `D=[C(60,7)-C(56,7)]×53=8,177,344,560` across all three decks. Marginalize the intervening six random Prizes when calculating the first seven plus one draw. Given an unordered eight-card set with `b` Basic Pokémon, **eight** possible final-card choices preserve a legal initial seven if `b>=2`. If `b=1`, **seven** choices preserve a legal seven because the last card cannot be that sole Basic. For each `b`, DCE count `d>=1`, and held Guzma count `g`, select Thunder once, `b` of four Basics, `d` of the source's actual DCE copies, `g` Guzma copies, and the remaining observed cards from its source-specific other-card population after excluding all G&H, Tag Call and Mail. Multiply each combination by seven or eight valid final-card choices. Sum with exact BigInt and reduce by integer GCD.

An independent Python `math.comb` enumeration generated all twelve narrow exact fractions and checked the original rank6 rows against its previously independently derived method. [The committed CommonJS implementation](../../simulation/evaluation/agent18-thorns-held-thunder-dce-allranks.cjs) reads the three named inventories from the actual repository source, asserts each is 60 and has only four Basic Thorns, then performs the count with integer arithmetic. [Nine Node regression cases](../../tests/agent18-thorns-held-thunder-dce-allranks.test.cjs) cover all source counts and twelve fractions, old rank6 agreement, monotonic subset relationships and unsupported-rank rejection. All nine ran and passed in a local Node22 copy of the module; the local test roster preserved the authenticated relevant printing counts and modeled remaining cards as generic fillers. **The exact committed GitHub files have not yet had their own CI run**, and a full native real-Store execution with either source rank24/29 has not been performed for this result.

## Complementary K0 Prize-exhaustion risk

An opening-resource comparison should also consider whether source-specific singleton or repeated resources were removed into the six face-down Prizes before the first own turn. Before the first deck search (**K0**), players do not know their exact Prize contents. Condition on a legal initial seven containing at least one Iron Thorns, followed by six Prizes sampled from the remaining 53.

| Event: all specified copies in the initial six Prizes | Ranks 6 and 29 (one DCE) | Rank 24 (three DCE) |
| --- | ---: | ---: |
| **Every DCE printed in the original sixty is Prized** | **10.141805%** | **0.061002%** |
| Singleton **Thunder Mountain is Prized** | 10.141805% | 10.141805% |
| **All DCE and Thunder Mountain are simultaneously Prized** | 0.871828% | 0.003258% |
| **Either** every DCE **or** Thunder is Prized (overlap corrected) | 19.411781% | 10.199549% |

The exact fractions for `all DCE`, `Thunder`, `both` and the inclusion-exclusion union are:

- Ranks 6/29: `79029/779240`, `79029/779240`, `7473/857164`, `415977/2142910`.
- Rank 24: `2353/3857238`, `79029/779240`, `11101/340722690`, `417026131/4088672280`.

If a specified group has `k` designated non-Basic physical cards, none can be in the first seven when every copy is Prized. Thus the exact probability is

`P(all k in Prizes | legal opening seven) = ([C(60-k,7)-C(56-k,7)]/[C(60,7)-C(56,7)]) × [C(53-k,6-k)/C(53,6)]`.

This conditions correctly on the opening Basic requirement; a naive unconditioned `C(6,k)/C(60,k)` differs slightly. The original rank24 list has more than one DCE copy, so the probability **all** are physically unavailable in Prizes is two orders of magnitude lower than in the one-copy lists. That event's strategic impact remains conditional: Speed Lightning and other Energy, Stadium replacements, alternative costs and Prize retrieval might still permit attacks even when every DCE or the sole Thunder is initially Prized. No claim of an unwinnable hand or game loss is made.

The committed all-ranks CJS now includes `allAttackResourcesPrized(rank,group)` with `group='dce'|'thunder'|'both'`. Three additional exact-fraction tests bring the locally executed pure Node suite to **9/9 passing tests**, using the same authenticated source group counts. No new native or field matches were run.

## Use in the shared research objective

These are low-frequency but strictly positive connector-free physical routes for each of the three source decks. When evaluating opponent policy competence or constructing a fixed contender to handle the entire 32-rank field, the first-turn source owner can reasonably consider already-held Energy, Stadium and conditional Guzma before consuming G&H or a search connector. A *single shared owner-visible policy* must make that decision by current physical state, not original rank, seed, opponent identity or hidden Prize knowledge. More importantly, aggressive disruption may interact differently with a source holding multiple DCE (rank24) than with a singleton source (ranks6/29); that is a **hypothesis requiring complete matches**.

Benchmark at this checkpoint: **29/32 original full card-name/count lists authenticated, ranks23/25/28 missing, selected final 60 absent, zero competitively qualified games, 99.5% unproven**.
