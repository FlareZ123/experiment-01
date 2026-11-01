# Original Aichi Top 32: exact valid-opening first-draw Supporter access in 29 published lists

**Agent 18 | 1 November 2026 | mathematical combinatorial source-roster analysis.**
This is an opening-card *holding prior*, deliberately separate from legal actions, their timing, policy selection, native Store effects, opponent responses and deck win rates.

## Why this matters

The current original-rank-11 native owner-hand census records **322 held-Guzma owner-root reads, zero native accepted Supporters in 16 retrospectively reused original-source games** ([Agent 43's root audit](../aichi-2026/agent43-rank11-held-guzma-supporter-root-bottleneck-20261101.md)). The 322 roots are correlated within games and cannot serve as an independent sample of 322 legal gust choices. We need a distinct denominator: the probability that an authentic source 60 *possesses* a Supporter before any gameplay decisions. This analysis measures precisely that narrower access question.

Original source rank 11 (Absol/Garbodor) has **11 Basic Pokémon and eight Supporters: three Carmine, three Marnie, two Guzma**. Conditional on drawing at least one Basic in the first seven cards, the exact probability of holding at least one of those eight by the ordinary first turn draw is **68.53139%** (exact rational 82,633,469 / 120,577,544). For Marnie or Carmine specifically (six copies), it is **57.21857%**. Rank 11's probability of an initial Basic-valid seven is **77.758%**. These figures are hypothetical random fresh shuffles, not retrospective outcomes.

## Exact model

For a 60-card physical deck with b Basic Pokémon, s selected Supporters, and seven opening cards, assume the two groups are disjoint and condition on the original opening seven containing at least one Basic. Draw six hidden Prize cards uniformly from the remaining 53, then the ordinary first-turn draw. Marginalizing over every random Prize deal makes that one draw uniform among the original 53 cards after the opening, so its placement does not bias the conditional printing probability.

Let C(n,k) be the binomial coefficient, with C(n,k)=0 when k>n. The probability of seeing at least one of those s Supporters in the opening seven or next draw is

```text
1 - [(C(60-s,7) - C(60-s-b,7)) * (53-s)] /
    [(C(60,7)   - C(60-b,7))   * 53]
```

Numerator and denominator are calculated as exact BigInt integers, reduced with the Euclidean GCD, with decimal percentages only for display. Independent toy-deck enumeration explicitly iterates valid opening hands, all Prize combinations and possible subsequent draws; the committed test covers this equivalence and known rank 11 and rank 6 exact fractions.

For each of the 29 published original 60s, Basic counts were independently classified using the supplied historical card database's Pokémon stage information. The stored reproducible implementation resolves original source printing set/number/name against the corresponding set cards, including promotional SMP and XYP number aliases, and refuses unknown or multiply matched printed stages. This is important because Mega Absol ex is Basic while Mega Lopunny ex and Mega Dragonite ex are Evolutions in the supplied card pool.

## Complete published-source opening priors

The Supporter column counts every printed Supporter as classified by the supplied English database plus the published source names. The last column is conditional on Basic-valid opening seven. Copies can be Prized, inaccessible, locked, competing for the one-Supporter quota, irrelevant, or strategically important to retain after that point.

| Rank | Published archetype | Basics b | Supporters s | Held by first draw |
| ---: | --- | ---: | ---: | ---: |
| 1 | Shadow Rider Calyrex | 14 | 9 | 73.68% |
| 2 | Vileplume Control | 14 | 15 | 90.79% |
| 3 | Snorlax Stall | 11 | 21 | 97.15% |
| 4 | Raichu Electrode Combo | 13 | 4 | 42.90% |
| 5 | Mew Genesect | 11 | 7 | 63.25% |
| 6 | Iron Thorns | 4 | 21 | 96.61% |
| 7 | Snorlax Stall | 12 | 21 | 97.20% |
| 8 | Absol Garbodor | 10 | 8 | 68.33% |
| 9 | Absol Electrode | 11 | 5 | 50.36% |
| 10 | Regidrago | 15 | 11 | 81.28% |
| 11 | Absol Garbodor | 11 | 8 | 68.53% |
| 12 | Regidrago | 15 | 9 | 73.83% |
| 13 | Regidrago | 11 | 10 | 77.17% |
| 14 | Regidrago | 14 | 9 | 73.68% |
| 15 | Lopunny Vileplume | 14 | 8 | 69.08% |
| 16 | Absol Garbodor | 11 | 7 | 63.25% |
| 17 | Raichu Electrode Combo | 13 | 4 | 42.90% |
| 18 | Regidrago | 16 | 8 | 69.39% |
| 19 | Raging Bolt | 16 | 9 | 73.98% |
| 20 | Regidrago | 14 | 10 | 77.68% |
| 21 | Regidrago | 14 | 10 | 77.68% |
| 22 | Absol Garbodor | 12 | 8 | 68.72% |
| 24 | Iron Thorns | 4 | 24 | 98.23% |
| 26 | Meloetta Donk | 12 | 2 | 23.92% |
| 27 | Regidrago | 15 | 9 | 73.83% |
| 29 | Iron Thorns | 4 | 21 | 96.61% |
| 30 | Lillie's Clefairy | 16 | 5 | 51.18% |
| 31 | Dusknoir Chimecho | 15 | 4 | 43.19% |
| 32 | Regidrago | 13 | 10 | 77.52% |

All 29 published original lists contain at least one Supporter; the aggregate contains **297 Supporter physical copies across the 29 distinct 60s**. The 28/29 statistic for a narrower five-family subset is different; rank 31's four Roxie copies establish why name-limited Lillie/Marnie/Iono/Guzma/Carmine inventories cannot be described as complete Supporter access.

**Unresolved ranks 23, 25 and 28 are absent from every numerator and denominator.** No replacement or guessed 60 was counted.

## Practical test implication and limitations

Under independent random starts, rank 11 frequently begins with a physically held Supporter. The current shared bot's zero accepted native Supporters are therefore a serious **action-vocabulary audit priority**. They do not establish that every held card was legally playable or that its play would have improved the position. Carmine has a printed first-player opening exception; other Supporters normally cannot be used on the first player's initial turn. Many lines also have resource-preservation costs, target conditions and Supporter contention.

A next valid root audit should distinguish initial held, current held, actually playable under paper/native rules, tactical candidate, native Store selection, physical settled effect, and later opponent continuation. Use freshly preregistered independent physical deals, both real player starts, and the same unmodified source 60 for candidate comparisons. Do not infer independent probabilities from correlated repeated root observations.

This model excludes opponent-mulligan bonus draws, other card-driven access before the first normal draw, first-player/second-player tactical differences, Prize retrieval, observed K1 information, locks, any action policy, and the actual published tournament chronology. The probability conditions on valid initial seven and makes no statement that a card held after the first draw is still in hand at later owner roots. **Zero games were simulated or competitively qualified by this calculation. No deck win-rate evidence or 99.5% verification is supplied.**

## Reproduction and provenance

- Original published source cards: [29 exact 60s and explicit missing ranks](../aichi-2026/full-decklists.json).
- Data-driven stage and Trainer classification: [source opening calculator](../../scripts/agent18-original-source-supporter-opening.cjs) using [supplied set/card metadata](../../resources/).
- Pure numerical regression: [exact-binomial and explicit Prize enumeration test](../../tests/agent18-original-source-supporter-opening.test.cjs).
- Related incomplete narrower inventory: [Agent 2's 25/29 shuffle-family census](../aichi-2026/agent2-29-source-shuffle-supporter-coverage-20261029.md).
- Operational bottleneck: [Agent 43's native rank-11 held-Guzma census](../aichi-2026/agent43-rank11-held-guzma-supporter-root-bottleneck-20261101.md).
- The 29-row percentages were independently evaluated from the authenticated manifest and the supplied card-pool stage/name classifications during this invocation. The new repository script and pure tests were committed; their full checked-out GitHub Actions execution has not yet been observed because manual CI dispatch was blocked. No native card-action evidence is inferred from their existence.
