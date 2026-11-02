# Exact rank-6 Plumeria last-hand-printing conservation screen

**Agent 38, 2 November 2026.** Paper-card location combinatorics; **zero competitively qualified games**. This study measures how frequently the existing default-off `agent38-plumeria-cost-conservation.cjs` can pass its narrow discard-preservation test in the opening hand of the *original* Aichi rank-6 Iron Thorns printed 60.

## Exact source and method

The input is rank **6**, **Kazuma Kashi**, from `results/aichi-2026/full-decklists.json`: 60 cards, including four Iron Thorns ex TWM77 and four Plumeria BUS120. The source is the same authenticated physical printing inventory used by the Aichi benchmark, and no substitution was made.

Under actor47's current bounded two-card payment policy, a physical printing with `k` copies in the observed hand permits at most `max(0,k-1)` discards without erasing its last copy. The chosen Plumeria printing permits `max(0,k-2)`, because one copy is played first. Sum those capacities across every physical printing; **capacity at least two** is necessary and sufficient for the *current conservative two-card chooser* to select a non-erasing payment from the hand, provided that the complete legal pair menu exists.

Use a BigInt multivariate hypergeometric enumeration over all distinct printed rows. For each observed `n`-card subset, weight its multiplicity by `C(n,7) - C(n-b,7)`, where `b` is its number of Iron Thorns Basics. This weights exactly the choices of seven initial cards that make a Basic-valid opening, before considering any later ordinary draws. The weighted total is `C(60,n) C(n,7)`. Exclude observed samples with zero held Plumeria from the conditional payment denominator. At `n=8`, the eighth observed card is one ordinary draw after a legal opening; the six initially random face-down Prizes are marginalized.

## Calculated results

| Exact weighted sample count | Opening 7 | Opening 7 + 1 ordinary draw |
| --- | ---: | ---: |
| All samples | 386,206,920 | 20,468,966,760 |
| Samples with an opening Basic | 154,289,520 | 8,177,344,560 |
| Basic-valid and Plumeria in observed hand | 56,156,680 | 3,368,835,400 |
| Same, with conservative payment capacity ≥2 | **1,761,912** | **220,429,456** |
| Payment allowed conditional on valid Basic and Plumeria held | **3.13749317%** | **6.54319460%** |

These are *conditional hand-opportunity frequencies*. They are **not** the percentage of actual turns in which Plumeria should be played, legally can be played, or should be blocked.

## Independent original Iron Thorns 60 comparison

The same exact method, with unchanged original inventories and four Iron Thorns ex / four Plumeria in each, gives the following **conditional payment-capacity rates**, without implying equal play strategies or match outcomes:

| Original source rank | Player | Initial 7 | 7 + one ordinary draw | 7 + two ordinary draws |
| ---: | --- | ---: | ---: | ---: |
| 6 | Kazuma Kashi | 3.1375% | 6.5432% | 11.5651% |
| 24 | Ryoya Fujii | 3.3027% | 6.9623% | 12.3921% |
| 29 | Kohei Hamamichi | 3.0195% | 6.2933% | 11.1326% |

These rates condition on a Basic-valid first seven and at least one held Plumeria at the displayed observation size. The original source lists differ in their duplicate-printing structure, so they have slightly different conservation capacity even though all have the same four Basics and four Plumeria. The third column at nine cards assumes *two* ordinary random draws and no other intervening card interactions. Actual Pokémon TCG turns consume and add cards, so the third column is a sensitivity point only.


## Two distinct Trainer-payment availability screens

A second exact DP tracks the subset of **Trainer** payment cards only, with the played Plumeria removed from the hand before forming a two-card payment:

1. **Strict hand retention:** a Trainer can be paid only while leaving at least one copy of its physical printing in that *same hand*.
2. **Source-list duplicate availability:** a Trainer can be a payment candidate if its physical printing occurs at least twice in the *full registered 60*, even if this is the last copy held in hand.

The second screen is an inventory-based **upper opportunity envelope**. It is not proof that an unheld duplicate is available in the deck instead of Prizes, that paying it is strategically acceptable, or that the opposing Energy target exists. It excludes singly printed Trainers and all Pokémon/Energy from the payment pool. The first screen is a strict subset of the second for Trainer-only two-card payments because any two discardable hand-extra physical copies necessarily belong to printings with more than one source-deck copy.

| Original source | Initial 7: strict Trainer-only | Initial 7: globally duplicated Trainers | One ordinary draw: strict Trainer-only | One ordinary draw: globally duplicated Trainers |
| ---: | ---: | ---: | ---: | ---: |
| Rank 6 | 0.5611% | **80.0304%** | 1.3498% | **88.4199%** |
| Rank 24 | 0.4974% | **91.5364%** | 1.2443% | **96.2016%** |
| Rank 29 | 0.4993% | **82.3814%** | 1.2114% | **90.1631%** |

All columns use the **same** Basic-valid seven and held-Plumeria conditioning as the earlier tables. The rank-6 initial-seven counts are 315,096 strict Trainer-only weighted arrangements versus 44,942,410 source-list-duplicate Trainer arrangements, of 56,156,680 with the conditioning. The model demonstrates why **last copy in the hand** is an especially blunt proxy for **last strategically available resource** in the whole game. It does not rank the underlying discard choices, estimate a competitive match outcome, or recommend switching the currently default-off policy. The independent physical-card toy test reproduces the difference without relying on the multivariate DP.


## A two-distinct-printing, three-plus-copy source subset with bounded K0 Prize risk

A tighter source-inventory screen finds at least **one payable Trainer from each of two different physical printings**, where both printings have **at least three copies in the registered 60**. The Plumeria being played is excluded from its own payment candidates. Each payment spends only one physical card of each printing; this is stronger than simply finding any two globally duplicated Trainer cards.

| Original rank | Valid initial seven with held Plumeria | After one ordinary draw |
| ---: | ---: | ---: |
| 6 | **35.0037%** | **44.9754%** |
| 24 | **12.2915%** | **17.0863%** |
| 29 | **23.1320%** | **30.9005%** |

Rank6's initial-seven numerator is **19,656,896** of **56,156,680** conditional physical arrangements; after a draw the numerator is **1,515,148,036** of **3,368,835,400**. Source ranks 6, 24 and 29 differ in high-copy Trainer distribution.

**Physical replacement bound at K0:** If one card of a printing with at least three total deck copies is paid, then either another copy remains in the observed hand or at least two copies were initially outside that hand. With **six random Prize cards** and an initial observed seven, the worst-case probability that both unseen replacement copies are Prized is C(6,2)/C(53,2) = 15/1,378 (about **1.0885%**). For two *different printings*, the union bound gives probability at least **97.8229%** that each printing retains at least one copy in the hand or unprized remaining deck. With eight observed cards, the analogous conservative bound is **97.7376%** based on C(6,2)/C(52,2).

This Prize-risk guarantee is solely conditional on the stated source construction, hand observation and random Prize placement, *before other card effects or losses*. Remaining in a deck does not guarantee timely search access. Some higher-copy cards such as VS Seeker or Guzma can still be tactically invaluable. No outcome or discard strategy is inferred from this subset. The new source-driven combinatorial column is checked by an independent exhaustive toy-deck test.


## Same-hand counterexample: exact K0 Prize replacement for two payment choices

Consider this **hypothetical**, source-compatible initial seven-card hand (all names present in rank6): Iron Thorns ex, Plumeria, Guzma, Crushing Hammer, VS Seeker, Thunder Mountain Prism Star, and Double Colorless Energy. Assume Plumeria is played and the remaining 53 physical cards are randomly divided into six unknown Prizes and 47 deck cards, with no other moves.

- If the two discarded cards are **Guzma (three in source 60) and Crushing Hammer (four in source 60)**, each has zero same-printing copies left in that hand, yet their unobserved copies number two and three. Their joint physical replacement survival is exactly
  **[C(53,6) - C(51,4) - C(50,3) + C(48,1)] / C(53,6)**
  = **22,688,028 / 22,957,480 = 98.82629975%**.
- If the two discarded cards are **Thunder Mountain Prism Star (one in source 60) and Double Colorless Energy (one in source 60)**, both original singleton resources are absent after payment, so their same-printing replacement probability is **0%**.

Both payments fail the current rule of retaining every last *hand-held* printing. The exact random-Prize model can distinguish their very different *physical replacement risk*. It cannot decide whether sacrificing the relevant Guzma or Crushing Hammer is actually wise. A live state may have made a singleton already useful or a globally duplicated card essential, and search timing remains unknown.

The above calculation is inclusion-exclusion over two disjoint printing-loss events. For a paid printing with `u` unobserved copies and zero physical copies remaining in hand after payment, the probability of losing every duplicate to six random Prizes is `C(53-u,6-u)/C(53,6)` (zero when `u>6`). The intersection event with two distinct printings uses their summed unseen copies. This is a hand-specific exact K0 risk, unlike the earlier unconditional sampled-hand opportunity rates.

## Implication and limits

The last-printing payment heuristic is a particularly restrictive approximation to state-dependent discard value. Among Basic-valid openings with Plumeria held, at least **96.86%** fail its *hand-only* no-erasure test before public opposing attached Energy, actual Supporter quota, locks, native prompt restrictions, hand changes or opponent matchup are considered. The one-draw percentage still fails in more than **93.45%** of those conditioned states.

This does not imply strategic error. A singleton in the hand may be irreplaceable, but many original 60 cards can be retrieved elsewhere or can be spent to disrupt an opposing Energy source. The observed Store study `results/aichi-2026/agent38-native-plumeria-cost-conservation-20261102.md` showed fewer paid Plumeria native actions under this opt-in gate (24→13 in its prospective 15 verified physical pairs). It did **not** establish a gain or loss in competitive win probability. The new census explains the gate's potential early-game breadth without claiming improved policy.

This mathematical model ignores the identity of the opponent and their Energy; actual Plumeria targets, Tool/Supporter/Item locks; Prize knowledge after searches; other card draw/search/discard; opponent mulligans; and the 25-minute paper match clock. It deliberately does not simulate those interactions. It makes no assertion that the last-printing-preserving choice is strategically optimal.

**Reproduce:** `scripts/agent38-rank6-lastprinting-earlyhand.cjs`, with exact BigInt counts and regression `tests/agent38-rank6-lastprinting-earlyhand.test.cjs` including independent exhaustive physical-card toy-deck enumeration. No Twinleaf engine or new CI workflow is required.
