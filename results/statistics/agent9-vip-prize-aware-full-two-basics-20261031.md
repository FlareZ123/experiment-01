# Original-source Crobat / Battle VIP Pass: post-Prize two-Basic search feasibility

**Agent 9 | 31 October 2026 | exact physical combinatorics, not native Store dispatch or game strength.**

## Question

The [nine-source initial Crobat/VIP owner-hand study](agent9-crobat-vip-coholding-opening-20261031.md) counted the conditional probability of having Crobat V still in hand, Battle VIP Pass available, and enough Bench room to search **two** Basics and later play Crobat. It did not impose that the six face-down Prizes leave **two actual Basic cards** in the deck after the owner's initial hand and any first-turn ordinary draw.

This study quantifies the extra Prize-collapse risk rather than treating a hand-space reachability path as a guaranteed two-card search. It uses the **nine authenticated original source printed sixties** at ranks 4,5,8,11,16,19,22,26,30. Rank 4 and 16 each have two Crobat copies; other listed sources have one.

## Exact state and counting

Take a uniformly randomized original 60. Condition on an opening seven with at least one Basic. Select the initial Active Basic so that **at least one Crobat can remain in hand** where possible. Assume all opening Basics other than the Active and the one retained Crobat are put onto the Bench. A full VIP search adds two physical Basics; playing the held Crobat afterward uses one more Bench slot, so an initially retained Crobat requires no more than **four** initial Basics, while a Crobat drawn afterward requires no more than **three** initial Basics. We require the player's first turn to have at least two search-eligible Basics physically remaining in their shuffled deck, outside their hand and Prize cards.

For going first, evaluate after seven-card setup and six random Prizes. For going second, explicitly condition on the same opening and Prizes, then draw **one** ordinary card from the remaining 47-card deck before considering VIP and Crobat. Opponent effects, mulligan bonus draws, Item/Ability locks, search effects, hand and Bench choices beyond the stated setup policy, and actual optional Dark Asset activation are outside the model.

Let `B` be original Basic count, `K` Crobat count, `V` VIP count, and `X=60-B-V`. An opening containing `(c,v,o,x)` copies of Crobat, VIP, other Basics, and other cards has weight

```text
W0 = C(K,c) C(V,v) C(B-K,o) C(X,7-c-v-o).
```

Only `c+o>=1` is retained. After the initial hand, the six Prizes are partitioned into `(pc,pv,po,px)` with weight

```text
WP = C(K-c,pc) C(V-v,pv) C(B-K-o,po) C(X-x,6-pc-pv-po).
```

For each opening/Prize partition, require `K-c-pc + B-K-o-po >=2` remaining Basics before first-player VIP search. For going second, enumerate the four **actual** post-Prize deck categories with their exact remaining physical multiplicities (summing to 47) as the one-card draw, and require at least two Basics remain after that draw. Retained Crobat count is `c-[o=0]` plus any subsequently drawn Crobat. The enumerator preserves every valid opening and Prize partition, and compares these constraints with the existing Bench-only counterfactual.

Normalization is `[C(60,7)-C(60-B,7)] * C(53,6)` going first, with one more factor `47` for the ordinary draw going second. Exact integer weights avoid rounding the low-probability Prize-failure tails.

## Original-source results

The **Prize-aware full-two-Basic search** percentages are conditional on a Basic-valid starting seven.

| Source rank | B | VIP | Crobat | Going first | Going second | Extra Prize failure, going second (percentage points) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 4 | 13 | 1 | 2 | 1.8522191059% | 2.5115137881% | 0 |
| 5 | 11 | 3 | 1 | 2.6445245835% | 3.5540115369% | 0.000000333924 |
| 8 | 10 | 2 | 1 | 1.7943252323% | 2.4397381717% | **0.000004466666** |
| 11 | 11 | 4 | 1 | 3.3928604307% | 4.5191600547% | 0.000000434442 |
| 16 | 11 | 2 | 2 | 3.4135083525% | 4.6148428129% | 0.000000387806 |
| 19 | 16 | 2 | 1 | 1.9644130794% | 2.6272861661% | 0 |
| 22 | 12 | 2 | 1 | 1.8660679371% | 2.5242187604% | 0.000000005797 |
| 26 | 12 | 3 | 1 | 2.6923405014% | 3.6087536751% | 0.000000008509 |
| 30 | 16 | 3 | 1 | 2.8300549715% | 3.7501490153% | 0 |

The **largest additional failure** from two Basics being inaccessible due to Prize placement is approximately `0.00000447` percentage points in this nine-source, Bench-capacity-conditioned, direct-hand opening model. It should not be generalized to singleton evolution chains or other Prize-sensitive cards; this result exploits the number of original Basics and the specific required count of **two**.

At ranks **4, 19 and 30**, all counted full-Bench-feasible hands already guarantee two Basics remain after Prizes and the ordinary draw by a pigeonhole bound. At the other ranks, the exact tail is nonzero but very small. Thus the real unresolved **native action ordering, collision with other actions, and practical Bench allocation** dominate this narrowly defined Prize-limited failure.

## Reproduction and scope

- [Source-stage-audited nine-rank evaluator](../../scripts/agent9-crobat-vip-cohold.cjs) reads the original field and printed-card metadata.
- [Post-Prize exact two-search evaluator](../../scripts/agent9-vip-two-search-prize.cjs) enumerates all initial seven, Prize partitions, and ordinary draw categories with BigInt.
- [Independent brute-force tests](../../tests/agent9-vip-two-search-prize.test.cjs) exhaustively enumerate **all physical ordered opening/Prize/draw choices** in a ten-card toy deck with one or two Crobat, and check selected original source percentages.

Local Node.js 22 tests **3/3 passed** on the supplied original printed card archive plus reconstructed target original Pokémon inventories. The exact GitHub main repository integrated suite has not been run. The testing/CI boundary, inability to modify an existing workflow through the repository safety gate, and zero competitively qualified game status remain unchanged.

**No deck recommendation follows.** Full Aichi Top32 original source coverage remains 29/32, and the 99.5% field target remains unproven.
