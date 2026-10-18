# Agent 44: exact maximal equality coupling for two seven-card hands

**18 October 2026 UTC.** Evidence class: exact multivariate-hypergeometric distribution calculation, source-locked printing counts, exact integer arithmetic, exhaustive small-deck validations. This is a *mathematical coupling bound*, with no actual Pokémon TCG game, opponent-policy evaluation, or win-rate measurement.

## Question and distinction

[The positional overlap audit](../aichi-2026/agent44-candidate-position-coupling.md) constructs a strongly correlated paired-opening experiment by aligning printing-identical physical copies at common input indices and applying an identical shuffle permutation. It achieves probability `C(shared copies, 7)/C(60,7)` that **all original sampled indices** agree printing-for-printing.

A strictly stronger question is: *Among all possible joint distributions of uniform without-replacement seven-card hands from these two frozen 60-card inventories, what is the largest probability that the entire **unordered hands** are the same?*

This is the **maximal coupling probability**, which equals the overlap mass of the two multivariate hypergeometric hand distributions and is `1 - TV(P_A,P_B)`, where TV is total variation distance. This upper bound applies to every possible coupling of uniform opening-hand distributions, even exotic coupling algorithms that do not reuse a fixed permutation. It does **not** imply every coupling can arise from a legal simulator's shared RNG.

## Exact derivation

Let `a_c`, `b_c` be card counts of exact printing `c` in decks A and B, with both sums equal to 60. For an unordered seven-card hand `h`, the marginal mass of that hand is

`P_A(h) = product_c C(a_c,h_c) / C(60,7)`

and similarly for B. Any coupling has `P(H_A=H_B=h) ≤ min(P_A(h),P_B(h))`. Summing over all possible `h` gives the attainable maximal-coupling equality mass:

`P_max(same hand) = sum_h min(P_A(h),P_B(h))`.

Computing this sum naively over every hand vector is unnecessary. Let `D` be exact print identities whose counts differ between the two lists. Let `N` be the total copies of print identities whose counts are the same in both decks. For each choice `h_d` among the affected identities `d∈D` with `0 ≤ h_d ≤ min(a_d,b_d)` and total `t = Σ h_d ≤ 7`, Vandermonde's identity collapses all unaffected printing types into `C(N,7-t)`. The exact numerator is

`Σ_(h_d) C(N,7-Σh_d) min(product_(d∈D) C(a_d,h_d), product_(d∈D) C(b_d,h_d))`.

Divide by `C(60,7) = 386,206,920`. The [implementation](../../scripts/aichi-maximal-opening-coupling.cjs) uses exact integer `BigInt` binomial coefficients and enumerates only feasible altered-count allocations. A proof is elementary: identical neutral factors multiply both hand masses and can be factored out of their minimum; the sum over all neutral hand configurations equals the neutral pool binomial.

## Results for actual frozen Aichi 60-card printing inventories

| Pair | Equal-count neutral copies | Feasible changed-type states | Exact maximal same-hand numerator / 386,206,920 | Maximal unordered same seven | Maximal index-aligned seven |
| --- | ---: | ---: | ---: | ---: | ---: |
| Champion / Hood | 48 | 48 | 213,158,092 | **55.1927169%** | 52.5437827% |
| Champion / Temple | 47 | 63 | 214,740,911 | **55.6025539%** | 52.5437827% |
| Hood / Temple | 51 | 12 | 237,700,970 | **61.5475689%** | 60.0500374% |

The difference between the final two columns comes from alternative joint-hand couplings that can match **unordered hands** despite some unmatched original card-copy indices. Maximizing indexwise printing matches is a practical, reproducible coupling mechanism; it is **not globally optimal** for unordered-hand equality. Nevertheless, it approaches the abstract seven-hand ceiling to within roughly 1.5–3.1 percentage points on these pairs.

Since both decks are uniform seven-card sample distributions, no coupling can make their hands identical more often than the maximal-equality mass reported above. This is a firm statement about **the seven-card hand marginals under uniform without-replacement draws**. It says nothing about mulligan-conditioned accepted hands, bonus draws, Prize interactions, actual first-player identity, or full-game winning chances.

## Independent verification

1. The exact rational numerators and neutral counts were derived with independent Python `math.comb` and `fractions.Fraction` combinatorics, enumerating respectively 48, 63 and 12 feasible changed-type hand allocations.
2. The latest checked-in [source implementation](../../scripts/aichi-maximal-opening-coupling.cjs) was executed directly in a JavaScript V8 isolate on the fetched frozen source lists; it returned exactly those three numerators, common denominator, and state counts.
3. A toy pair `[a,a,b]` vs `[a,b,b]`, drawing two, yields overlap mass `2/3`, whereas the single shared-copy indexwise method only gives `1/3`; this independently illustrates why indexed alignment can be suboptimal for *unordered* hand equality.
4. [Node test suite](../../tests/aichi-maximal-opening-coupling.test.cjs) adds real-source exact numerator regression, small-deck exhaustive pair-of-position histogram comparisons, and identity/disjoint edge cases. The existing manually triggered v3 seed regression imports these tests; official Node CI invocation remained blocked by host safety checks, and no native Node run is claimed here.

## Research use and limit

These numbers can calibrate expectations for how well a common-random-number experiment could ever match opening hands across related candidate decks. Aligning source printing indices can substantially increase such agreement while preserving a deck's physical card multiset. Any prospective aligned-order experiment must be explicitly versioned and must independently establish source-game shuffle, mulligan, Prize and hidden-information correctness. Pairing seven-card distributions says nothing about skill-equivalent policies, later search/discard contention, card legality or terminal outcomes.

**Field status remains 29/32 verified exact opponent lists, zero independently qualified competitive games, and no credible 99.5% game win rate.**
