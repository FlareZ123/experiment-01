# Champion Marshadow anti-Stadium access: exact legal-opening, Prize, and Bench-position constraints

**Agent 5 · 31 October 2026 · exact combinatorics of the published original rank-1 physical 60, independent of native match outcomes.** This complements [the both-seat native Resetting Hole anti-Thunder Mountain proof](agent5-marshadow-vs-source-thunder-prism-native-20261031.md). It must not be presented as a head-to-head win percentage or a simulation of strategy.

## Source-dependent inventory and setup

The original 60 of final rank 1, Yasunori Kato, in [`full-decklists.json`](full-decklists.json) contains exactly:

| Role for opposing Thunder Mountain ♢ | Original physical copies | Printed condition |
| --- | ---: | --- |
| **Marshadow UNB 81** | 1 | Basic Psychic; Resetting Hole must activate **from Bench** |
| **Hisuian Heavy Ball ASR 146** | 1 | Can exchange itself for a Basic Pokémon in own face-down Prize cards |
| **Sky Field ROS 89** | 2 | Can play a replacement Stadium if ordinary Stadium rules allow |
| **Dimension Valley PHF 93** | 1 | Can play a replacement Stadium |
| **Fog Crystal CRE 140** | 4 | Search for Basic Psychic, including Marshadow, without discarding another card |
| **Mysterious Treasure FLI 113** | 4 | Search for Psychic/Dragon Pokémon, with one-card discard payment |
| **Quick Ball FST 237** | 1 | Search for Basic Pokémon, with one-card discard payment |
| Other original Basics | 13 | Can be chosen Active while putting Marshadow on Bench |
| Remaining nonbasics | 33 | All other original cards |

Physical total **60**. Basic total **14**, including the singleton Marshadow. The grouping and counts are asserted by [a deterministic source-loaded exact BigInt enumeration](../../scripts/agent5-marshadow-opening-access.cjs), which derives each category from the unchanged rank1 source and refuses any changed inventory.

The setup model draws a uniformly random initial seven. If it has no Basic, mulligan and redraw until at least one Basic appears. It then sets six face-down Prize cards from the other 53 physical cards, exactly as in the supplied Advanced Player's Rulebook §G and §H. It excludes extra opponent-mulligan draws, future turn draws, deck searches, retrieval effects, timing of opposing Stadium play, and all action policy.

## Exact initial seven-card conditional availability

The probability of a valid initial seven before mulligans is
`1 - C(46,7)/C(60,7) = 86.1409319%`. Among **valid** opening sevens, the following are exact physical-access *upper bounds*, under increasingly optimistic permissions:

| Opening resource condition | Exact probability, given valid starting seven |
| --- | ---: |
| Already holding **Marshadow or one of three replacement Stadiums** | **39.974768%** |
| Above, or Fog Crystal into unprized Marshadow, or held Hisuian Heavy Ball recovering Prized Marshadow | **62.451185%** |
| Above, additionally counting held Mysterious Treasure or Quick Ball into unprized Marshadow **assuming a legal discard payment** | **78.682390%** |

For each non-Stadium seven that lacks Marshadow, the singleton is either in the remaining 47-card deck with probability **47/53**, or in the six Prize cards with probability **6/53**. A held Heavy Ball helps only in the latter case. These terms enter the exact combinatorial enumeration with their physical hypergeometric weights. The Item routes require the relevant held Item, eligible Bench placement, and actual resolution without any Item lock, and the discard-search upper bound additionally presumes affordable discards under DCI/UDP constraints. None of the reported proportions certifies the listed effect was played.

### Correction for a forced Active Marshadow

The first upper bound itself has a positional overcount. When **Marshadow is the only Basic in the opening seven** and none of the three Stadiums is held, the player **must begin with Marshadow Active**, which cannot use its Bench-only Resetting Hole immediately. This precisely described subset has conditional probability:

```text
P(Marshadow is sole Basic, no Stadium | valid initial seven)
  = C(43,6) / [ C(60,7) - C(46,7) ]
  = 1.8325156161%.
```

Subtracting that subset from the three raw access screens gives *opening board-position-feasible* screens under the same generous Item assumptions:

| Opening resource condition | Original access screen | Bench-position-adjusted screen |
| --- | ---: | ---: |
| Held Marshadow or replacement Stadium | 39.974768% | **38.142252%** |
| Add Fog Crystal / prized-Heavy-Ball routes | 62.451185% | **60.618669%** |
| Add discard-cost search Items | 78.682390% | **76.849874%** |

The subtraction identifies only one provable opening-board failure, so the adjusted values remain **upper bounds on immediate action playability**. A player might establish another Basic later, move Marshadow from Active to Bench, or draw another Stadium; those future lines are outside the seven-card opening screen.

### A distinct Prize-only tail

If **Marshadow and its Hisuian Heavy Ball are both in the initial six Prize cards**, the sole direct recoverable-Marshadow chain starts inaccessible until a Prize is taken or another recovery becomes relevant. The exact initial-six probability is `(6/60)(5/59) = 1/118 = 0.8474576271%`. This does not mean the game's Stadium countermeasures disappear, because Sky Field and Dimension Valley are separate alternatives.

For all five physically distinct cards (**Marshadow, Heavy Ball, Sky Field ×2, Dimension Valley**) to be simultaneously in the initial six Prizes, the exact probability is `C(55,1)/C(60,6) = 1/910252 = 0.0001098596872%`. This tiny event is solely a *simultaneous Prize-membership* condition. Cards can still be unavailable for practical reasons when none of those five is Prized, including draw timing, Item restrictions, Stadium or Ability locks, forced Active position, Bench crowding, and competing play sequences. It is therefore **not** a bound on game losses.

## Strategic consequences and failure modes

The source rank1 has three independent counter families, but a physical source card being outside Prizes is insufficient to establish that the line occurs in time. An opponent's Item lock collapses Fog Crystal, Heavy Ball, Treasure and Quick Ball branches; only the direct opening resources survive this narrow availability screen, at most **38.142252%** with the Bench-position correction. Iron Thorns' own Initialization suppresses Rule Box Pokémon Abilities while leaving non-Rule-Box Marshadow's Resetting Hole intact, but a separate Basic Ability lock such as Silent Lab changes that premise.

Furthermore, a Stadium replacement may be strategically inferior to preserving Sky Field for an eight-Pokémon Bench line, or using Dimension Valley for Psychic attack efficiency. The singleton Marshadow can cost a vital Bench position before use and its self-discard may be welcome only if the opponent Stadium threat truly merits it. These choices need state-aware owner-root arbitration and **native settled Store receipts**, not maximum theoretical access counts.

## Reproducibility and scope boundary

Run [`scripts/agent5-marshadow-opening-access.cjs`](../../scripts/agent5-marshadow-opening-access.cjs) in the repository against the published rank1 source dataset. The source-loaded exact numerators and denominators, including enforced 60-card category totals and legal seven-Basic conditioning, **passed [manual compiled CI 41168811418](https://github.com/FlareZ123/experiment-01/actions/runs/41168811418)** (pinned workflow head `787f9c250841c7d96b9170e402d79eb12dcb185e`; [artifact 13029818982](https://github.com/FlareZ123/experiment-01/actions/runs/41168811418/artifacts/13029818982), SHA-256 `5ccb28fea1d56e904b5e1ebe555e4563d6d3ff1053a4c8b48bf9bc5bb5819973`, contains `agent5-marshadow-opening-access.json`). The first attempt failed only because its test compared reduced rational numerators against still-unreduced exact fractions; the generator now reduces by BigInt GCD and passed all assertions. Its exact rational numerators/denominators are checked by the existing manual-only [native development workflow](../../.github/workflows/agent5-owner-root-native.yml) *before* building Twinleaf; the script requires no simulator and no RNG. The forced-Active adjustment and Prize-only tails above are independently derived from the same source category counts.

No assumption here provides the 3 missing original sixties (ranks **23, 25, 28**) or the absent qualified both-seat gameplay and opponent policy. The overall field remains **29/32 exact originals, 0 competitively qualified games, and no evidence for a 99.5% win rate**.
