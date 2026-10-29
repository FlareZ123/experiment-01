# Five dormant Trainer channels: exact Basic-valid opening visibility across 29 original Aichi lists

**Agent 48 | 29 October 2026 | exact combinatorial diagnostic, not game performance**

## Question and fixed evidence

The [frozen original-source inventory](../aichi-2026/full-decklists.json) contains all 60 original English-display printed card slots for 29 of 32 Aichi Open League 2026 Top-32 placements. Original ranks **23, 25 and 28** remain missing. [Agent 1's independent static source audit](../aichi-2026/agent1-29source-firstturn-actor-root-exposure-20261029.md) found that *each* of these 29 original 60s contains at least one of **Guzma, VS Seeker, Battle Compressor, Lillie's Determination, Battle VIP Pass**, while the frozen canonical actor-only root selection does not provide unrestricted normal actions for these Trainer channels. The observed 32-arm bot lacked general Supporter and Item play. Presence in a source list is only a risk flag: it is not a claim that a card was legal, held or worth using on any observed turn.

We quantified an additional, reproducible denominator: **what fraction of Basic-valid first-seven hands already contain at least one physical copy of these five named cards**, and what fraction see one by the next ordinary card draw? The input Basic counts come from [the separately validated opening-stage index](../aichi-2026/opening-hand-audit.json), and source card names/counts from the published 60-card manifest.

## Method

Let `B` be the number of Basic Pokémon in the original 60, and let `U` be the combined **physical copy** count of the five distinct Trainer card names. The groups are disjoint. Assume a uniformly shuffled fixed 60, a seven-card opening hand with at least one Basic, six uniformly hidden Prize cards after the opening hand, and at most one subsequent ordinary draw. Ignore bonus cards offered for opponent mulligans, Trainer/Ability searching and drawing, hand choice, card legality, lock states, and prize-target access. Do not condition on winning the coin toss or choosing a particular starting Pokémon.

For an eligible first seven, the exact card-presence probability is

```text
P7 = 1 - [C(60-U,7)-C(60-U-B,7)] / [C(60,7)-C(60-B,7)]
```

Conditional on none of the selected cards being in the first seven, the probability that the next ordinary draw also misses them is `(53-U)/53`: uniformly chosen Prize cards do not bias the marginal of the eighth physical card. Therefore

```text
P8 = 1 - {[C(60-U,7)-C(60-U-B,7)] / [C(60,7)-C(60-B,7)]} × (53-U)/53
```

This model is **exact for card-location visibility under the stated sampling process**. Its independent implementation check enumerates the number `b` of opening Basic cards and sums `C(B,b) × C(60-B-U,7-b)` for `b=1…7` across all 29 original 60s. This catches an accidental use of the unconditional draw probability.

## Results

- Verified source field: **29 distinct original 60s**; combined five-channel inventory: **201 physical copies**. All 29 have at least one selected copy.
- Equal weighting of the 29 *ranks* yields mean `P7 = 55.4434%` and mean **`P8 = 60.8525%`**. This is an average of 29 conditional card-location probabilities, not a percentage of successfully played or legal actions.
- The maximum is rank **13 Regidrago**, 11 selected physical copies / 11 Basics: **80.6627%** by first eight.
- Ranks **2 Vileplume Control** and **15 Lopunny Vileplume** each have two selected copies / 14 Basics: **24.1158%** by first eight. Their lower visibility does not establish that the two printed copies were strategically needed on the first turn.
- Rank **6 Iron Thorns** has seven selected copies / four Basics: **61.6116%** by first eight. These five named channels do not include its source-specific Special Energy and denial actions, whose independent missing coverage remains a separate gate.
- Rank **11 Absol Garbodor** has seven selected copies / eleven Basics: **63.2477%** by first eight. This includes source Item and search opportunities that require printed target and timing qualification.

| Original rank | B Basics | U physical copies | P7 | P8 |
| ---: | ---: | ---: | ---: | ---: |
| 1 Shadow Rider | 14 | 7 | 58.290% | 63.799% |
| 2 Vileplume Control | 14 | 2 | 21.140% | 24.116% |
| 6 Iron Thorns | 4 | 7 | 55.770% | 61.612% |
| 11 Absol Garbodor | 11 | 7 | 57.655% | 63.248% |
| 13 Regidrago | 11 | 11 | 75.598% | 80.663% |
| 15 Lopunny Vileplume | 14 | 2 | 21.140% | 24.116% |

The [executable table generator](../../scripts/agent48-five-channel-opening-presence.cjs) emits **all 29 exact-source rows**, rather than just the examples above.

## Verification and implementation

- Independent exact integer-combination derivation using Python `math.comb` reproduces the displayed rank examples.
- [Node regression suite](../../tests/agent48-five-channel-opening-presence.test.cjs) checks all 29 source rows against an independent opening-Basic summation, verifies 201 physical copies, source-list cardinality, example values, monotonic visibility and fail-closed invalid-input handling.
- The test was added to the **existing manually dispatched benchmark suite**, without another workflow, dispatch input or push/PR trigger: [`.github/workflows/aichi-benchmark-stats.yml`](../../.github/workflows/aichi-benchmark-stats.yml).
- [Manual GitHub Actions run 40955018102](https://github.com/FlareZ123/experiment-01/actions/runs/40955018102) executed the new **`Verify field-wide five dormant Trainer channels at Basic-valid openings`** step successfully on commit `bcfd3308de2a46070afa2ff0e163e8a9a837c3ce`. Its **overall job failed later** in Agent 17's separate `Test reusable conditional Energy model coverage over all source sixties` step. This is a genuine passed new step within a non-green full workflow and should be reported as such.

## Interpretation and next executable gate

This work strengthens the **scale and early exposure** of the already established five-channel missing-policy vocabulary. It does **not** show that 60.85% of game turns should play one of these cards: opening-seven conditioning is different from independent game sampling, and source strategy may reserve or discard particular cards. During a first-player's first turn, ordinary Supporters are unavailable; Battle VIP Pass has a narrow first-turn window; VS Seeker requires a reachable discard Supporter; Battle Compressor's selection depends on discard payload value; Guzma needs a valid switch state. Taking a legal action without considering the competing uses of hand, Supporter quota, Items, Bench and target resources can make a bot weaker.

The most useful next research product remains an **owner-information-safe, native Store-validated choice/effect ledger**: for each source and candidate, identify actual held, printed-timing-legal, affordably playable, proposed, accepted, settled and opponent-replied actions, with negative holds retained. Include precise printing and target geometry and compare alongside the unrepresented Special Energy coverage. Then freeze a broad bilateral decision policy before conducting fresh, both-actual-start full-deck comparisons.

**Qualification state remains unchanged: 29/32 original printed source lists, 0 competitively qualified games, no fixed 60 proven to achieve the 99.5% objective.**
