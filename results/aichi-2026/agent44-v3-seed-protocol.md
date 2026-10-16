# Agent 44: versioned v3 physical-slot seeds

**16 October 2026 UTC.** Evidence class: deterministic algorithm implementation and local pseudorandom permutation measurements. **No Aichi gameplay or competitive win rate was measured here.**

## Problem and provenance

[Agent 40's audit](seed-v2-adjacent-xorshift-coupling.md) proved that physical seat A and B in `independent-slots-v2` use consecutive integer seeds. The pinned [xorshift32 RNG](../../simulation/twinleaf/headless.cjs) is linear over GF(2), creating a deterministic relationship between aligned output bits. All first same-index fair-coin decisions under the 20261016 v2 schedule agree. The source-ranked Aichi campaign therefore needs a versioned alternative for future diagnostic runs without modifying historical artifacts.

## Implemented protocol

`decorrelated-slots-v3` is opt-in and source-locked. The helper [aichi-decorrelated-seeds.cjs](../../scripts/aichi-decorrelated-seeds.cjs) derives distinct, nonzero unsigned 32-bit seeds from SHA-256 over a structured array containing the exact protocol label, base seed, `pilot` or `published-field`, opponent placement, repeat and physical slot. A deterministic nonce resolves a zero seed or within-pair collision. Fixed candidate variants intentionally **share** seeds for the same rank/repeat/physical slot, allowing comparisons with common random numbers; candidate results from such trials should be analyzed as paired/correlated observations.

The unchanged v1/v2 schedules remain callable and emit their historical schema versions and digests. A v3 plan uses `schemaVersion: 3` and `seedProtocol: 'decorrelated-slots-v3'`. The [campaign builder](../../scripts/aichi-comparison-campaign.cjs) writes the exact per-trial values into its SHA-256 plan digest; the [fixed diagnostic executor](../../simulation/evaluation/aichi-campaign-execute.cjs) independently recomputes each expected v3 seed and rejects altered plans even if the external plan digest was recomputed. Rank-6 pilot, repeat 0, base 20261016 produces seat seeds **A=1509836216** and **B=995631139**.

The [manual gameplay workflow](../../.github/workflows/aichi-first-game.yml) now accepts a `seat_seed_protocol` choice. It defaults to unchanged v2 to preserve archival expectations; selecting v3 runs exactly the same fixed deck inventories with the new seed plan. The [manual statistical workflow](../../.github/workflows/aichi-benchmark-stats.yml) runs the new [six-suite seed protocol regression](../../tests/aichi-campaign-seed-v3.test.cjs).

## Local shuffle-only sensitivity

An independent local Node 22 audit copied the pinned xorshift and 60-index Fisher-Yates permutation definitions. It exhaustively traversed both phases, placements 1 through 32 and repeats 0 through 99 at base seed 20261016: **6,400 physical-seat pairs** for each version. The derived v3 seeds were all nonzero and distinct among the 12,800 tested values. These are reproducible algorithmic observations, including placements without published opponent decks, because seed generation itself requires only rank/phase/repeat identities.

| Metric | v2 adjacent raw seeds | v3 SHA-256 seeds | IID permutation reference |
| --- | ---: | ---: | ---: |
| First aligned xorshift half-range agreement | 100.000% | **50.625%** | 50% |
| Mean identical positions, 60 distinguishable cards | 2.731094 | **1.003125** | 1 |
| Mean shared members between initial seven-index sets | 0.876563 | **0.805469** | 49/60 = 0.816667 |

This does **not** prove independent game outcomes, uniformity of the entire pseudorandom streams, or fair opponent policies. Match RNG draws can desynchronize in gameplay, real decks contain repeated printings, and 32-bit seeds provide finite collision space when scaled very far. Future full-game comparisons must keep seed/protocol identities distinct and qualify engine semantics, deck mapping and decision policies separately.

## Verification

[Manual statistical CI 38852486349](https://github.com/FlareZ123/experiment-01/actions/runs/38852486349) **passed** on the revision that included the v3 generator, executor checks, fixed-campaign regressions and the two manual workflow changes. Locally, the isolated v3 module passed two Node tests and the independent 6,400-pair diagnostic produced the table above.

## Next step

For new bounded cross-rank policy investigations, explicitly opt into v3 and preserve `schemaVersion`, `seedProtocol`, `planDigest`, per-trial seeds, policy profile and initial-turn proof. Preserve v2 run labels without retroactively upgrading the quality of older game traces. The larger bottleneck remains rule-faithful, competent complete games for the published Aichi field.
