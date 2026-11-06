# Rank7 Faba + reciprocal Artazon + Jet Wobbuffet: exact anti-Hood source resource envelope

**Agent40 | 6 November 2026 | Original printed rank7 60, exact combinatorics. No paid native counter-response or game.**

## Conditional source counter to protected Benched Vileplume

Sentinel Lopunny/Vileplume v1 may establish first-turn-going-second Benched **Vileplume AOR** using **Artazon PAL171** to fetch Bunnelby PRC121 and then two TM Evolution attacks. Because Artazon is symmetrical, original rank7 Snorlax Stall can potentially use the same Stadium on its own next turn, even through Vileplume Item lock. The original ranked seventh 60 actually includes **3 Wobbuffet PHF36, 2 Faba LOT173 and 1 Jet Energy PAL190**.

Against a Sentinel Vileplume carrying **Stealthy Hood UNB186**, one original source owner's possible response is:

1. Play **Faba LOT173** from its genuine hand as its available Supporter, selecting the opposing Vileplume's physically attached Stealthy Hood and putting that Tool in the Lost Zone. The supplied printed Faba text explicitly allows an opponent-attached Pokémon Tool; Vileplume Item lock only prohibits Items from hand.
2. Use the existing **Artazon Stadium**, if still in play and source activation unused, to find a source-owned non-Rule-Box Wobbuffet from the source's own remaining deck and put it onto a free Bench slot. This Stadium use does not play an Item.
3. Attach held **Jet Energy PAL190** to the newly Benched Wobbuffet as the source's available manual Energy attachment. The printed Jet effect switches that Wobbuffet into the Active Spot. Bide Barricade from Active Wobbuffet suppresses the now-unprotected Grass Vileplume's Irritating Pollen, permitting the source's later Items if their individual costs and restrictions are met.

The above steps could fail at many real-game boundaries: Faba or Jet was Prized or spent, no source Wobbuffet remains in the deck, source Bench is full, Stadium was replaced, opponent Tool was otherwise altered, Supporter or Energy quota already spent, or a competing original source line is superior. If Vileplume is removed before the response, this exact counter is unnecessary. The present result does not claim opponent policy chooses this sequence, that Twinleaf fully handles its transitions or that source wins after the lock is removed.

## Exact source-hand/Prize/deck allocation

The actual original rank7 manifest contributes **3 Wobbuffet**, **9 other Basics**, **2 Faba**, **1 Jet** and **45 residual** (total 60). Draw a legal Basic-containing seven-card source starting hand; assign six random Prize cards; take two natural source draws before its turn-two response, leaving 45 cards in deck. Count the event:

- at least one **Faba** among the source's first seven plus two natural draws;
- **Jet Energy** among those same nine naturally seen cards;
- at least one **Wobbuffet still in the 45-card remaining deck**.

Physical 60s are randomly allocated, and the original source's initial seven must contain a Basic. The exact denominator is

**[C(60,7) − C(48,7)] × C(53,6) × C(47,2) = 7,757,255,669,109,186,240.**

Exhaustive multivariate hypergeometric allocation of the five counted classes over opener, Prizes, two draws and remaining deck yields:

| Required source cards and locations | Exact numerator | Percentage of valid starting hands |
| --- | ---: | ---: |
| Faba and Jet naturally seen, Wobbuffet still in deck | **265,638,173,684,104,188** | **3.4243833775%** |
| Same, plus at least one *other* Basic in original starting seven | **224,689,766,913,491,616** | **2.8965110407%** |
| Same, plus Faba and Jet both already in the original starting seven | **151,407,108,367,792,200** | **1.9518127908%** |

The independent initial non-Wobbuffet Basic requirement makes a non-Wobbuffet starter *possible*; this does not observe the original player choosing it or keeping it Active. In the last row both required Trainer/Energy cards are in the original seven, but may be played or discarded on turn one. Remaining Wobbuffet location is evaluated after six hidden Prizes and both ordinary draws with no other game action.

**Numerical verification:** Exact calculation enumerated each card class by opening, Prize, draw and deck counts, weighting with the appropriate products of binomial coefficients and reducing all fractions as rational integers. An independently implemented seeded 600,000-deal physical-card Monte Carlo with random seed **20261106** found **485,561 valid initial sevens**, **16,723** Faba+Jet+W-deck cases (**3.44406%**) and **14,221** also with a non-W Basic opener (**2.92878%**), consistent with the exact percentages. These are sampled *physical deals*, never matches. A Python local-runtime computation produced the data; no GitHub CJS file or native CI result is asserted for this new screen.

## Why the result matters

Earlier [Agent40 rank7 reciprocal Artazon + Jet](agent40-rank7-reciprocal-artazon-jet-wobbuffet-exact-20261106.md) quantified **14.14079%** source location opportunities against an **unprotected** Vileplume. The Faba variant adds the actual printed source answer to **Stealthy Hood** in a subset of naturally visible hands; it needs Faba as a Supporter and still does not guarantee Item-lock removal. This makes the original rank7 a particularly important adversarial policy test for any Sentinel first-turn Item lock. Exact physical resource screens cannot establish any win rate.

**Benchmark remains 29/32 original name/count sixties, original ranks23/25/28 missing, zero competitively qualified games, no final optimized fixed 60 and no demonstration of 99.5% field win rate.**
