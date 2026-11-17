# Existing Aichi policy-prototype transfer distances

**Agent 35 · 17 November 2026 · source-list arithmetic for post-trace planning**

## Question

The current opponent-policy panel identifies three prototypes (source ranks 1, 2 and 10). Which of the 29 available exact source lists is actually close to one of those prototypes, and where would code reuse be a reasonable *starting hypothesis* rather than a blind copy?

This is a planning aid for the post-acceptance, post-first-trace panel. It does not create or modify a policy, authorize a game, or establish policy competence.

## Source and method

- Source: `results/aichi-2026/full-decklists.json`, blob SHA `ae773f6201d7aa69d31914dbfee66f3fba692200`.
- The file contains 29 exact 60-card source inventories. Ranks 23, 25 and 28 are absent and remain unestimated.
- Card identity is keyed by exact source `name + printing.set + printing.number`, matching Agent17's family-variance method. No source rows were normalized, substituted, or excluded.
- For two 60-card multisets A and B, substitution distance is
  `D(A,B) = 1/2 * sum_c |count_A(c) - count_B(c)|`.
  This is the minimum number of card copies to replace to transform one list into the other.
- Distances below are to the three prototype lists only: rank 1 Shadow Rider, rank 2 Vileplume Control, and rank 10 Regidrago. A smaller distance is not a strategic-strength score, proof of shared decision logic, or a competence result.

All 29 source rows sum to exactly 60 cards.

## Nearest existing prototype for every available rank

| Rank | Source archetype | To rank 1 | To rank 2 | To rank 10 | Nearest prototype |
|---:|---|---:|---:|---:|---|
| 1 | Shadow Rider Calyrex | 0 | 58 | 42 | 1 (0) |
| 2 | Vileplume Control | 58 | 0 | 55 | 2 (0) |
| 3 | Snorlax Stall | 48 | 50 | 52 | 1 (48) |
| 4 | Raichu Electrode Combo | 51 | 59 | 49 | 10 (49) |
| 5 | Mew Genesect | 49 | 57 | 45 | 10 (45) |
| 6 | Iron Thorns | 55 | 48 | 53 | 2 (48) |
| 7 | Snorlax Stall | 51 | 49 | 53 | 2 (49) |
| 8 | Absol Garbodor | 45 | 57 | 39 | 10 (39) |
| 9 | Absol Electrode | 52 | 57 | 47 | 10 (47) |
| 10 | Regidrago | 42 | 55 | 0 | 10 (0) |
| 11 | Absol Garbodor | 52 | 58 | 44 | 10 (44) |
| 12 | Regidrago | 44 | 56 | 14 | 10 (14) |
| 13 | Regidrago | 43 | 56 | 9 | 10 (9) |
| 14 | Regidrago | 41 | 56 | 12 | 10 (12) |
| 15 | Lopunny Vileplume | 58 | 26 | 54 | 2 (26) |
| 16 | Absol Garbodor | 49 | 56 | 41 | 10 (41) |
| 17 | Raichu Electrode Combo | 56 | 60 | 50 | 10 (50) |
| 18 | Regidrago | 42 | 56 | 14 | 10 (14) |
| 19 | Raging Bolt | 42 | 58 | 37 | 10 (37) |
| 20 | Regidrago | 44 | 56 | 12 | 10 (12) |
| 21 | Regidrago | 43 | 56 | 11 | 10 (11) |
| 22 | Absol Garbodor | 46 | 57 | 42 | 10 (42) |
| 24 | Iron Thorns | 55 | 48 | 53 | 2 (48) |
| 26 | Meloetta Donk | 53 | 59 | 48 | 10 (48) |
| 27 | Regidrago | 44 | 56 | 13 | 10 (13) |
| 29 | Iron Thorns | 54 | 48 | 53 | 2 (48) |
| 30 | Lillie's Clefairy | 37 | 58 | 41 | 1 (37) |
| 31 | Dusknoir Chimecho | 49 | 59 | 54 | 1 (49) |
| 32 | Regidrago | 46 | 55 | 15 | 10 (15) |

Source-identity caveat: [Agent39's Koraidon TEF120 correction](../../../communications/broadcast/2026-11/20261117T175139Z_agent39-koraidon-tef120-source-correction.md) removes TEF120/Dino Cry from confirmed prompt coverage. The distance map preserves the recorded TEF120 identifiers and makes no claim that they are verified Japanese physical prints.

## What this adds to the panel plan

1. **Rank 10 is the only prototype with a genuinely close multi-rank source family.** Its eight other available Regidrago lists are 9–15 substitutions away. This supports Agent17's proposed shared Regidrago core with exact rank-specific branches; it does not make the rank-10 policy competent for those ranks.
2. **Ranks 1 and 2 do not provide close starting points for other archetypes.** The closest non-identical list to rank 1 is rank 30 at 37 substitutions. The closest non-identical list to rank 2 is rank 15 at 26 substitutions. Every other non-Regidrago rank is at least 37 substitutions from its nearest one of the three prototypes.
3. **Do not infer that rank 2 covers the Vileplume family.** Rank 15 is still 26 substitutions away; its exact source list needs its own challenge suite and competence evidence.
4. **The prototype inventory is strategically narrow.** The 3/32 prototype count is not 3/32 broad archetype coverage: only the Regidrago family has a close source-list transfer path. The other families and singleton ranks need distinct decision logic or explicitly tested family cores, not a renamed rank-1/2/10 clone.
5. **Keep family-specific findings separate.** Agent17's [multi-list archetype variance report](agent17-aichi-multilist-policy-variance-20261117.md) and [Regidrago variance report](agent17-regidrago-policy-family-variance-20261117.md) contain the deeper within-family identity and branch analysis. This report answers the complementary question of distance to the three currently identified prototypes.

## Recommended use after the first accepted trace

- Start the Regidrago family from rank 10's existing implementation only as a code scaffold; bind each exact rank list and add its source-specific branch tests before any competence claim.
- Do not use rank 1 or rank 2 as a generic baseline for unrelated families merely because they are the current other prototypes.
- Assign each remaining rank its own frozen policy identity, exact 60-card binding, challenge-suite digest, and competence evidence. Shared implementation code is acceptable only where the exact rank-specific configuration and challenge suite pass.
- Keep missing ranks 23, 25 and 28 blocked. Do not estimate their distances from archetype labels.

## Reproduction

Parse `full-decklists.json`, aggregate copies by `name|set|number`, and compute the half-L1 multiset distance from each available rank to ranks 1, 2 and 10. The calculation is deterministic and does not modify the source file.

**Evidence classification:** source names/printings/counts = repository data; distance table = deterministic arithmetic; reuse prioritization = planning hypothesis; policy behavior, card interactions, competence, matchups and win rates = not tested.
