# Rank31 Latias ex + Fog Crystal first-turn Bell of Silence resource routes

**Agent 5, 17 October 2026 UTC. Evidence class: printed-card line analysis, exact combinatorics, independent full-deck categorical shuffling.** All probabilities below are pre-interaction resource opportunities for the published rank31 60; they are **not** competitive attack or win rates.

## Printed-source line

The exact [rank31 Yuhi Yokoyama / Dusknoir Chimecho](full-decklists.json) source has one Basic Psychic **Chimecho CIN 43**, one Basic Psychic **Latias ex SSP 76**, four **Fog Crystal CRE 140**, two Basic Psychic Energy and three **Telepathic Psychic Energy POR 88**. The supplied card database gives Latias ex the **Skyliner** Ability: the user's Basic Pokémon in play have no Retreat Cost. Fog Crystal can search for one Basic Psychic Pokémon. Chimecho's **Bell of Silence** costs one Psychic Energy, which either of the listed Energy varieties can provide when attached. The rank31 list contains exactly 15 Basic Pokémon.

In a going-second first turn with Latias ex as the starting Active and functioning Skyliner, this play sequence is available from the specified resources: obtain Chimecho from Fog Crystal (or draw it), put Chimecho on the Bench, attach one Psychic-producing Energy to Chimecho, use Latias's zero-cost retreat to promote Chimecho, and attack with Bell of Silence. The model assumes a Bench opening and unobstructed Item, Ability, retreat and attack actions. These assumptions matter against locks.

## Three disjoint event definitions

`H` is the initial seven-card hand, `P` the six Prizes placed after `H`, and `T` the first normal turn draw after `P`. A 60-card uniformly shuffled deck is partitioned in this order. Abbreviations: `C` = singleton Chimecho; `L` = singleton Latias; `F` = four Fog Crystal; `E` = five eligible Psychic-producing Energy; `X` = remaining 49 cards after those eleven special-category cards.

- **D, direct Chimecho:** `C` is in `H` and at least one `E` is in `H∪T`. The player may select Chimecho as the starting Active. Derived independently in [the direct-opening result](chimecho-direct-t1-bell-opening.md).
- **F, searched Chimecho with Latias pivot:** `L` is in `H`, `C` remains in the deck after `H`, `P` and `T`, and there is at least one `F` and at least one `E` in `H∪T`. Select Latias as starting Active; use Fog Crystal to find Chimecho, Bench it, attach Energy, retreat for zero, attack.
- **T, drawn Chimecho with Latias pivot:** `L` is in `H`, `C` is exactly the first normal draw `T`, and at least one `E` is already in `H`. Bench the newly drawn Chimecho and use Latias's zero-cost retreat. Fog Crystal is unnecessary.

All three events are mutually exclusive. The latter two explicitly require Chimecho absent from the original hand, and event F keeps it in the deck while event T draws it.

## Exact counting

From the [direct event](chimecho-direct-t1-bell-opening.md),

`P(D) = (7/60) × [1 − C(54,7)/C(59,7)] = 0.05610162034383019`.

For event F, conditional on Latias in the seven, the other six hand cards contain `f` Fog Crystal, `e` eligible Energy, and `6−f−e` other cards, while Chimecho is absent. Their probability is `C(4,f) C(5,e) C(49,6−f−e) / C(59,6)`. Chimecho then survives the six Prizes and first draw with probability `46/53`. Conditional on that survival, the first draw is uniformly distributed among 52 non-Chimecho remaining cards. Define:

`q(f,e) = 1` if `f≥1` and `e≥1`; `q = 5/52` if `f≥1,e=0`; `q = 4/52` if `f=0,e≥1`; otherwise `q=0`.

Then:

`P(F) = (7/60) × (46/53) × Σ[f,e] {C(4,f) C(5,e) C(49,6−f−e)/C(59,6)} × q(f,e)`

`= 1113537019/66524141970 = 0.016738840758023836` (**1.673884%**).

For event T, once Latias is in `H`, the remaining six opening positions must exclude Chimecho but contain at least one of the five eligible Energy. The probability that `T` draws Chimecho, after marginalizing the unknown six Prizes, is `1/53`. Therefore:

`P(T) = (7/60) × [C(58,6) − C(53,6)]/C(59,6) × (1/53)`

`= 165263/193103460 = 0.0008558261980391237` (**0.085583%**).

| Disjoint opening resource event | All shuffled games | Conditional on valid initial seven |
| --- | ---: | ---: |
| D: Chimecho starts Active | 5.610162% | 6.357130% |
| F: Latias starts, Fog searches Chimecho | 1.673884% | 1.896754% |
| T: Latias starts, first draw is Chimecho | 0.085583% | 0.096978% |
| **Union D∪F∪T** | **7.369629%** | **8.350862%** |

The conditioning divisor is the actual probability of drawing at least one of the 15 Basics in the original seven: `1 − C(45,7)/C(60,7) = 0.8824992053482625`. Every listed event already entails such a valid opening. The exact union as a rational number is **1634194093/22174713990**.

## Independent randomized cross-check

A Python 3 `random.Random(190427)` Fisher–Yates shuffle experiment used 400,000 full-deck category deals: `['L','C'] + ['B']*13 + ['F']*4 + ['E']*5 + ['X']*36`; `B` is each other Basic and `X` contains the rest. It sampled the first seven as `H`, next six as `P`, and index 13 as `T`. Outcomes were mutually exclusive: **22,436 D**, **6,770 F**, **329 T**, with **352,903 valid starting hands**. Observed union frequency was **7.383750%** of all deals and **8.369155%** of valid deals, close to the exact results at this finite sample size.

## Boundaries and tactical implications

The union is a **defined subset of opening resource scenarios** with a plausible printed card sequence. It omits other Pokémon search, manual pivot cards, opponent mulligans, Grand Tree and indirect draw. It also omits opponent action and the state-dependent realism of playing Fog Crystal, of keeping a Bench slot, and of Skyliner functioning. For example, an active Ability lock can remove Latias's free retreat, and Item lock can eliminate the Fog Crystal branch; such interference makes the actual attack rate lower than this theoretical resource-opportunity number for some matchups. Do not call **8.350862%** a guaranteed attack frequency or a win probability.

[Staged real-Store tests](../twinleaf/chimecho-hand-entry-path-preflight.md) separately validate the Bell lock once established; a fresh real AttackAction test is also under compiled CI. Extending this analysis to the actual rank31 pilot policy requires source-dealt games and hidden-order-aware sequencing, especially Chimecho in the Prize cards and Forest Seal/Latias suppression. None of the benchmark candidate lists have a qualified rank31 game on this evidence. **Competitive games qualified: zero.**

## 18 October 2026: additional disjoint Fog-for-Energy branch (Agent 5)

The original three-event union in this report intentionally requires a **directly drawn Energy** when Chimecho starts Active. It therefore omits a fourth, disjoint resource path: initial Active Chimecho, no Energy in the opening seven plus first draw, a drawn Fog Crystal, and an unprized **Basic Psychic Energy** still searchable from the deck. The exact six-Prize-aware added opportunity is **2.610775250436% of all shuffled setups**, or **2.958388216% conditional on a Basic-valid initial seven**. Including this fourth branch changes the restricted opening union from **7.369629% to 9.980404% unconditional**, and from **8.350862% to 11.309250% conditional**. This is still a resource-subset calculation without opponent lock effects or action decisions. See the [new full proof and independent random-shuffle check](chimecho-fog-energy-direct-route.md) and [reproducible BigInt code](../../scripts/rank31-fog-energy-direct.cjs). The original event definitions and their exact figures remain correct within their stated scope.
