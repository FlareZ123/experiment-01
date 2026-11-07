# Agent50: 200,000-seed four-stream physical setup-shuffle calibration

**7 November 2026 | Precommitted input cohort | 3/3 pure tests and complete registered CJS run PASS | 0 native games.**

## Scope and source

This is a **pure exact-code statistical calibration**, motivated by the separately reproduced same-original-seed 8/0 seat-mulligan anomaly. It estimates how the repository's deterministic `seededRandom` xorshift32 and `deckPermutation` Fisher–Yates interact across physical seats. It models exactly 60 cards, the printed original Aichi rank4 list's 13 Basic Pokémon and 47 non-Basics in deck-list order. It does not run native Twinleaf, model the setup coin flip/mulligan loop, prove a paper-random shuffle, select a final deck, or count any competitive games.

**Precommitted [registration](registrations/agent50-rank4-setup-rng-three-protocol-200k-calibration-20261107.md)** specifies all 200,000 seeds, seed master `cadbb52dd605505cecab719b44ac22d9` drawn using an actual secure RNG before registration, the four protocol implementations, leading/trailing seven draw directions, 2×2 outcome metrics and independent-paper benchmark. Each sample's unsigned trial seed derives from SHA256(`pokemon-expanded-agent50-rng-calibration-v1` || master bytes || little-endian UInt32(i)) with `readUInt32LE(0)`. The run retained **five** repeated 32-bit seeds out of 200,000 (199,995 unique) without deduplication.

- [Executing analysis](../../simulation/evaluation/agent50-three-protocol-shuffle-calibration.cjs) is ordinary CommonJS and uses the actual repository `seededRandom`, `deckPermutation`, Agent26's SHA256-v2 domain separation and XOR-v1 salts. No native vendor modifications.
- [Three tests](../../tests/agent50-three-protocol-shuffle-calibration.test.cjs) verify deterministic seed derivation, all actual permutations/valid indices, complete outcome-cell accounting, exact independent single-hand probability and no competitive qualification.
- [Manually dispatched CI](https://github.com/FlareZ123/experiment-01/actions/runs/42326629601) **SUCCESS**, job 128263318088, checkout `1074ee7bef0ebc42651275bddb8e6f0d0947a875`, Node20, 200,000 complete rows and 3/3 green tests, full aggregate JSON in job logs. [Workflow](../../.github/workflows/agent50-shuffle-correlation-calibration.yml) has no schedule, no compiled engine, no automatic trigger.
- All 8 contingency tables reproduced **exactly** in an independent Python/Numpy/Numba implementation of domain-separated trial seeds, unsigned xorshift32 and Fisher–Yates, using the same master and the 13 original-rank4 Basic positions. This cross-language check was executed locally during the invocation, not a separately archived immutable CI run. The CJS source and its frozen cohort are available for full reproducibility.

## Exact 200,000-sample 2×2 outcomes

Each row means `n00`: both physical seats have Basic in seven, `n01`: only seat1 has **no** Basic, `n10`: only seat0 has no Basic, `n11`: **both** have no Basic. Every row adds to exactly 200,000. `phi` is binary cross-seat correlation in indicators of missing all Basics.

| Physical shuffle stream | Seven positions | n00 | n01 | n10 | n11 | Seat0 miss | Seat1 miss | Joint miss | phi |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Legacy shared xorshift32 | **Leading** | 140,182 | 27,144 | 27,413 | 5,261 | 16.3370% | 16.2025% | 2.6305% | −0.001211 |
| Legacy shared xorshift32 | Trailing | 140,155 | 27,222 | 27,325 | 5,298 | 16.3115% | 16.2600% | 2.6490% | −0.000238 |
| Legacy + one prior RNG draw | **Leading** | 140,409 | 27,236 | 27,033 | 5,322 | 16.1775% | 16.2790% | 2.6610% | +0.002020 |
| Legacy + one prior RNG draw | Trailing | 140,288 | 27,154 | 27,280 | 5,278 | 16.2790% | 16.2160% | 2.6390% | −0.000059 |
| Agent26 XOR-v1 separate streams | **Leading** | 140,336 | 27,037 | 27,291 | 5,336 | 16.3135% | 16.1865% | 2.6680% | +0.002014 |
| Agent26 XOR-v1 separate streams | Trailing | 140,763 | 26,831 | 26,691 | **5,715** | 16.2030% | 16.2730% | **2.8575%** | **+0.016233** |
| Agent26 SHA256-v2 separate streams | **Leading** | 139,953 | 27,180 | 27,527 | 5,340 | 16.4335% | 16.2600% | 2.6700% | −0.000153 |
| Agent26 SHA256-v2 separate streams | Trailing | 139,957 | 27,182 | 27,515 | 5,346 | 16.4305% | 16.2640% | 2.6730% | +0.000054 |

**Exact independent uniform-paper per-hand miss baseline** is `C(47,7)/C(60,7)=0.1628440500237541`, joint independent baseline `0.0265181846281389` (about 5,304 expected of 200,000). This is a benchmark for probabilities of seven drawn cards with no Basic; it is **not** a claim that any RNG protocol is uniform. No benchmark result is inferred by choosing a favorable orientation or a biased selection of seeds.

### Direction is decisive

The highest observed joint-miss signal, XOR-v1 trailing seven **5,715/200,000**, is about **7.76% higher than the independent-paper joint benchmark** with `phi≈0.016233`. However, **the actual pinned Twinleaf setup reducer uses the leading seven**, not the trailing seven: the source `ptcg-server/src/game/store/state/card-list.ts` at pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` implements `CardList.moveTo` by `this.cards.splice(0,count)`; `CardList.applyOrder` writes `cards[i]=copy[order[i]]`; and the pinned `setup-reducer.ts` explicitly calls `player.deck.moveTo(player.hand,7)` after deck-shuffle prompts. Thus the actual initial-hand direction for a `deckPermutation` result is **leading seven**.

Under that relevant leading-seven representation, XOR-v1 `phi=0.002014` and SHA256-v2 `phi=-0.000153`; both show much smaller correlations than the trailing XOR diagnostic. The model alone does **not** show a large material two-seat setup distortion for the actual leading-seven opening of this printed rank4 order. The trailing-seven difference is a reproducible **position-specific correlation of these deterministic streams**, useful for monitoring other algorithms or deck-order/draw-direction transformations. It is not a demonstrated marginal paper-rule violation or competitive advantage.

### What this does and does not resolve

1. A same-seed native study independently reproduced a **selected-cohort** legacy 8/0 mulligan split with either original rank4/rank1 or identical rank4/rank4 decks, and XOR-v1 7/7 with identical rank4/rank4 on those same seeds ([source-hand-matched evidence](agent50-identical-rank4-original32-seed-replay-20261107.md)). This new 200,000-seed pure calibration finds **no large generalized first-seven asymmetry under the simplistic exact-code model**. Therefore selected-seed anomaly and normal-run setup sequencing/extra RNG draws remain plausible explanations; no general seat0 bug is established.
2. The legacy model runs two consecutive 60-card shuffles from the same RNG state. The one-word-offset control is a narrow sensitivity probe, **not** a complete native game setup. The XOR-v1 adapter can consume additional shared RNG words before overwriting its shuffle order, while the compiled engine may also consume coins, offers, redraws and prompts. A native correlation test would need to observe actual starting hands and exact physical source order under the precise configuration.
3. Agent26's `sha256-v2` domain-separated stream avoids the known **fixed-XOR algebraic relationship** of XOR-v1 seeds, but this experiment alone cannot prove independence, paper fidelity, or superiority for actual matches. Separate full native paper-validity and opponent-policy tests remain mandatory.
4. An event of eight mulligan hands all assigned one physical seat in a selected 32-seed cohort should not be given an unbiased confirmatory p-value. The 200,000-seed cohort is prospective, but the 13-Basic rank4 order and four protocols were selected because of previously observed issues and are not independently generalizable to every deck order.
5. **Paper-qualified matches: zero. Fixed champion 60: none. Authenticated original opponent inventories: 29/32.** No game win rate estimated.

## Next useful discrimination

Implement an exact top-seven **native matched initial-permutation and hand identity** audit of `legacy-shared`, native builtin `isolatePhysicalShuffleRandomness:true`, XOR-v1 and SHA256-v2 with equal rank4 decks, retaining actual coin/reshuffle consumption. Supplement with a fresh independent 32-bit seed cohort and at least one alternate card-order mask. Pre-register and document every shuffle protocol and do not pool match results generated with different protocols.
