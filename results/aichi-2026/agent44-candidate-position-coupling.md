# Agent 44: position-induced collapse of nominal common-random-number comparisons

**18 October 2026 UTC.** Evidence class: exact source-printing array comparison and finite-population combinatorics. No game, simulator outcome, paper legality, or competitive win probability is certified.

## Question

The fixed Aichi campaign intentionally reuses each `(phase, placement, repeat, physical candidate slot)` seed across the champion-reference, Hood Shield v1 and Temple v1 lists. Does same-seed experimentation produce meaningfully aligned opening cards when the candidate inventories are mostly shared?

For any identical permutation of the original 60 physical card indices, two lists can show the same printing at a selected index only when the source arrays agree **at that index**. Although the three lists share 55–56 of their 60 printing-identical copies, their JSON card-row order places shared copies at quite different index positions. The reference is `full-decklists.json` rank 1, and the challengers are `candidate-hood-shadow-rider.json` and `candidate-temple-shadow-rider.json`. The shared printing resolver preserves row/copy order in `simulation/twinleaf/resolve-field.cjs` (`cardIds.push(...Array(item.count).fill(name))`).

## Exact source-array findings

| Fixed pair | Shared printing copies | Identical source positions | Probability all first 7 shuffled indices match | Maximal printing-aligned probability |
| --- | ---: | ---: | ---: | ---: |
| Champion reference / Hood Shield | 55 | 28 | **0.306582%** | **52.543783%** |
| Champion reference / Temple | 55 | 19 | **0.013047%** | **52.543783%** |
| Hood Shield / Temple | 56 | 38 | **3.267745%** | **60.050037%** |

The displayed percentages are for **index-by-index equality**, conditional on the two 60-source-index decks receiving the same ideal uniform permutation, and before any game-specific setup randomness. If `m` of `60` corresponding indices contain the same printing, then the event that all `k` sampled indices have identical printings has exact probability

`P(indexwise agreement on k indices) = C(m,k) / C(60,k) = product_(i=0)^(k-1) [(m-i)/(60-i)]`.

It is possible for unordered opening hands to agree despite some indexed differences, so the table **must not** be read as a probability of equal unordered hands or as a probability of field-game equivalence. Shared printing-copy overlap (55 or 56) gives the *maximum achievable indexed matches* by choosing a new, deterministic candidate array ordering; the last column is that corresponding maximal seven-index event probability, not an empirical win-rate effect.

A more severe thirteen-index sensitivity illustrates opening/Prize coupling in the same ideal model. For Champion/Hood, `C(28,13)/C(60,13) = 0.00000724659`; for Champion/Temple, `C(19,13)/C(60,13) = 0.00000000525115`. Both would have `C(55,13)/C(60,13) = 0.2808634312` in an optimally indexed common-copy arrangement. Here thirteen means a fixed set of seven opener and six Prize-deal original indices; it does not assert actual chronology or hand identity after mulligans.

## Three-list alignment is simultaneously feasible

The two reference-aligned variants can also attain the **Hood/Temple maximum of 56 shared positions simultaneously**, without sacrificing either champion/variant 55-position maximum. Holding the champion printing array fixed, reference-constrained unmatched source index positions (zero-based) are:

- Hood: `[10, 20, 26, 37, 47]`.
- Temple: `[6, 10, 20, 26, 47]`.

One maximal assignment fills Hood's five indices respectively with Shadow Rider Calyrex V, Pokémon Ranger, Stealthy Hood, Stealthy Hood, and Arven; Temple's five with Wobbuffet, Shadow Rider Calyrex V, Pokémon Ranger, Temple of Sinnoh, and Temple of Sinnoh. For each variant all other entries are the matching reference printing. Enumerating the `5! × 5! = 14,400` candidate remainder placements yielded **432** equally scored best joint arrangements. Those attain the pairwise indexed-overlap vector `(55, 55, 56)`. This mathematical construction makes no claim that initial source-order reformatting improves the game-playing deck; it provides a controlled design for prospective seed-matched diagnostics.

## Finite v3 seed-schedule sensitivity

To inspect the *actual scheduled seeds* without playing any Pokémon TCG games, I independently reproduced `aichi-decorrelated-seeds.cjs` SHA-256 seed derivation and `headless.cjs` xorshift32/Fisher–Yates **index-only** shuffle in Python. The rank-6 pilot A/B seeds reproduced the checked-in values `1509836216` and `995631139`, and the first 15 shuffled indices for A matched a separate Node 22 xorshift check:

`[54, 23, 32, 25, 50, 40, 13, 10, 8, 2, 14, 16, 1, 57, 33]`.

I swept `2 phases × 32 hypothetical placements × 100 repeats × 2 physical slots = 12,800` valid deterministic v3 seeds at base `20261016`. Missing opponent placements appear here **only as seed labels**; their decklists were never invented or simulated. For each seed, both variants were subjected to exactly the same original-index shuffle. An event counted when all first seven shuffled indices had identical printings across a candidate pair.

| Pair | Original row order: matching events / 12,800 | Simultaneously aligned input order: matching events / 12,800 |
| --- | ---: | ---: |
| Champion / Hood | **46** (0.359375%) | **6,724** (52.531250%) |
| Champion / Temple | **5** (0.039063%) | **6,672** (52.125000%) |
| Hood / Temple | **393** (3.070313%) | **7,624** (59.562500%) |

The low-probability Champion/Temple event has high relative finite-sample noise, so the **exact combinatorial values in the first table** are the primary inference; these fixed-seed counts are a reproducibility cross-check. This sweep does **not** simulate mulligans, evolving board state, card-play effects, opponent decisions, hidden information, or game outcomes. It does not assert the pinned game's actual initial RNG streams remain synchronized across deck variants.

The pure [12,800-seed experiment helper](../../scripts/aichi-position-seed-sweep.cjs) and [schedule regression](../../tests/aichi-position-seed-sweep.test.cjs) codify the same experimental distinction, including `actualGamesMeasured: 0`. Existing manual v3 seed tests import these checks. The raw positional analysis was independently executed from the checked-in remote source in a JavaScript isolate; full official Node CI dispatch remained unavailable due to host safety checks at this checkpoint.

## Why this matters

The v3 SHA-256 physical-slot seeding correctly avoids the proven adjacent-slot xorshift32 coupling. It also intentionally gives candidate *variants* the same source RNG seed for controlled comparisons. **Seed equality alone establishes neither paired starting hands nor a high-overlap treatment/control opening.** Unaligned source rows can create substantial deal variation on top of the proposed card difference, reducing the precision of small-sample structural candidate comparisons.

This issue differs from [Agent 9's first-turn comparability finding](../statistics/paired-start-order-comparability.md), which tests the observed first-player label. Even identical observed first players do not imply opener coupling or invariant draw sequences. Actual game RNG use, setup mulligans, shuffle triggers, opponent responses, and policy decisions can destroy indexwise coupling; a *single* fixed seed and initial array alignment never guarantees a causal match trajectory. The historical v3 runs remain valid records of their original seeds and exact source arrays; no historical outcome is rewritten or retroactively promoted.

## Pure, reproducible artifact

- [Printing-position calculator](../../scripts/aichi-position-coupling.cjs) expands source JSON copies, calculates overlap and the hypergeometric event, and offers `alignToReference`. This helper returns **a new order of exactly the original candidate printing multiset** that achieves maximal equality with a reference array.
- [Printing-position regressions](../../tests/aichi-position-coupling.test.cjs) use the actual three frozen JSON lists. They check 28/19/38 physical matches, 55/55/56 shared copies, exact probabilities, preservation of the 60-card multiset and maximum-alignment construction.
- This audit performs no simulator play. The helper has deliberately **not** been wired into the existing comparison campaign or headless runner. Existing source-card order, historical deck digests, fixed seeds and hashes are unchanged.

## Recommendations and falsification gates

1. For future **new** paired diagnostics, version the initial-deck-order protocol as a distinct experimental treatment. Compare source-order and reference-aligned order under the same print-frozen 60s and separately recorded seeds. Preserve each ordered card-array hash and the unordered print-fingerprint; never relabel old v3 observations.
2. Report what was paired: physical seed, original printing-index overlap, observed first player, observed original seven, and known Prizes after a legal first deck search where relevant. Do not infer matching hands merely from seeds or a matching first player.
3. Confirm the compiled pinned engine's actual shuffle/Prize/mulligan sequencing and deck order effects before promoting this ideal permutation calculation to a source-game causal interpretation. Incorporate true opponent counterplay and both starting seats.
4. Prefer prospective, properly qualified and sufficiently sampled game comparisons over attempts to use this probability to predict deck win rate. All 32 opponent source lists and independent paper/policy gates remain required for any 99.5% claim.

**Status:** This is evidence-quality methodology only. As of this result, 29/32 exact source lists exist, zero independently qualified competitive games, and no demonstrated 99.5% win rate.
