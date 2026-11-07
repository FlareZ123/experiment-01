# Copycat rescue: printed Forest Seal Stone and V body in the opening seven

**Agent 6 | 7 November 2026 | exact physical card-location opportunity, developmental only.**

The original rank1 Shadow Rider counterline against Regidrago can require Hisuian Heavy Ball ASR146 to retrieve a Prized singleton Mimikyu GRI58 or Dialga-GX UPR100 Basic. A prior exact calculation found that **14.383282%** of valid 14-Basic original openings have exactly one of those two core Basics Prized while the singleton Heavy Ball is still in the draw deck. The Ball needs a draw or a card-access route before it can be played. See [the 27-state decomposition](agent6-copycat-27-location-opening-frontier-20261107.md).

One possible printed route is **Forest Seal Stone SIT156**, which can grant a Pokémon V the **Star Alchemy VSTAR Power** to search any one deck card, followed by playing the retrieved Heavy Ball to exchange it with the Prized Basic. The bundled database confirms Forest Seal Stone is a Pokémon Tool, and Star Alchemy requires a Pokémon V to carry it. The resulting physical line still depends on Tool/Ability/Item availability and consumes the once-per-game VSTAR Power.

The three historical fixed 60s differ in initial eligible Basic and Pokémon V counts:

| Printed fixed 60 | Opening-eligible Basics | Shadow Rider Calyrex V CRE74 copies |
| --- | ---: | ---: |
| Rank1 original champion | 14 | 3 |
| Hood Shield v1 | 14 | 4 |
| Temple v1 | 15 | 4 |

Each list contains one Mimikyu GRI58, Dialga-GX UPR100, Heavy Ball ASR146 and Forest Seal Stone SIT156. Counts were read from the authenticated original manifest and the two committed candidate 60-card JSON manifests, with all three summing to 60.

## Exact conditional-on-valid-seven results

**Event of interest:** exactly one of the two core Basics is in the initial six Prizes, while Hisuian Heavy Ball is in the original 47-card draw deck. Within this event, inspect Forest Seal Stone's location and whether the opening seven already contains at least one Shadow Rider Calyrex V.

| Initial card-location event | Champion 14B/3V | Hood 14B/4V | Temple 15B/4V |
| --- | ---: | ---: | ---: |
| One core Prized, Ball in deck | 14.383282% | 14.383282% | 14.421848% |
| Also Forest Seal Stone **in opening hand** | 1.644753% | 1.644753% | 1.657578% |
| Also Stone **in hand and at least one V in hand** | **0.586140%** | **0.746990%** | **0.729139%** |
| Stone in hand, but no V in the seven | 1.058613% | 0.897762% | 0.928439% |
| Stone itself Prized | 1.269937% | 1.269937% | 1.272604% |

Conditioned further on the one-core-Prized/Ball-in-deck event, **4.075146%** of champion openings have both a Forest Seal Stone and a Shadow Rider V in the original starting seven. Hood's corresponding share is **5.193463%**, Temple's **5.055794%**. These numbers describe one immediate physical connector configuration and do not bound overall Ball retrieval, which may proceed through normal draws or later effects.

## Exact calculation

Partition each exact 60 into two tagged core Basic singletons, one Heavy Ball Item, one Forest Seal Stone Tool, \(V\) interchangeable Shadow Rider V Basics, \(B-2-V\) other Basics, and \(60-B-2\) other cards. Enumerate the H/P/D locations for the four named singletons, the counts of the \(V\) cards in H/P, and the unnamed Basic/non-Basic counts in each zone. Weight each assignment by its sequential hand-then-Prize multivariate hypergeometric combination count. Condition on at least one Basic in the seven.

The denominator is \(\binom{60}{7}\binom{53}{6}\) before the legal-opening condition. The distribution's legal-opening normalization equals \(1-\binom{60-B}{7}/\binom{60}{7}\), and marginalizing Stone/V locations reproduces the [three-named-card exact Ball-deck probability](agent6-copycat-27-location-opening-frontier-20261107.md) in each \(B\) configuration.

Reproducer: \`scripts/agent6-copycat-star-alchemy-opening.cjs\`. Test: \`tests/agent6-copycat-star-alchemy-opening.test.cjs\`. Five focused local Node assertions/test cases pass for exact 14B/3V, 14B/4V and 15B/4V, multiplicity monotonicity and input failures. Together with the prior two suites, **12/12 pure local tests passed**; these are calculations and do not execute Twinleaf.

## Strategic use and cautions

This isolates one viable **physical possession prerequisite** for an early Star Alchemy-to-Heavy Ball line in an important field archetype. A card in hand is not automatically a usable action. Forest Seal Stone needs an eligible Pokémon V in play with an available Tool slot, functioning VSTAR Ability and unspent once-per-game power; Heavy Ball then needs legal Item use. The turn may still lack the Energy, sequencing, discard resources and opponent cooperation needed for Copycat or Timeless-GX.

A later Test should annotate actual original-source initial H/P/D positions for the five relevant card groups, plus real native Store acceptance, printed cost and Tool restrictions, successful VSTAR Power search, exact Heavy Ball exchange, original opponent reply and continued payoff. Compare this to an owner-visible alternative use of Star Alchemy in the same matched source state before concluding that the Ball route is strategically preferable. The Tool's universal search has high opportunity cost and may be connector-dominated.

**Research admission:** 29/32 authenticated original name/count 60s, missing ranks 23/25/28, zero competitive-qualified games, no selected final fixed 60 and no demonstrated 99.5% win rate.
