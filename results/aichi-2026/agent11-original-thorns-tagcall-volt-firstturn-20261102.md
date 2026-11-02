# Original Aichi Iron Thorns turn-one Tag Call → Volt Cyclone access

**Agent 11 | 2 November 2026 | exact combinatorics, source-printed physical deckcounts.** This reports a narrowly defined *legal attack-access opportunity*, not an observed attack, a game result, a source-policy success rate, or a candidate matchup win probability.

## Findings

The exact original Aichi 2026 rank **6**, **24**, and **29** 60s in [the authenticated roster](full-decklists.json) each include **4 Iron Thorns ex TWM 77**, **2 Guzma & Hala CEC 193**, **2 Tag Call CEC 206**, and **1 Thunder Mountain ◇ LOT 191**. Ranks **6/29** each include **1 Double Colorless Energy SUM 136**, whereas rank **24** includes **3**. Their only four Basic Pokémon are Iron Thorns ex.

For an Iron Thorns owner **going second**, consider the following particularly narrow line. Following a valid initial seven (at least one Iron Thorns), six face-down Prizes, and the ordinary first-turn draw:

1. Thunder Mountain and at least one Double Colorless Energy are still **in the searchable deck**, rather than held or Prized.
2. The owner holds Guzma & Hala, or holds Tag Call with at least one Guzma & Hala still searchable in deck.
3. With Tag Call where needed, retrieve Guzma & Hala; use the single Supporter to obtain Thunder Mountain, discard two *other* hand cards to access Double Colorless Energy, play Thunder Mountain, and attach Double Colorless Energy to Active Iron Thorns ex.
4. Thunder Mountain reduces the attack's Lightning requirement and Double Colorless supplies the remaining two Colorless, permitting **Volt Cyclone for 140 damage** on that first turn. If there is no own Benched Pokémon, the instruction to move an Energy is the unapplied portion; the damage still occurs under the rulebook's partial-effect rule. Agent 7 has separately documented real original-Store no-Bench Volt Cyclone examples, but those are separate selected-policy observations.

All conditions are **mechanical**. Paying two cards can still be strategically costly and an opponent may constrain the line. The eight physical source cards include the Active Basic and leave enough other hand cards to pay Guzma & Hala whenever the stated connector is present.

| Original rank | DCE copies | Strict both-resources-in-deck subset | Broader same-connector envelope |
| --- | ---: | ---: | ---: |
| 6 | 1 | **25.3773107035%** | **33.7815057106%** |
| 24 | 3 | **32.0703662663%** | **39.1078506273%** |
| 29 | 1 | **25.3773107035%** | **33.7815057106%** |

The broader envelope permits Thunder Mountain and/or DCE to be **held directly** in the physical eight-card hand. If both are held, the owner needs no Tag Call or Guzma & Hala; otherwise, a held Guzma & Hala or Tag Call with an accessible Guzma & Hala supplies whichever resource remains in deck. It is a more complete characterization of *this named search connector*, and still excludes Trainers' Mail and all other relevant gameplay paths.

Strict-subset numerators are **42,247,799,893,454,400** (one DCE) and **53,390,307,284,997,648** (three DCE). The broader numerators are respectively **56,238,988,836,673,440** and **65,106,215,030,784,032**. All four results use the shared conditional denominator **166,478,632,771,651,200** physical deal/draw sequences, conditioned on the source's valid initial seven. These percentages are neither complete access probabilities across all card effects nor upper bounds on actual attacks.

## Enumeration

The executable [source-locked BigInt enumerator](../../scripts/agent11-thorns-tagcall-first-attack.cjs) partitions each printed 60 into disjoint classes

\`[Iron Thorns 4, Guzma & Hala 2, Tag Call 2, Thunder Mountain 1, DCE d, other 51-d]\`.

It sums multivariate hypergeometric counts over opening seven, six Prize cards, and one subsequent draw, preserving the actual **seven → six Prizes → draw** chronology. For every valid initial-seven category allocation \(h\), Prize allocation \(p\), and ordinary draw category \(i\), its contribution is:

\[
\left(\prod_j {c_j \choose h_j}\right)
\left(\prod_j {c_j-h_j \choose p_j}\right)
(c_i-h_i-p_i)
\]

provided that at least one Basic is in \(h\), and the resulting actual deck contains Mountain and DCE and the stated Supporter connector exists (strict subset). For the broader event, the hand may itself contain either or both resources, with a connector required only for missing resources. The denominator is

\[
\left[{60 \choose 7}-{56 \choose 7}\right]{53 \choose 6}\cdot 47.
\]

[Expanded local regression assertions](../../tests/agent11-thorns-tagcall-first-attack.test.cjs) passed, including an independently exhaustive toy-deck enumeration, both full-deck exact constants, and printing/count validation. A separate fixed-seed independent 200,000-permutation Monte Carlo sanity check for one DCE gave ~25.29% against the 25.38% exact value. No compiled CI or live-game claim is made by this pure calculation.

## Consequences and boundaries

This is an explicitly available **first-turn source pressure** that common rank-6/24/29 actor policies should recognize and try to convert into a physical accepted attack when legal and tactically worthwhile. It also matters for the 17-Basic New Moon Lockbreaker candidate's vulnerable solo HP-60 openings. Agent 11's [existing physical source-locked screen](../statistics/agent11-newmoon-forced-lowhp-opening-20261101.md) reports the candidate's forced single HP-60 starter at **8.61122899%** conditional on its valid seven; that is a **setup-only event**. An optimal first player can often establish extra Basics with Items, Telepathic Psychic Energy, or other resource combinations before the source's first turn. Multiplying starter frequency by the source access percentage would **not** give a donk rate, because the intervening candidate turn, setup mulligan bonus draws, source decisions, and opposition are omitted.

The present calculation assumes no additional cards are accepted from the opponent's setup mulligans, no opponent Item/Supporter-locking restriction on the second player's initial turn, no competing effects changing attack cost, and no attempt to optimize other first-turn routes. It does not model opponent bench-making, an actual choice of discards, turn clock, hidden-information-safe bot decisions, or Prize taking. The three exact source 60s are unchanged. **Zero competitive-qualified games and 29/32 authenticated original opposing 60s remain the global benchmark state.**

A useful next native check would preregister first-own-turn source-policy eligibility for this exact line in source-second original Store episodes, then preserve the payment/discard, retrieved Mountain/DCE, attack declaration, actual 140 damage, opponent response, and all failed/capped arms. Avoid scoring a theoretical resource event as a successful turn.
