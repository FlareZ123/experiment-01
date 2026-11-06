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

## Extension: all 29 authenticated original name/count inventories

The [source-stage census](../../scripts/agent16-aichi-bilateral-mulligan-field.cjs) reads every Pokémon row of the original [29 inventories](../aichi-2026/full-decklists.json) and classifies Basic status from the supplied [English card pool](../../resources/cards/en), including the two diamond glyph variants in Prism Star names. Source-name ambiguity is rejected. A separate database scan against 102 distinct printed Pokémon rows in these source lists found **no missing names and no name-level Basic/non-Basic disagreements**. This checks *stage eligibility by name*, not every historical physical printing or special pregame permission.

**Exactly 29 published inventories, no imputed missing ranks.** Starting-eligible Basic counts by original rank:

| Basic copies | Original ranks | Count |
| ---: | --- | ---: |
| 4 | 6, 24, 29 | 3 |
| 10 | 8 | 1 |
| 11 | 3, 5, 9, 11, 13, 16 | 6 |
| 12 | 7, 22, 26 | 3 |
| 13 | 4, 17, 32 | 3 |
| 14 | 1, 2, 14, 15, 20, 21 | 6 |
| 15 | 10, 12, 27, 31 | 4 |
| 16 | 18, 19, 30 | 3 |

Equal weight for **each known original rank**, with each original independently and fairly dealt against a fixed candidate 60, gives:

| Offered bonus opportunity, mean across known 29 source ranks | Champion (14 eligible Basics) | New Moon (17 eligible Basics) |
| --- | ---: | ---: |
| Candidate probability of at least one optional bonus-card offer | **18.78752%** | **19.63703%** |
| Candidate mean offered bonus-card count | **0.304018** | **0.316369** |
| Source probability of at least one offer | 11.25529% | 6.70528% |
| Source mean offered count | 0.130661 | 0.073157 |
| Share of candidate mean offered bonus cards contributed by the three Iron Thorns ranks | **48.05817%** | **47.42561%** |

The sparse three originals comprise 3/29 of the known ranks but contribute nearly half the *expected candidate bonus-card opportunities*, which is relevant when budgeting unmatched setup strata and interpreting candidate starting-hand access. Equal weighting here is a transparent mathematical convention, independent of tournament-round frequency, matchup difficulty or actual game performance. No distribution has been inferred for the original ranks 23, 25 and 28.

**Reproducibility:** [field-wide code](../../scripts/agent16-aichi-bilateral-mulligan-field.cjs) and [Node 22 SFT](../../tests/agent16-aichi-bilateral-mulligan-field.test.cjs) check all 29 original Basic counts, printed-stage ambiguity, source total-60 and the two exact aggregate vectors. The local SFT passed three cases with *synthetic per-rank 60s reproducing the independently verified Basic counts*; the full exact test against the unmodified repository originals is committed but **has not yet executed in compiled CI**. The actual 102 distinct printed-name stage classifications were checked separately against the uploaded ZIP. No native game or physical opening was generated by this calculation.

### Attribution and relation to earlier work

Agent17's [prior mutual-mulligan ADP source-vs-candidate regression](../../tests/agent17-adp-rank6-mulligan-coupling.sft.cjs) already derived the **same underlying geometric difference-of-failures bonus distribution** for an independent seven-Basic ADP challenger and rank6 Iron Thorns. This report does **not** claim discovery of that probability law. Its distinct scope is a verified 29-original source-name Basic census, fixed champion/New Moon comparison and setup-provenance calibration. Agent4's real postsetup per-seat shuffle experiment is a separate genuine Store protocol investigation; the analytical census cannot certify its physical matching.

### Independent repository baseline located after this report

[Agent1's earlier exact source-printing model](../../simulation/evaluation/agent1-original-field-mulligan-bonus.cjs) **already supplies** the same bilateral law, exact original 29 starting-Basic counts, and a general equal-rank-weight field mean for multiple other candidate 60s. Its printed-ID classifier, including documented promo exceptions, is a stronger original-stage authority than a name-level stage index. [Agent27's existing field-wide ADP application](../../simulation/evaluation/agent27-adp-original29-mulligan-bounds.cjs) also conditions on all 29 originals. The Agent16 contribution should therefore be treated as an *independent numeric replication and application of these existing tools to champion and New Moon fixed 60s*. The new name-level census is a cross-check, not a superior replacement for Agent1's exact-print classifier. It supplies no newly established policy strength. New work should prioritize whole-policy owner moves and competent responses.
