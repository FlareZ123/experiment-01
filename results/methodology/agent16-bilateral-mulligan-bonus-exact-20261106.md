# Bilateral simultaneous mulligans: exact offered bonus-draw distribution for original Aichi Iron Thorns

**Agent 16 | 6 November 2026 | exact paper-setup probability; no game simulations or win-rate claims.**

## Decision relevance

The **original published rank 6, 24 and 29 Iron Thorns ex** inventories each have only four starting-eligible Basic Pokémon (four Iron Thorns ex, no others). The fixed rank-1 **Shadow Rider reference has 14** eligible Basics; the fixed New Moon Lockbreaker candidate has **17** (19 Pokémon including two Stage-1 Dusclops). Provenance: [published 29 originals](../aichi-2026/full-decklists.json), [champion fixed 60](../aichi-2026/benchmark-shadow-rider.md), [New Moon fixed 60](../als/new-moon-lockbreak-60-candidate.md).

These three sparse-Basic opponents create substantial *offered optional bonus draws* before the game begins. Such draws change the physically observed initial game state and need to be recorded when comparing different fixed candidate 60s. The figures below do **not** estimate the frequency of unmatched paired source hashes under any particular seeded Twinleaf implementation; common pseudorandom seeds do not guarantee equal physical deals. Nor do offered draws imply that a player takes all of them.

## Exact model, including simultaneous no-Basic redraws

The Advanced Player's Rulebook v3.4, **G. Setting Up to Play, Step 5**, has both players reveal, shuffle and restart together if neither opening seven contains a Basic. If only one player lacks a Basic, the other player keeps their valid hand while the first continues to redraw. **Step 7** allows the successful opponent to draw *up to* one extra card for each unilateral repeat of Step 5.d.

For any 60-card deck containing B starting-eligible Basic cards, let

- p(B) = choose(60 - B, 7) / choose(60, 7), the probability of no eligible Basic in one uniformly shuffled seven.
- S = zero-based number of failed seven-card opening hands for the original source.
- C = equivalent number for the candidate.

Under independent fair reshuffles, S and C are independent geometric failure counts, with P(S=s) = (1-p_s) p_s^s and P(C=c) = (1-p_c) p_c^c. A round in which **both** players fail produces no bonus. Consequently, the **candidate** is offered max(S-C,0) extra cards and the **source** is offered max(C-S,0).

With d = 1-p_s p_c, the exact distribution summaries are:

| Event or expectation | Closed-form value |
| --- | --- |
| Candidate offered at least one | p_s (1-p_c) / d |
| Source offered at least one | p_c (1-p_s) / d |
| Neither offered any | (1-p_s)(1-p_c) / d |
| Candidate offered at least k (k >= 1) | (1-p_c) p_s^k / d |
| Expected number offered candidate | p_s (1-p_c) / [(1-p_s)d] |
| Expected number offered source | p_c (1-p_s) / [(1-p_c)d] |

The three mutually exclusive opportunity categories sum to 1. Expected counts include zeros, all initial redraws, and simultaneous initial redraw rounds. They are **unconditional** on a particular player's first successful opening, and they count optional *offers*, not accepted draws or subsequent hand quality. Basic cards with special opening restrictions would require a modified model.

## Original four-Basic Iron Thorns versus the two frozen candidate 60s

| Exact probability or mean | Rank-1 champion (14 Basics) | New Moon Lockbreaker (17 Basics) |
| --- | ---: | ---: |
| Original Iron Thorns has no Basic in one seven | 60.05004% | 60.05004% |
| Candidate has no Basic in one seven | 13.85907% | 8.34374% |
| Candidate offered >=1 extra card | **56.42343%** | **57.94279%** |
| Candidate offered >=2 extra cards | **33.88229%** | **34.79467%** |
| Candidate offered >=5 extra cards | **7.33690%** | **7.53447%** |
| Mean offered candidate bonus-card count | **1.412353** | **1.450384** |
| Original Iron Thorns offered >=1 extra card | 6.03931% | 3.50915% |
| Mean offered source bonus-card count | 0.070110 | 0.038286 |
| No extra-card offer to either player | 37.53726% | 38.54806% |

The candidate's **unconditional offered-draw expectation** exceeds one against these four-Basic source lists despite simultaneous failure rounds. The *difference between the two candidates* is much smaller (0.038032 offered cards per such encounter). Neither value predicts stronger tournament play: the chosen extra draw count, source first player, initial 60-card composition, Pokémon setup, physical Prize arrangement, search sequencing, and actual owner decisions all matter.

This exact baseline complements Agent4's [real native physical-RNG coupling study](../methodology/agent4-native-postsetup-per-seat-shuffle-mail-aba-20261105.md). It cannot replace an **identical physical deal** check for a seeded A/B/A counterfactual. In particular, differing candidate Basic counts can alter the distribution of source bonus opportunities even with an unchanged opponent original 60. Record actual unilateral mulligan counts and optional bonus choices in each game. Treat cross-candidate different deals as nonmatched, and report these effects separately from policy or deck efficacy.

## Reproducibility and independent checks

- [Formula implementation](../../scripts/agent16-bilateral-mulligan-bonus.cjs), CommonJS with no external dependency; inputs are starting-Basic counts.
- [Single runnable test file](../../tests/agent16-bilateral-mulligan-bonus.test.cjs), Node 22: 59 deterministic assertions across five case pairs, independent finite enumeration of all pairs of zero-based geometric failure counts through 90 each, swap symmetry and probability-sum invariants, and two separate 240,000-trial seeded *seven-card without-replacement* physical opening samplers.
- **Local Node 22 verification:** PASS 59 checks. Independent 240,000-trial observed candidate opportunity rates 56.44208% (14 Basics) and 57.95458% (17 Basics), and observed offered mean cards 1.412013 and 1.450308. No GitHub Actions execution has yet been claimed.
- The sampling uses independent fixed per-seat pseudorandom streams and a simple physical hand sampler. It verifies the probability model only, not native Twinleaf setup code, a Japanese tournament judge's interpretation, the opponent's discretionary choices, or any game win.

**Acceptance status:** analytical setup model only; **zero newly qualified competitive games**, **no selected final fixed 60**, and **no demonstrated 99.5% field win rate**. The full benchmark still has 29/32 authenticated source name/count lists, with ranks 23/25/28 missing.
