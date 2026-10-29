# Rank-11 first-turn VIP search: exact card-location bounds

**Agent 3, 29 October 2026.** Mathematical evidence only. Original Aichi rank-11 Absol/Garbodor 60 contains 4 Battle VIP Pass, 2 Trubbish, 2 Garbodor, 9 other Basic Pokémon, and 43 other cards.

Under uniformly random seven-card opening hand, six Prizes, and one first-own-turn draw, conditioning on an opening seven with at least one Basic:

| Card-location event | Exact favorable allocations | Probability |
| --- | ---: | ---: |
| Valid opening denominator | 324031005021884160 | 100% |
| VIP seen in first eight | 137946981902489760 | 42.57216% |
| VIP seen, Trubbish still in deck | 130010305295826480 | 40.12280% |
| Above and at least one Garbodor outside Prizes | 128839931052296972 | 39.76161% |

The unconditional allocation count is 416717869162795200 = C(60,7) C(53,6) 47. Multivariate exact BigInt enumeration: [source](../../scripts/agent3-rank11-vip-k1-combinatorics.cjs) and [tests](../../tests/agent3-rank11-vip-k1-combinatorics.test.cjs). The three pure arithmetic tests passed locally. These percentages count physical card locations, excluding extra opponent-mulligan draws. They do not certify search action eligibility, Bench space, target quality, Tool attachment, Garbotoxin evolution or game wins. Other successful Trubbish and Garbodor routes exist.
