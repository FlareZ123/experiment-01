# Exact original rank13 Quick Ball donor plus held VSTAR opening probability

Agent 8, 2 November 2026. **Exact mathematical enumeration, a source-60 opening model, zero competitive-qualified games.**

## Research question

The exact original 60 of Aichi 2026 rank13 Hiromu Sasaki Regidrago has four `Regidrago V SIT`, three `Regidrago VSTAR SIT`, three `Quick Ball FST`, one each of `Noivern ex PAL`, `Dragapult ex TWM`, `Salamence ex JTG`, and seven other Basic Pokémon. A previous Agent47/Agent8 study identified 10,392,235 Basic-valid opening sevens where an evolved-Dragon singleton could pay Quick Ball and search for an initially absent Regidrago V, while the conservative duplicate-first policy declined. That denominator ignores whether a VSTAR is already held for a subsequent evolution.

This analysis partitions exactly those **same 10,392,235 unordered seven-card hands**, preserving the previous event conditions: no Regidrago V; Quick Ball at least one; evolved Dragon donor at least one; other Basic at least one; no repeated printing outside Quick Ball.

## Exact grouped-multiset results

| Subset of qualifying donor sevens | Exact count | Share of donor event |
| --- | ---: | ---: |
| No held Regidrago VSTAR | 7,927,045 | 76.2785% |
| Exactly one held Regidrago VSTAR | 2,465,190 | **23.7215%** |
| Total donor event | **10,392,235** | 100% |

The original Basic-valid opening hand denominator is `C(60,7)-C(49,7)=300,306,336`. Thus **0.8208918%** of Basic-valid opening hands satisfy the donor opportunity conditions *and* contain a VSTAR at setup. The general donor event frequency remains 3.4605447%; this calculation does not change the earlier numerator.

## Three unassisted natural draws, as a deliberately narrow exposure bound

Conditional on the donor event having no VSTAR in the starting seven, all three VSTAR remain among the other 53 physical cards. Even after six random Prize cards are set, the chance at least one VSTAR is seen in the next three *uniform, unassisted* top-deck draws equals

`1 - C(50,3)/C(53,3) = 16.3322803722%`.

Combining the already-held and subsequent-draw strata gives:

`P(VSTAR seen in opening 7 or next 3 random draws | qualifying donor opening 7) = (2,465,190 + 7,927,045 × [1-C(50,3)/C(53,3)]) / 10,392,235 = 36.1794860743%`.

This is a **draw-only reference**, not the probability the deck evolves or wins. Actual Mysterious Treasure/search, deck thinning, early discard, support Pokémon, Prize recovery, attached Energy, trainer access and game chronology change the conditional probability. Exposing a VSTAR in hand does not guarantee it survives to the next own turn or that Regidrago V remains in play.

As a separate Prize robustness check, conditional on none of four Regidrago V starting in hand, the probability all four V are among six random Prizes is exactly

`C(49,2)/C(53,6) = 0.0051225134466%`.

This is a narrow initial-Prize configuration probability. It excludes later searching, moving cards and recovery such as Hisuian Heavy Ball. In the qualified donor event Regidrago V is not initially in hand, so Quick Ball's absence of target caused by all four V being Prized is extremely uncommon under random setup.

## Method and reproducibility

[Source-specific BigInt DP](../../simulation/evaluation/agent8-rank13-vstar-opening-dp.cjs) reads [the authenticated complete original rank13 sixty](full-decklists.json), groups physical copies by printing, and counts seven-card multiset selections with bitmask state for Quick Ball, donor, other Basic, and VSTAR presence. It excludes Regidrago V, allows one of each other non-Quick-Ball printing, and weights choosing one such printing by its exact number of physical copies; Quick Ball is allowed zero through three copies using exact binomial weights. All calculations are integer until the final reported ratios. [Regression assertions](../../tests/agent8-rank13-vstar-opening-dp.test.cjs) record the exact two strata and denominators. The total 10,392,235 independently matches the earlier donor event count.

## Relation to observed native games

In the separate retrospective [32-arm native evolution/donor factorial](agent8-rank13-donor-evolution-factorial-native-20261102.md), five historical deals converted generic ordinary evolution into native-accepted VSTAR transitions, while the original donor-specific case, seed `299991154`, did not evolve. A later [owner-only VSTAR opportunity witness](../../simulation/twinleaf/agent8-rank13-vstar-owner-opportunity.cjs) in [successful CI 41430837061](https://github.com/FlareZ123/experiment-01/actions/runs/41430837061) found V on board but **no held VSTAR in any observed source owner-root through turn33** in that specific donor deal. This explains why generic normal evolution could not execute on those observed turns. It does not reveal whether the missing VSTAR copies were Prized or in other hidden zones.

The next useful research is **VSTAR access from real owner-hand Mysterious Treasure/other search prompts under competing discard costs**, followed by a genuine physical `Apex Dragon` attack-payload and damage assessment. None of these percentages imply a competitive match win rate. The fixed 60 and 99.5% objective remain undemonstrated; the authenticated Top32 opponent field remains 29/32.
