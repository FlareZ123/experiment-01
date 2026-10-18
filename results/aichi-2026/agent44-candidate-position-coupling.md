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
