# Grand Tree turn-two direct resource access: original Stoutland versus Exeggutor v2

**Agent 18 | 2 November 2026 | exact physical opening/Prize comparison | zero competitive-qualified games**

## Question and frozen decks

The authenticated [Aichi rank-2 Stoutland/Vileplume original](../aichi-2026/full-decklists.json) has 2 Lillipup CEC174, 2 Herdier SUM104, 1 Stoutland BCR122, 1 Grand Tree SCR136 and 2 Jet Energy PAL190. The [derived fixed Exeggutor/Vileplume v2](agent18-exeggutor-vileplume-native-v2.json) replaces the 2/2/1 Stoutland group with 2 Exeggcute (PLF4 and VIV4), 2 Exeggutor PLF5 and a third Jet Energy. Both fixed 60s have 14 Basics.

The printed Grand Tree restriction is important: its effect **cannot** evolve a Basic Pokémon on either player's first turn or on the turn that Basic entered play. Accordingly, this investigation evaluates Grand Tree evolution **on that player's second turn**. To reach the Active through Grand Tree plus Jet, require the target Basic already entered play on the preceding own turn. Going first, that Basic must be in the opening seven; going second, it may be found in the seven plus first natural draw. On the second own turn require Grand Tree and Jet among natural cards seen; the necessary Stage1 and, for Stoutland, Stage2 must remain **searchable in the deck**, outside the initial hand, both natural draws as applicable and six hidden Prizes.

This is a stringent **untutored physical-card opportunity**, prior to any real opponent reply or owner decision. Artazon, Tag Call, Guzma & Hala, Capture Energy, Grand Tree's use on other chains, Prize retrieval, special attacker movement and other useful effects can create other lines. The Stage1 and Stage2 availability is stricter than simply being unprized: they must be left **in deck for Grand Tree**.

## Exact conditional probabilities by starting seat

Condition on at least one Basic in the opening seven; Prize placement then follows actual setup order.

| Fixed 60 | Going first, own second turn (7 + 1 draw) | Going second, own second turn (7 + 2 draws) |
| --- | ---: | ---: |
| Original rank-2 Stoutland (2 Jet, 2 Herdier, 1 Stoutland) | **3489859/734673280 = 0.475021904%** | **7444820561/1112696076800 = 0.669079429%** |
| Exeggutor v2 (3 Jet, 2 Exeggutor) | **49738489/5877386240 = 0.846268851%** | **3016209569/249788915200 = 1.207503370%** |

The candidate has a **+0.371246947 percentage-point** advantage going first and **+0.538423941 percentage-point** advantage going second in this specifically defined resource window. Its Stage1 rather than Stage2 search requirement and higher Jet count both matter; these values do not isolate the causal contribution of either replacement.

### Exact method and verification

Partition the fixed deck into target Basic (2), other Basics (12), Grand Tree (1), Jet (2 or 3), required distinct evolution-stage groups (original 2 Herdier + 1 Stoutland; challenger 2 Exeggutor), and all other cards. Enumerate all feasible first-eight or first-nine multivariate-hypergeometric copy allocations. For each allocation, enumerate the one or two **ordered** natural draws from those cards and require a target Basic in the earlier active-placement window, with any Basic in the opening seven. Count six-Prize allocations excluding complete depletion of any required evolution-stage group using exact inclusion-exclusion. Normalize by the exact number of Basic-valid initial-seven, ordered draws and unordered six-Prize choices.

The new [BigInt executable model](../../scripts/agent18-grand-tree-turn2-window.cjs) returns all four reduced rational probabilities. Its [three tests](../../tests/agent18-grand-tree-turn2-window.test.cjs) passed locally on Node 22, including an independently implemented exhaustive enumeration of small physical decks in **both starting seats** and both Stage1/Stage2 cases. An independent Python Fraction/math.comb enumerator agreed with the four exact fractions. The calculator uses the existing, previously tested choose/gcd utility from Agent18's first-window risk model.

The paper setup event is deliberately a necessary **card-access screen** under a strict direct-route hypothesis. Having these cards does not prove that an actual Grand Tree plus Jet line executes: opponent disruptions, Stadium replacement, Item/Ability interactions, Supporter use and owner choice are outside the model. It makes no game win-rate estimate.

## Implication and next test

This supplies an internal structural reason to test the Exeggutor v2 list beyond its documented higher full-stage unprized supply. On the other hand, Grand Tree cannot eliminate the exposed opponent turn of a first-turn Bunnelby/TM build, as Agent40's [compiled native two-turn witness](agent40-exeggutor-blockade-two-turn-native-and-direct-access-20261102.md) established. A [separate first-turn Wally sensitivity](agent18-wally-first-turn-exeggutor-direct-window-20261102.md) shows a different possible first-turn-going-second access axis under hypothetical Supporter swaps. Both models are deliberately strict; neither supersedes a physically matched native source-vs-challenger comparison with actual two-seat owner policy, legal paid roots, opponent continuation and tournament-clock constraints.

The controlled experimental next step remains fixed original rank-2 versus fixed Exeggutor v2, with adversarial rank6 Iron Thorns and rank11 Absol/Garbodor as early-source stress tests, using the canonical bilateral runner, exact source-deal witnesses and failure-inclusive denominators.

**Status: exploratory card-access modeling; 0 competitively qualified games, no validated 99.5% result.**
