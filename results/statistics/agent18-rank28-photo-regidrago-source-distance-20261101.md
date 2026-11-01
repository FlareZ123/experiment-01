# Agent18: provisional rank-28 Regidrago photo versus nine authenticated Regidrago original 60s

**1 November 2026 | static name-level substitution distance only.** The 38-cell/60-copy deck photo attributed to a first-person user reporting 28th qualifier was transcribed earlier by [Agent48](../aichi-2026/agent48-rank28-photo-60-provisional.md). **It has not been certified as Jo Kato's registered original rank28 tournament list**, because the nickname-to-civil-registration identity and exact printings are unresolved. Retain rank28 among the three missing original source 60s. No image was edited or reinterpreted in this study.

## Comparison design

The machine-readable [38 photo cells](../aichi-2026/agent48-rank28-photo-provisional-cells.csv) sum to 60. Compare name-level copy counts to the nine authenticated original Regidrago lists from [Aichi 2026 exact public deck manifest](../aichi-2026/full-decklists.json). For physical 60s `A` and `B`, define a minimum **name-level slot substitution** distance `d(A,B)=60 - sum_name min(A[name],B[name])`. This preserves duplicate counts and does not imply search, game-plan or matchup similarity. Normalize the photo's `Battle Compressor Team Flare Gear` displayed name to the original manifest's shortened `Battle Compressor`; preserve all other printed names literally.

| Published Regidrago rank | Minimum photo→original name-level substitutions | Unchanged physical card-name copies |
| ---: | ---: | ---: |
| **10** | **7** | **53** |
| 13 | 11 | 49 |
| 21 | 11 | 49 |
| 20 | 12 | 48 |
| 12 | 14 | 46 |
| 27 | 14 | 46 |
| 14 | 15 | 45 |
| 32 | 16 | 44 |
| 18 | 17 | 43 |

The nearest authenticated original, rank **10**, differs by exactly seven physical name-level copies in each direction:

| Photo contains extra versus rank10 | Rank10 contains extra versus photo |
| --- | --- |
| 1 Noivern ex | 1 Budew |
| 2 Ultra Ball | 2 Quick Ball |
| 2 Professor Juniper | 2 Professor's Research |
| 1 Path to the Peak | 1 Carmine |
| 1 Fire Energy | 1 Double Dragon Energy |

The two Professor Juniper and Professor's Research slots share the familiar **discard-hand, draw-seven** card text in the supplied pool, so a purpose-specific *effect-equivalence* sensitivity could count those two rows as mechanically similar, reducing the **minimum effect-normalized editing tally to five**. That would be a carefully bounded hypothetical normalization: the literal printed names still differ, and legality, metadata, references to names, action policy, and actual plays must be checked before treating them as interchangeable. Keep the reproducible name-level seven-slot result as the primary metric.

## Interpretation

The image-transcribed 60 is **relatively close** to rank10 at seven minimum printed-name slots and ranges to 17 slots against the other eight authenticated Regidrago source decks. The existing [nine-published-Regidrago pairwise envelope](../aichi-2026/agent42-missing-rank-proxy-envelope-20261101.md) found 6–21 slot differences among the published sources; the photo therefore falls within that broad observed name-level variation, without proving it reflects the actual rank28 entrant. This narrow comparison helps prioritize *prospective missing-original sensitivity testing*: rank10 is the nearest literal proxy, but it has different possible bench support, search, Stadium and Energy channels, so no match score from rank10 can be relabeled rank28.

## Reproduction and limits

Both original lists were retrieved through the live GitHub repository API. A small independent JavaScript map-of-name-counts calculation computed `60 - sum min()` for each of nine published Regidrago originals and checked the 7/7 source/photo difference lists. The rank28 visual transcription, its 38 picture cells and provisional card print map remain owned by Agent48's prior investigation, and were **not verified anew against the original pixels** in this analysis.

**0 games, 0 matchup evidence; 29/32 authentic exact original 60s, ranks 23/25/28 missing; no demonstrated 99.5% fixed deck.**
