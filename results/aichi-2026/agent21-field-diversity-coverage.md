# Agent 21: exact source-list diversity and bounded opponent-panel coverage

**19 October 2026. Evidence class: exact calculation over the 29 published Aichi Top-32 60-card source inventories.** This is a workload-design result. It is **not** a game simulation, opponent-policy certificate, card-effect equivalence proof, matchup-strength estimate, or advancement of the 99.5% claim. Missing ranks **23, 25 and 28** remain unknown.

## Question

When compiled games are expensive and source-policy qualification is weak, which **published, distinct source 60s** does a small matchup pilot fail to represent even before evaluating play? Existing ten-rank diagnostics sample rank 3 Snorlax, rank 4 Raichu, rank 6 Thorns, ranks 8+11 Absol/Garbodor, and rank 10 Regidrago. This analysis quantifies exact source-card differences and identifies additional printed lists for eventual **policy-qualified** bilateral testing. It must never be used to impute an untested matchup's result from its nearest list.

## Data and metric

Input: [the 29-list source manifest](full-decklists.json), Git blob SHA `ae773f6201d7aa69d31914dbfee66f3fba692200`. Each source 60 is validated, and repeated rows of one card name/printing are **summed**, an essential detail for mixed-print Vileplume, Garbodor, Trubbish and Dusknoir configurations. Names are compared in one metric; the primary identity also requires `name + set + number + language`, preserving different prints of the same name.

For two 60-card multisets A and B, define the *card-replacement distance*:

`d(A,B) = 60 - sum_card min(count_A(card), count_B(card))`.

It is the minimum number of physical slots that must be replaced to convert one inventory into the other, treating printed IDs as distinct. This is symmetric, zero on identical source lists, and satisfies the triangle inequality. Reprints with the same functional effect can inflate print distance; a one-card effect change can still produce a decisive matchup swing. Neither distance has an empirically established correspondence to game win rates.

For one named archetype and k available opponent-study slots, choose k **actual published source ranks** that minimize the largest distance between any printed archetype member and its nearest chosen member (exact discrete k-center). Enumeration is exhaustive, including ties. The optional constrained version requires previously selected pilot source ranks. All 29 inventories were checked. Source: [reproducible read-only CommonJS analysis](../../scripts/aichi-field-list-coverage.cjs); [assertion suite](../../tests/aichi-field-list-coverage.test.cjs).

## Observed diversity

| Source archetype | Published 60s | Closest printed pair | Farthest printed pair | Optimal 1-list minimax radius | Optimal 2-list minimax radius |
| --- | ---: | --- | --- | ---: | ---: |
| Snorlax Stall | 2 | 3/7: 34 swaps | 3/7: 34 | 34 | 0 |
| Raichu Electrode | 2 | 4/17: 21 | 4/17: 21 | 21 | 0 |
| Iron Thorns | 3 | 6/29: 5 | 24/29: 18 | 14, rank 6 | 5, ranks 6+24 or 24+29 |
| Absol Garbodor | 4 | 8/22: 11 | 8/11: 28 | 23, rank 16 | 16, ranks 8+11 |
| Regidrago | 9 | 12/27: 6 | 18/32: 21 | 15, rank 10 | 12, ranks 18+21 |

For Regidrago the best three-source printed radius is **11** (nine optimal rank sets; one is 10+12+18) and four sources attain **10** (four optimal sets; one is 10+14+18+20). Printed rank-18 and rank-32 Regidrago lists differ in **21** of their 60 positions, despite sharing the same archetype label. Rank-18 runs four Battle VIP Pass and three Sky Field while rank-32 has no copies of either, and their remaining search, Energy, attack payload and disruption compositions differ. This illustrates a potential policy/ALS transfer risk without establishing which list is stronger.

Other particularly large contrasts: the two published Snorlax lists differ by **34** printed slots, including four Arven versus four Steven's Resolve and substantially different denial/search packages. The source rank-8 versus rank-11 Garbodor lists differ by **28** printed slots and have different Oranguru V, Tool/search, and Energy structures. A source bot qualified on one should not be assumed valid on the other.

Name-only versus print-specific counting matters: rank 8 against rank 22 Absol Garbodor has **7** name-level replacements, but **11** printing-sensitive replacements. This occurs in a published pool where differing printed Garbodor/Trubbish implementations can be strategically relevant. Source rows, not just card names, must travel with tests.

## Incremental coverage from the current pilot

Fix the source ranks already sampled in the common ten-rank campaign, then add **one** further published source 60 within the same archetype:

| Archetype | Existing source rank(s) | Worst printed distance now | Optimal extra rank | Worst distance after |
| --- | --- | ---: | --- | ---: |
| Snorlax Stall | 3 | 34 | **7** | **0** |
| Raichu Electrode | 4 | 21 | **17** | **0** |
| Iron Thorns | 6 | 14 | **24** | **5** |
| Absol Garbodor | 8, 11 | 16 | **16** | **11** |
| Regidrago | 10 | 15 | 12, 14, 20, 21, 27 or 32 (tie) | **14** |

The current rank-10 Regidrago single source is **already the optimal one-source minimax center** by this crude metric, and ranks 8+11 are **already the optimal two-source Garbodor centers**. The largest overlooked *same-archetype* inventory divergence is instead Snorlax rank 7 and Raichu rank 17. This is useful for scheduling a future test, **only after** bilateral policies and printed effects are qualified.

## Practical consequences and caveats

1. Keep rank 6 Iron Thorns and ranks 8/11 equipped-Garbodor as the present **cross-lock bilateral-policy qualification gate**. The calculation gives no reason to bypass that Critic priority or rerun defective bots. Use already verified line-specific regression controls.
2. When a policy can execute a real competing action and reply in those archetypes, spend the next source-list expansion budget on **rank 7 Snorlax** and **rank 17 Raichu** rather than assuming existing archetype aliases generalize. Both are registered exact 60s and represent large inventory differences from the current pilot.
3. If studying a second printed Iron Thorns list, rank 24 removes all but five printed slot distances from the closest chosen Thorns representation. Rank 29 would leave the worst-case distance at fourteen with rank 6 fixed. Rank 16 is the stronger next printed Garbodor coverage point after ranks 8+11.
4. A purely printed-card-distance study **cannot** certify variation of decisions, win conditions, opponent skill, card-effect fidelity, paper Expanded legality or Japanese registration. Two decks only five swaps apart can have materially different matchup lines. Conversely many alternate full-art/reprint IDs may be mechanically equivalent. Preserve name and printing views; test observed decision lines independently.
5. The three unrecovered exact ranks remain outside all distance calculations. Do not add inferred Regidrago/Raichu lists or pool match results through the nearest observed archetype.
6. This is a **descriptive design calculation**, with no stochastic seed, game clock or match result. The source SHA and code allow independent reproduction. The regression suite was executed against the authentic 29-list JSON using the exact committed source/test bodies in a V8 read harness with Node built-in shims; **native Node CI has not been run**, and no GitHub Actions minutes were spent.

**Research decision:** preserve all existing frozen 60-card candidates and tests. The next high-value experimental transition remains a genuine, held-out two-party attack/response comparison across at least two hard archetypes. This analysis specifically identifies which later source 60s broaden that comparison without claiming a deck has become stronger.
