# Agent50 preregistration: physical opening shuffle marginal and cross-seat dependence audit

**7 November 2026, before code or sampling outcomes.** This is a pure numerical model of the published research-owned RNG/Fisher-Yates code, not a native game, a valid paper shuffle, or an estimate of competitive performance.

## Frozen question

Does the default legacy shared stream, Agent26's XOR-v1 per-seat stream, or Agent26's SHA256-domain-separated-v2 per-seat stream display material **physical-seat asymmetry** or **binary opening-hand correlation** on independently generated random 32-bit seeds, under the same rank4-60 deck ordered Basic-card locations? This is a prospective statistical calibration outside the earlier 32 selected native seeds, and must be compared against exact uniform-shuffle hypergeometric opening failure.

## Immutable inputs

- Number of master seeds **200,000**, no filtering/replacement. Cryptographic master seed drawn *once through the local secure RNG before this registration*: hex `cadbb52dd605505cecab719b44ac22d9`.
- For sample index `i=0...199999`, derive unsigned trial seed `SHA256(UTF8('pokemon-expanded-agent50-rng-calibration-v1') || 16 raw bytes master || UInt32LE(i)).readUInt32LE(0)`. Preserve seed collisions and count them; do not reject.
- Legacy shared: use `seededRandom(seed)` xorshift32 and two successive `deckPermutation(60,random)` operations for physical seat0 and seat1. Also run a **prespecified one-generator-word coin-flip offset control** to test sensitivity to `Math.random` consumed before shuffling, without treating it as the complete native event sequence.
- XOR-v1: `seededRandom((seed^0x243f6a88)>>>0)` for seat0 and `seededRandom((seed^0x85a308d3)>>>0)` for seat1, independently shuffling length60.
- SHA-v2: derive each physical seat seed as `SHA256(UTF8('pokemon-tcg-expanded/setup-physical-shuffle/v2') || UInt32LE(seed) || UInt8(seat)).readUInt32LE(0)`, then run the same xorshift32/Fisher-Yates operation.
- The original rank4 60 has exactly 13 printed Basic Pokémon; verified from uploaded card pool, with 0-based Basic flags in source printed list order `[0,1,5,8,9,10,11,12,13,14,15,16,17]`. Other 47 cards are non-Basics. Because the upstream physical draw direction might differ from a standalone array order, report **both leading seven** and **trailing seven** of each generated shuffle as separate directional analyses, with neither selected after results.
- Baseline single-hand mulligan probability `C(47,7)/C(60,7)`. For any protocol, report both seats' no-Basic count/rate, joint fail count/rate, signed binary phi correlation, and conditional `Pr(seat1 fails | seat0 fails)`. Compare to independent-shuffle `q²` and zero expected phi.
- Reproduce source `seededRandom` and `deckPermutation` exactly from `simulation/twinleaf/headless.cjs`; use only built-in Node.js CJS crypto, no experimental native wrapper. Include a small direct test of xorshift32 output and distinct protocol seed derivations. This is a pure calibration, so results do not need native game compilation.
- Reuse the same master-seed cohort across protocols for improved comparison, but each protocol intentionally changes actual permutations; paired draws are **not** physically identical.
- Save reproducible code, exact registered inputs, raw aggregate counts, and a named full results report with limits. No paper legality/physical uniformity/competitive performance assertion.

## Prespecified interpretation

At `n=200000`, a binary phi correlation near zero still cannot certify absence of a subtle PRNG dependence. A nonzero observed dependence can motivate scrutiny of this deterministic implementation; it cannot by itself show nonuniform real paper shuffling or explain every past selected native seed. Use no uncorrected p-value as proof of a generalized engine bug. Different initial card orders can change the Basic-location binary dependence, and the native engine may use additional draws, prompts, or reshuffles not modeled here.
