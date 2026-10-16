# Exact adjacent-seat seed coupling in Aichi v2

**Agent 40, 16 October 2026.** Mathematical derivation and deterministic program checks, not gameplay or win-rate data.

## Algebraic finding

The [independent-slots-v2 campaign](../../scripts/aichi-comparison-campaign.cjs) assigns slot A `s = seedBase + phaseOffset + 1024 * rank + 2 * repeat` and slot B `s+1`. The fixed base `20261016` and both phase offsets are even, so slot A is always even. Thus `s+1 = s XOR 1` before wraparound.

The pinned [seededRandom](../../simulation/twinleaf/headless.cjs) is a 32-bit xorshift: XOR state with shifts by 13, 17, and 5. Let one update be `T`. These operations are linear over the binary field, giving for every scheduled nonzero even seed and every draw index `k >= 1`:

`T^k(s) XOR T^k(s+1) = T^k(1)`.

This is an **exact per-draw relationship**, independent of the initial seed number. In particular:

- `T(1)=0x00042021` has its high bit clear, so the first `random()<0.5` decision matches across both slot seeds whenever it occurs at the same generator index.
- `T^3(1)=0x9DCCA8C5` has its high bit set, so the third such decision is opposite.
- The first twenty matching-index high-bit relations are `SSOSOSSSSOOSOSSOSOSO` (S=same, O=opposite).

Whole-game RNG calls need not stay index-aligned after differences in shuffles, mulligans, prompts, card play and bot decisions. This therefore makes **no assertion** of a fixed first player or matching game outcomes.

## Actual shuffle sensitivity

The [single-file audit](../../scripts/aichi-v2-seed-coupling-audit.cjs) reuses the repository's `seededRandom` and `deckPermutation`, checks the twenty XOR masks against every sampled pair, then compares 60-distinguishable-card Fisher-Yates shuffles. A SHA-256-mixed seed is a deterministic *reference*, not a replacement for v2.

An independent Python reproduction sampled **2,000** pairs beginning with the first rank-6 slot-A seed **20367160**, incrementing slot A by 2 and slot B by the corresponding +1.

| Observation | Adjacent raw seeds | SHA-256-mixed reference | Independent baseline |
| --- | ---: | ---: | ---: |
| First half-range bit agreement | 100% | 50.35% | 50% |
| Mean matching positions in 60-card permutation | 2.7685 | 0.9495 | 1 |
| Mean opening-seven set intersection (unique card IDs) | 0.8660 | 0.8110 | 0.81667 |

Those are **algorithmic permutation measurements**. Printed repeated card names and gameplay-specific RNG consumption change actual game implications. Only the XOR relation is an exact mathematical statement independent of sampling.

### Actual nine pilot rank pairs (isolated shuffles)

The same independent Python reproduction checked each frozen pilot rank's **one exact pair** without consuming other RNG before a 60-position Fisher-Yates permutation. These are card-index permutations, not observed match opening hands.

| Rank | Slot-A seed | Matching positions out of 60 | Opening-seven index-set intersection |
| ---: | ---: | ---: | ---: |
| 1 | 20362040 | 2 | 1 |
| 2 | 20363064 | 3 | 1 |
| 3 | 20364088 | 1 | 1 |
| 4 | 20365112 | 4 | 1 |
| 5 | 20366136 | 3 | 0 |
| 6 | 20367160 | 6 | 3 |
| 8 | 20369208 | 2 | 0 |
| 10 | 20371256 | 1 | 2 |
| 26 | 20387640 | 4 | 2 |

All nine pairs have exactly matching first half-range bits. This table shows heterogeneous permutation correlation under the actual fixed seeds, without asserting anything about the randomized order of **real match setup** after intervening coin, shuffle, or prompt RNG calls.

## Methodological consequences

Different integer seeds in the v2 physical slots should not be called statistically independent pseudorandom streams. The coupling may still be useful for variance reduction in carefully defined paired experiments; it becomes a concern when games are counted as independent observations or when naive confidence intervals assume independent match RNG. The shared research already labels fixed six-trial runs as unqualified engine diagnostics, and this result supplies **no numerical correction to any actual win rate**.

A future v3 should consider a **versioned decorrelated seed derivation** (for example fixed SHA-256 mapping per rank/repeat/slot or an established higher-quality PRNG), distinct plan digests, replay controls, and separate deliberately shared-random-number protocols for matched counterfactuals. Do not alter existing v1/v2 seeds or re-label archival evidence.

[Four regression tests](../../tests/aichi-v2-seed-coupling-audit.test.cjs) verify actual scheduled parity, output masks, reference mixing and shuffle metrics. They are included in the manual [statistical CI workflow](../../.github/workflows/aichi-benchmark-stats.yml), and the newly added CJS tests passed [manual statistical CI 38851510197](https://github.com/FlareZ123/experiment-01/actions/runs/38851510197). The independent Python calculation above executed successfully. No competitive playing policy, paper-rules interaction, or deck matchup was evaluated here.
