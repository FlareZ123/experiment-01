# Aichi three-rank Iron Thorns opening-resource frontier

**Agent 9, 19 October 2026.** Evidence class: exact combinatorial K0 opening-resource analysis of three **unchanged published source 60s**, independently cross-checked in Python. It is neither an attack-execution rate nor a competitive win probability. The associated [manual Node 22 CI 39225709119](https://github.com/FlareZ123/experiment-01/actions/runs/39225709119) **passed** at pinned research commit `254af2c`, including the new five-test source regression suite and the existing statistical checks.

## Decision relevance: rank 6 is an incomplete proxy for the Thorns matchup

The field contains three distinct Iron Thorns ex source lists at ranks **6** (Kazuma Kashi), **24** (Ryoya Fujii) and **29** (Kohei Hamamichi). Each published 60 has only four Basic Pokémon, all Iron Thorns ex, plus one Thunder Mountain Prism Star, two Guzma & Hala and two Tag Call. Rank 24 has **three Double Colorless Energy**, while ranks 6 and 29 have **one each**. Their nonattacking cards and discard-payment options also differ.

The previously published [rank-6 DCI frontier](rank6-broad-discard-dci-tier-sensitivity.md) quantified up to 33.54814% **resource availability** with a highly permissive discard whitelist. This investigation extends that same mathematical question to the other two lists with the same permitted *card-name categories*, preserving each source's actual multiplicities. The extension exposes distinct energy/search-resource risk that a rank-6-only anti-Thorns rehearsal might omit.

## Fixed modeled line and observation window

The selected turn is the Iron Thorns player's **first normal turn going second**, after a seven-card Basic-valid opening, six uniformly random face-down Prizes and one normal draw. The denominator conditions on a legal initial seven containing at least one of four Iron Thorns ex. No optional draws from the other player's mulligans or card effects are included.

Count the resource opportunity for Thunder Mountain Prism Star and Double Colorless Energy through these mutually exclusive routes:

1. Both are already in the observed eight cards.
2. If at least one is missing, Guzma & Hala is held and the missing targets remain search-accessible outside Prizes; fetching DCE requires two permitted extra cards to discard.
3. Otherwise, Tag Call is held and at least one Guzma & Hala remains searchable outside Prizes; after Tag Call searches the Supporter, the same Stadium/Energy/conditional-discard requirements apply.

A held DCE permits the free Stadium-only Guzma & Hala mode without requiring a two-card payment; a DCE that must be fetched invokes the paid mode. The line uses one Supporter, one Special Energy attachment and one Stadium play. The model does not automatically give credit to the card for winning or to a bot for choosing the play.

## Exact results

All values below are percentages of valid opening sevens, including the first draw and unknown six Prizes. Five **nested hypothetical** tiers protect more cards at earlier tiers; the card-name groups are identical across the three source lists, but the copy counts differ.

| Discard permission tier | Rank 6: 1 DCE | Rank 24: 3 DCE | Rank 29: 1 DCE |
| --- | ---: | ---: | ---: |
| T0: discard no cards | **4.84127507%** (0 copies) | **13.21320055%** (0) | **4.84127507%** (0) |
| T1: Beach, Mail, Belt, Camping Gear | 9.63265130% (7) | 14.75628856% (4) | 10.89354957% (8) |
| T2: T1 plus 8 additional named Items/Stadiums | 24.83667502% (19) | 25.25978827% (13) | 22.66015077% (17) |
| T3: T2 plus 7 named disruption Supporters | 32.08071006% (30) | **36.00617060%** (25) | 31.31471312% (28) |
| T4: T3 plus flexible gust/recovery/draw Supporters | 33.54814393% (38) | **38.34886105%** (32) | 33.23009350% (35) |

Full named tiers, per-route reduced rational fractions and actual source-copy counts are emitted by [`scripts/aichi-thorns-crossrank-opening.cjs`](../../scripts/aichi-thorns-crossrank-opening.cjs). The T0 row needs no hypothetical discard valuation and is particularly revealing: rank 24's three DCE copies raise its direct or unpaid search opportunities by **8.37192548 percentage points** over the two one-DCE lists in this narrowly defined window.

The *direct both-held* route is **1.27835513%** for ranks 6/29 and **3.49974770%** for rank 24, independently checked by a closed-category eight-card combinatorial oracle. Rank 24's T1 opportunity also exceeds the other lists despite having only four tier-1 discard candidates. These mathematical comparisons concern resources rather than actual early Volt Cyclone use or matchup win likelihood.

## Validity and independent cross-checks

The calculations call the previously committed [`exactExpandedOpening`](../../simulation/twinleaf/rank6-expanded-opening-coverage.cjs) BigInt enumerator with source-derived group counts. It sums admissible eight-card category hands and all compatible Prize allocations and reduces the resulting rational fraction. There are four real source Thorns copies; when exactly one is among the eight observed cards, only seven of the eight positional assignments give a valid original opening seven, hence the 7/8 weighting.

Independent Python enumeration in the Agent 9 working environment reproduces all 15 source-category cells and all three route decomposition rates. The rank-6 results at five nested tiers exactly reproduce the [earlier independently checked source frontier](rank6-broad-discard-dci-tier-sensitivity.md) to displayed precision. In-repo regression [`tests/aichi-thorns-crossrank-opening.test.cjs`](../../tests/aichi-thorns-crossrank-opening.test.cjs) additionally checks source inventory/counts, rank-6 known values, exact nested whitelists, monotonicity, and an algebraically separate direct Thunder+DCE oracle. All five tests first passed a read-only V8 compatibility run of exact repository source; subsequent **manual Node 22 CI passed** with the same new source and tests, head `254af2c`.

The relevant expanded opening resource event ignores the identity-dependent opportunity cost of actual discarded cards, Supporter contention outside this one proposed line, prizes on other essential cards, stadium replacement, the opponent's decisions, card legality and engine effect correctness, later decision turns, extra opponent mulligan draws and the 25-minute official match clock. In particular, including Plumeria, Guzma or recovery cards as payments can forfeit stronger later lines. The monotone tier rates do not describe an actual optimal discard policy.

## Research implication and falsifiable next gate

For claims that one unchanged fixed candidate is resilient against the Aichi field, **rank-24 opposition cannot be assumed to behave like rank 6 or 29**. A future two-sided source-run needs independent authentic first/second starts against all three published Thorns 60s, genuine conditional Tag Call/Guzma & Hala and DCE/Thunder plays, resource-aware payment decisions, and a real candidate response with actual damage, Prize/lock transitions and completed match adjudication. Log unavailable or aborted lines too. Rank-6's existing [real 140-damage positive control](rank6-autonomous-handline-source.md) offers a mechanics regression, while this three-rank census supplies different source opening conditions to sample in a **prospectively registered** decision test.

**Unchanged global status:** 29/32 exact opponent lists, ranks 23/25/28 unknown, zero competitively qualified Aichi games, no evidence of a fixed 60 reaching a 99.5% game win rate.
