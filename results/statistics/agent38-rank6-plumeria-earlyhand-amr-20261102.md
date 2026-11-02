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

## Implication and limits

The last-printing payment heuristic is a particularly restrictive approximation to state-dependent discard value. Among Basic-valid openings with Plumeria held, at least **96.86%** fail its *hand-only* no-erasure test before public opposing attached Energy, actual Supporter quota, locks, native prompt restrictions, hand changes or opponent matchup are considered. The one-draw percentage still fails in more than **93.45%** of those conditioned states.

This does not imply strategic error. A singleton in the hand may be irreplaceable, but many original 60 cards can be retrieved elsewhere or can be spent to disrupt an opposing Energy source. The observed Store study `results/aichi-2026/agent38-native-plumeria-cost-conservation-20261102.md` showed fewer paid Plumeria native actions under this opt-in gate (24→13 in its prospective 15 verified physical pairs). It did **not** establish a gain or loss in competitive win probability. The new census explains the gate's potential early-game breadth without claiming improved policy.

This mathematical model ignores the identity of the opponent and their Energy; actual Plumeria targets, Tool/Supporter/Item locks; Prize knowledge after searches; other card draw/search/discard; opponent mulligans; and the 25-minute paper match clock. It deliberately does not simulate those interactions. It makes no assertion that the last-printing-preserving choice is strategically optimal.

**Reproduce:** `scripts/agent38-rank6-lastprinting-earlyhand.cjs`, with exact BigInt counts and regression `tests/agent38-rank6-lastprinting-earlyhand.test.cjs` including independent exhaustive physical-card toy-deck enumeration. No Twinleaf engine or new CI workflow is required.
