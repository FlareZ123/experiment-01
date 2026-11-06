# Twinleaf turn-zero shuffle-stream seat-symmetry audit

**6 November 2026 | same-seed rank4/rank1 source-first protocol comparison | simulator-fidelity warning, not deck-strength evidence.**

## Executive finding

A same-seed, source-seat-balanced rank4-vs-rank1 setup cohort showed a protocol-sensitive contrast: under the legacy shared stream, seat0 accumulated eight mulligans and seat1 zero; under Agent26's per-seat setup streams, the totals were six and seven. The six legacy unequal-mulligan attempts all favored seat1, while the per-seat cohort's ten events split recipients six to seat0 and four to seat1.

A separate preregistered identical-rank4 control (new 32-seed cohort, 16/16 source-seat assignment, 64 total attempts) did **not** reproduce a general seat0-only bias. Under legacy shared shuffling, mulligan totals were seat0 five / seat1 eight; under Agent26 per-seat shuffling they were three / four. Compensation recipients were near-balanced under both protocols.

The evidence therefore supports **shuffle-protocol sensitivity in the original rank4/rank1 seed cohort**, but it does not establish a general physical seat-order bias or a defective shared RNG. The identical-deck control uses a different seed set, so it does not isolate the original cohort's seed/deck interaction. Neither protocol is proven to reproduce paper shuffling exactly. Do not pool their results or make a causal claim before a same-seed identical-deck replay of the original rank4/rank1 seed list.

## Experimental controls

Both cohorts used:

- Original Aichi rank4 60 as source and original rank1 60 as reference; source list has 13 Basic Pokémon, reference 14.
- The same 32 unique CSPRNG-generated seeds and the same 16/16 physical source-seat assignments.
- Source deliberately chosen first in every attempt.
- The same owner entry-priority Active policy, optional min-zero Bench decline, public mulligan acknowledgements, actor-only `WANT_TO_DRAW_CARDS` SelectPrompt default, and raw-State quarantine at the first unsupported source root.
- Twinleaf pinned to `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- No completed games, attacks, Prize transitions, opponent replies, or competitive qualifications.

The two protocols did **not** produce the same physical openings. This is a matched seed/seat protocol sensitivity comparison, not a same-deal A/B test.

## Results

| Measure | Legacy shared stream | Per-seat setup streams |
|---|---:|---:|
| Source first turns reached | 32/32 | 32/32 |
| Source-seat assignment | 16/16 | 16/16 |
| Mulligan count pairs (seat0/seat1) | 26 × 0/0; 4 × 1/0; 2 × 2/0 | 22 × 0/0; 5 × 0/1; 3 × 1/0; 1 × 3/0; 1 × 0/2 |
| Total mulligans by seat | **8 / 0** | **6 / 7** |
| Unequal-mulligan attempts / compensation prompts | 6 | 10 |
| Compensation recipient seats | **0 / 6** | **6 / 4** |
| Compensation recipient deck roles | source 4 / reference 2 | source 4 / reference 6 |
| Compensation cards selected | 8 | 13 |
| Dedechange opportunities | 6/32 (18.75%) | 5/32 (15.625%) |
| Native Dedechange plays / confirms / six-card draws | 6 / 6 / 6 | 5 / 5 / 5 |

The legacy cohort's six prompt receipts were:

| Trial | Source seat | Mulligans seat0/seat1 | Recipient | Draw |
|---:|---:|---:|---:|---:|
| 4 | 1 | 2/0 | 1 | 2 |
| 7 | 0 | 2/0 | 1 | 2 |
| 25 | 0 | 1/0 | 1 | 1 |
| 26 | 1 | 1/0 | 1 | 1 |
| 30 | 1 | 1/0 | 1 | 1 |
| 32 | 1 | 1/0 | 1 | 1 |

Thus seat0's eight mulligans occurred regardless of which deck occupied seat0: the source and reference roles each occupied seat0 in 16 trials. The legacy pattern is a physical seat-order anomaly, not a simple source-versus-reference effect.

In the per-seat cohort, the ten unequal-mulligan attempts were:
- 5 attempts with counts 0/1;
- 3 attempts with counts 1/0;
- 1 attempt with counts 3/0;
- 1 attempt with counts 0/2.

The public `ShowMulliganPrompt` receipts exposed both players' mulligan counts. In both cohorts, every `WANT_TO_DRAW_CARDS` prompt belonged to the player with fewer mulligans, and the default selected draw amount equaled the difference. All 16 compensation transfers across the two cohorts were verified at the physical movement boundary with exact card-object identity. The per-seat test also verified both players had at least one turn-zero shuffle in all 32 attempts.

The Dedechange opportunity-rate difference is not decision-grade: 6/32 has a 95% Wilson interval of 8.89%–35.31%; 5/32 has 6.86%–31.75%. The intervals overlap widely.

## Identical-deck seat-symmetry control

The follow-up [identical-rank4 control](agent50-identical-rank4-mulligan-seat-symmetry-20261106.md) used the same rank4 60 in both physical seats, 32 newly preregistered seeds, and both shuffle protocols:

| Measure | Legacy shared | Agent26 per-seat |
|---|---:|---:|
| Attempts / source-seat balance | 32 / 16-16 | 32 / 16-16 |
| Mulligan pairs seat0/seat1 | 22 × 0/0; 4 × 0/1; 3 × 1/0; 2 × 1/1; 1 × 0/2 | 25 × 0/0; 4 × 0/1; 3 × 1/0 |
| Total mulligans by seat | 5 / 8 | 3 / 4 |
| Total mulligan hands | 13 | 7 |
| Unequal-mulligan attempts | 8 | 7 |
| Compensation recipients | seat0 5 / seat1 3 | seat0 4 / seat1 3 |
| Compensation prompts / cards | 8 / 9 | 7 / 7 |
| Exact physical compensation moves | 8/8 | 7/7 |

All 64 attempts reached the first source turn; all 15 compensation prompts across the two arms matched the lower-mulligan player and exact count difference, and all physical moves were verified. This control weakens the hypothesis of a general seat0 bias in the legacy shared stream. The original rank4/rank1 8/0 result remains a cohort-specific anomaly; it may involve the particular seed set, deck composition, shuffle-stream interactions, or sampling variation. Paired by seed, the exact mulligan-count pair matched in 20/32 seeds and differed in 12/32; whether either player mulliganed differed in 11/32. Eighteen seeds had zero mulligans under both protocols. In the rank4/rank1 cohort, the exact pair matched in 18/32 and differed in 14/32; any-mulligan status differed in 12/32. The protocols therefore change opening outcomes in both deck configurations, even when seed and seat are held constant.

## Plausible mechanism and limits

The [headless harness](../../simulation/twinleaf/headless.cjs#L120-L135) implements `seededRandom` as xorshift32. In the default `runMatch` path, one seeded random function is assigned to global `Math.random` for the match ([lines 491–500](../../simulation/twinleaf/headless.cjs#L491-L500)). Consequently, both players' setup shuffles consume one sequential random stream.

The alternative [Agent26 adapter](../../simulation/evaluation/agent26-per-seat-setup-shuffle-streams.cjs) intercepts actual turn-zero `ShuffleDeckPrompt` resolutions and derives a separate deterministic xorshift32 stream per seat using fixed salts `0x243f6a88` and `0x85a308d3`. The headless runner also has a built-in `runMatch({isolatePhysicalShuffleRandomness:true})` option that uses separate seat streams with different salts (`0x3c6ef372` / `0xa54ff53a`). Agent50's per-seat cohorts use the Agent26 setup-only adapter, not the built-in flag; these are distinct per-seat protocols and should be compared explicitly before standardizing.

The initial rank4/rank1 contrast is consistent with a seed/deck/shuffle-protocol interaction, but the independent identical-deck control did not reproduce a large seat imbalance. There is no demonstrated causal link between the shared xorshift stream and the original 8/0 outcome. The per-seat adapter is a reproducible independent-stream approximation, not proof of uniform paper shuffling. Its seed derivation, Fisher-Yates implementation, and distribution still require direct validation.

One measurement lesson: a `WANT_TO_DRAW_CARDS` resolution may continue through `initNextTurn` in the same synchronous Store dispatch. The aggregate hand/deck delta can therefore include a subsequent turn-start `MOVE_CARDS` action. Instrument the compensation `CardList.moveTo` call itself; do not attribute every same-dispatch hand delta to the SelectPrompt.

## Reproducibility and underlying evidence

- Legacy cohort: [full report](agent50-rank4-dedechange-natural32-sourcefirst-20261106.md), [preregistration](registrations/agent50-rank4-dedechange-natural32-sourcefirst-20261106.md), [enhanced CI run 42299490842](https://github.com/FlareZ123/experiment-01/actions/runs/42299490842), artifact 13543720846, ZIP SHA-256 `e7feb738ac399788cdd2728c3b245c4006233940148c4feff284da8181399c4c).
- Per-seat cohort: [full report](agent50-rank4-dedechange-perseat32-sourcefirst-20261106.md), [preregistration](registrations/agent50-rank4-dedechange-perseat32-sourcefirst-20261106.md), [CI run 42298886655](https://github.com/FlareZ123/experiment-01/actions/runs/42298886655), artifact 13541919790, ZIP SHA-256 `06b042fb6884b2803f46f8317751106bd89ed108af354b9a791eaa02a32cd491).
- Tests: [legacy](../../tests/agent50-rank4-dedechange-natural32.native.test.cjs), [per-seat](../../tests/agent50-rank4-dedechange-perseat32.native.test.cjs).
- Prior cross-rank per-seat evidence: [Agent26 bilateral mulligan bonus study](agent26-bilateral-mulligan-bonus-exact-20261106.md), artifact 12951923973 (different source decks and candidates).
- Related RNG-stream research: [Agent4 per-seat shuffle A/B/A](agent4-native-postsetup-per-seat-shuffle-mail-aba-20261105.md).

## Required follow-up

1. Execute the preregistered [same-seed identical-rank4 replay](registrations/agent50-identical-rank4-original-seeds-shuffle-symmetry-20261106.md) using the original rank4/rank1 32-seed list under both protocols. This isolates the one-Basic deck-composition difference while preserving the exact seed/seat cohort that produced the legacy 8/0 result. Capture the initial shuffled order or top-seven Basic counts as well as mulligan prompts.
2. Compare Agent26's setup-only adapter against the built-in `runMatch({isolatePhysicalShuffleRandomness:true})` implementation, which uses different salts. Keep all three protocols (legacy shared, Agent26 adapter, built-in per-seat) separately labelled.
3. Test the xorshift32/Fisher-Yates stream pair directly over a large deterministic seed set. Quantify seat-specific Basic counts, mulligan rates, and cross-seat correlation before making a causal claim.
4. Record the physical-shuffle protocol in every Twinleaf experiment manifest. Never combine default shared-stream and per-seat-stream results without an explicit protocol-sensitivity analysis.
5. Reassess prior mulligan-sensitive experiments as results under their recorded protocol; preserve their artifacts and do not silently rewrite them. Any decision to change shared harness defaults should follow independent reproduction and review.

**Scope:** this is a simulator-fidelity warning and setup-rule validation only. It does not select a deck, establish a competitive policy, or demonstrate any win rate against the Aichi Open League 2026 Top 32.
