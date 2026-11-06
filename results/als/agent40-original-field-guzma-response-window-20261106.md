# First Vileplume Item-lock counterwindow: exact original-field direct Guzma sighting

**Agent 40 | 6 November 2026 | 29 authenticated original Aichi 2026 name/count sixties | exact mathematical resource screen, no executed games.** This is one specific adversarial pressure against the [fixed Sentinel Lopunny/Vileplume v1](../aichi-2026/candidate-sentinel-lopunny-vileplume-v1.json) or other Benched Vileplume lock lines. **No contender is promoted, and zero competitive games are qualified.**

## Decision-relevant result

The fixed original field contains **48 physical Guzma copies across 25 of the 29 authenticated decks**. Ranks **4, 17, 26 and 31** contain no literal printed Guzma; this says nothing about other escape, attack, Ability or Supporter options. This field inventory independently agrees with [Agent25's named Supporter census](../aichi-2026/agent25-29-source-supporter-family-matrix-20261029.md).

In the narrow scenario where a Vileplume challenger goes **second** and uses a first-turn Bunnelby/TM Evolution line to establish **Vileplume AOR** on its Bench, the original source went first. Before its second turn, the original source has naturally seen its seven-card opening and one normal turn draw on each of its two turns, giving **nine cards seen** in the restricted no-extra-draw/no-mulligan-bonus model. Vileplume's printed **Irritating Pollen** blocks Items for both players; it does not prohibit playing a Supporter. A held, legal **Guzma BUS** can threaten to promote the opposing Benched Vileplume and move the owner's own Active, subject to the printed target and turn rules. Gust by itself does not Knock Out or remove the Item lock.

Conditioning on the source having at least one Basic in its initial seven, the **equal-rank mean probability of naturally seeing at least one literal Guzma by the source's second turn is 22.0266532834% across the 29 known decks**. This is a mean of 29 different resource-sighting probabilities, not one candidate's game loss or the chance the opponent actually holds, chooses or successfully uses Guzma.

| Copies of printed Guzma per original 60 | Opponent ranks | Range of exact, Basic-valid first-nine sighting probabilities |
| --- | ---: | ---: |
| 0 | 4 | **0%** by the defined direct route |
| 1 | 6 | **14.21673%–14.45029%** |
| 2 | 15 | **25.89458%–27.20666%** |
| 3 | 4 | **36.48146%–38.18522%** |
| **All 29 known** | **29** | **22.02665% equal-rank mean**, with 48 actual Guzma copies |

Representative original-source checks:

- **Rank 1 Shadow Rider**, one Guzma, 14 Basic cards: **14.45028731%**, exact fraction `38604509/267153920`.
- **Rank 6 Iron Thorns**, three Guzma, four Basics: **36.48146031%**, exact fraction `804101/2204136`; this independently reproduces [Agent8's rank6 turn-four source audit](../methodology/agent8-original-rank6-volt-pivot-target-contention-20261105.md). At eight cards, its previously verified fraction is `1257173/3857238`.
- **Ranks 18 and 30**, three Guzma, 16 Basics: **38.18521787%** each.
- **Ranks 4, 17, 26 and 31**: no Guzma in their published 60s, so this particular direct printed route is absent.

The structural implication is an **adversarial test priority**: a first-turn Vileplume access screen cannot be treated as a durable Item-lock win without testing direct Supporter gust and a credible subsequent attacker/promotion plan. An original source may already have a usable Guzma, may reach it through additional draw/search, or may have other legal actions. Conversely, seeing Guzma naturally does not guarantee it remains held after first-turn sequencing or that using it beats preserving the existing opponent Active target.

## Exact model and audit

Let `b` be the original source's Basic Pokémon count and `g` be its number of printed Guzma, with no overlap between those categories. Work with a shuffled fixed 60; require at least one Basic in the first seven, and look at the next two *ordinary* draws. The six random Prize cards are marginalized rather than inspected. The valid seven-card count is `V = C(60,7) - C(60-b,7)`. Conditional on a seven-card opener containing a Basic but no Guzma, the next two draws may both avoid Guzma. Hence the exact probability is

`P(Guzma among first nine | Basic in first seven) = 1 - [(C(60-g,7) - C(60-g-b,7)) C(53-g,2)] / [(C(60,7) - C(60-b,7)) C(53,2)]`.

The calculation uses integer binomial coefficients and rational reduction, with no simulation or approximate replacement of Prize-card uncertainty. For each rank, `g` is counted directly from [authenticated printed source inventories](../aichi-2026/full-decklists.json) and `b` from [Agent3's independently compiled 29-source Basic census](../aichi-2026/agent3-original-29-first-seven-basic-census-20261104.json). The program rejects changed inventory dimensions, duplicate/missing original ranks, non-60 source lists and invalid count categories.

**Reproducibility:** [BigInt exact per-rank source evaluator](../../simulation/evaluation/agent40-field-guzma-first-nine.cjs) and [seven pure regressions](../../tests/agent40-field-guzma-first-nine.test.cjs). All seven tests passed locally with Node 22.16.0 using a 29-source **synthetic fixture with the authenticated `g,b` margins**; the new source/test files are committed to the shared repo. A separate live GitHub-file computation loaded both **actual** source JSONs and independently reproduced 25/29, 48 Guzma copies, four zero-Guzma ranks, rank6 36.48146031%, and 22.0266532834% equal-rank mean. No compiled Twinleaf or CI native game was run for this mathematical screen.

## Limitations and next acceptance gate

This is a *natural sighting* event; it omits opponent mulligan compensation, other draws, deck search, card discards, hand disruption, Prizes recovered later and supporter conflicts. It assumes the same printed original lists and Basic classification. For a first-turn lock analysis, the opponent's own first turn may alter the actual hand, board, Guzma access and subsequent source action. The candidate's lock success and the opponent's natural sighting must **not** be multiplied without a joint physical-deal and policy model. The probability also says nothing about exactly which opposing Pokémon Guzma would make Active, whether the original source has an eligible own Bench, whether the source can fund a KO, or whether another action is strategically better.

The best direct use is to preregister **original-source held-Guzma opportunities after real, paper-paid Bunnelby/TM Item-lock setup**: reveal only each actor's own hand and public board to the actor, preserve the genuine Store-owned Supporter and switch prompts, and compare gust-with-followthrough to an affordable competing line using the **same initial physical deal**. In the newly compiled [Artazon-to-Bunnelby actual two-seat setup fixture](../aichi-2026/agent28-sentinel-artazon-direct-opening-exact-20261106.md), the opponent's Guzma reply is a conditioned tactical intervention rather than an independently competent owner policy. A future steward-selected bilateral policy should record both when Guzma is absent and when playing it is dominated.

**Global benchmark remains 29/32 known original sixties (ranks 23/25/28 unavailable), no final selected fixed 60, zero qualified competitive games and no demonstrated 99.5% win rate.**
