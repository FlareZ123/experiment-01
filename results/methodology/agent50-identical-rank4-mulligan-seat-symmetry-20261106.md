# Agent50: identical-rank4 mulligan seat-symmetry control

**6 November 2026 | 32 CSPRNG seeds × two physical-shuffle protocols | setup-only evidence.**

## Question and design

This control removes the rank4/rank1 Basic-count difference from the earlier same-seed protocol comparison. Both physical seats use the exact same original Aichi rank4 60-card deck (13 Basic Pokémon). Thirty-two unique CSPRNG seeds were preregistered, with source/first-player seat alternating 0/1 (16 each). Each seed/seat pair was run under two protocols, for 64 setup attempts:

1. `legacy-shared`: default Twinleaf `runMatch` seeded `Math.random` stream.
2. `per-seat`: Agent26's setup-only `withPerSeatSetupShuffleStreams` adapter, with salts `0x243f6a88` / `0x85a308d3`.

The two arms share seeds and first-player seats, but intentionally generate different physical permutations. This is a matched seed/protocol comparison, not a same-deal counterfactual.

## Results

**64/64 setup attempts reached source turn1.**

| Measure | Legacy shared | Agent26 per-seat |
|---|---:|---:|
| Attempts | 32 | 32 |
| Source-seat assignments | 16 / 16 | 16 / 16 |
| Mulligan pairs (seat0/seat1) | 22 × 0/0; 4 × 0/1; 3 × 1/0; 2 × 1/1; 1 × 0/2 | 25 × 0/0; 4 × 0/1; 3 × 1/0 |
| Total mulligans by seat | **5 / 8** | **3 / 4** |
| Total mulligan hands | **13** | **7** |
| Unequal-mulligan attempts | 8 | 7 |
| Compensation recipients | seat0 5 / seat1 3 | seat0 4 / seat1 3 |
| Compensation prompts / cards | 8 / 9 | 7 / 7 |
| Public mulligan acknowledgements | 24 | 14 |
| Exact compensation movement verified | 8/8 | 7/7 |
| Source turn reached | 32/32 | 32/32 |
| Per-seat shuffle events | not isolated | 32/32 rows shuffled both seats |

Both protocols are near-balanced in this identical-deck cohort. The legacy stream produced five mulligans in seat0 and eight in seat1; the per-seat adapter produced three and four. The eight legacy compensation events split five to seat0 and three to seat1. The seven per-seat events split four to seat0 and three to seat1. All prompt owners matched the player with fewer mulligans, every draw amount matched the difference, and all physical compensation moves preserved exact card identity. Paired by seed, the exact `(seat0, seat1)` mulligan-count pair matched in 20/32 seeds and differed in 12/32; whether either player mulliganed differed in 11/32. Eighteen seeds had zero mulligans under both protocols. The legacy arm also produced 13 total mulligan hands versus seven in the per-seat arm. The protocols therefore change a meaningful number of opening outcomes even with identical decklists; the lower count in one 32-seed sample does not establish which protocol is more paper-accurate or statistically better.

### Every unequal-mulligan attempt

| Protocol | Source seat | Seed | Mulligans seat0/seat1 | Recipient | Draw |
|---|---:|---:|---:|---:|---:|
| legacy-shared | 1 | 992294796 | 1/0 | 1 | 1 |
| legacy-shared | 1 | 1399047795 | 0/1 | 0 | 1 |
| legacy-shared | 0 | 1491347570 | 1/0 | 1 | 1 |
| legacy-shared | 0 | 1619097818 | 0/1 | 0 | 1 |
| legacy-shared | 1 | 1627583495 | 0/2 | 0 | 2 |
| legacy-shared | 0 | 1805704226 | 0/1 | 0 | 1 |
| legacy-shared | 0 | 2876260826 | 0/1 | 0 | 1 |
| legacy-shared | 1 | 3572311945 | 1/0 | 1 | 1 |
| per-seat | 1 | 10694126 | 0/1 | 0 | 1 |
| per-seat | 1 | 992294796 | 1/0 | 1 | 1 |
| per-seat | 1 | 1399047795 | 1/0 | 1 | 1 |
| per-seat | 0 | 1805704226 | 0/1 | 0 | 1 |
| per-seat | 1 | 2515780647 | 0/1 | 0 | 1 |
| per-seat | 0 | 3019620503 | 0/1 | 0 | 1 |
| per-seat | 0 | 3285964837 | 1/0 | 1 | 1 |

## Interpretation relative to the rank4/rank1 cohorts

This control **does not reproduce a general seat0-only mulligan bias** under the legacy shared stream. In the earlier rank4/rank1 32-seed cohort, the legacy protocol produced eight seat0 mulligans and zero seat1 mulligans, with all six compensation prompts going to seat1. That was a strong anomaly in that particular deck/seed cohort. Under this independent identical-rank4 seed cohort, the legacy stream is instead slightly seat1-heavy (5/8), and the per-seat protocol is similarly balanced (3/4).

Therefore:

- Do not claim that Twinleaf's legacy shared RNG has a general physical seat-order bias based on the earlier rank4/rank1 cohort.
- The rank4/rank1 same-seed protocol sensitivity remains real as an observed cohort contrast, but it may involve seed/deck/shuffle interactions or ordinary sampling variation. The current identical-deck control uses a different preregistered seed set, so it does not isolate the earlier cohort's one-Basic deck-composition difference on the exact same seeds.
- The per-seat adapter is not proven paper-exact. This control only shows that neither protocol generated a large seat imbalance in this identical-deck sample.
- Continue to record and segregate shuffle protocols. A same-seed identical-deck replay using the original rank4/rank1 seed list, plus direct top-seven/permutation logging, is the next discriminating experiment.

## Reproducibility

- Preregistration: [`agent50-identical-rank4-mulligan-seat-symmetry-legacy-vs-perseat-20261106.md`](registrations/agent50-identical-rank4-mulligan-seat-symmetry-legacy-vs-perseat-20261106.md).
- Test: [`agent50-identical-rank4-mulligan-seat-symmetry.native.test.cjs`](../../tests/agent50-identical-rank4-mulligan-seat-symmetry.native.test.cjs).
- Workflow: [`agent50-rank26-koko-dual-recipient-native.yml`](../../.github/workflows/agent50-rank26-koko-dual-recipient-native.yml), input `identical_rank4_mulligan_seat_symmetry_only=true`.
- Successful CI: [42301221530](https://github.com/FlareZ123/experiment-01/actions/runs/42301221530), head `529d127925f7a487e3e020c74c767af555dbd153`.
- Artifact: [13543722525](https://github.com/FlareZ123/experiment-01/actions/runs/42301221530/artifacts/13543722525), ZIP SHA-256 `071a6f70be922dca7b5edd0d7e5a770f2b797ee8f05104744263040cb446eeca`. All 64 JSON files match their individual SHA-256 sidecars.
- Twinleaf pin: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Deck SHA-256 (both seats): `3f82c3a7c43d62979ea2196b74bffd22fc51d6e7cc11cc27be9daad10d02b423`.
- All 64 rows reached turn1 and were stopped at the fail-closed raw-State quarantine; every row records one quarantine call and zero original native raw-State decoder executions. No complete games were played.
- The first CI attempt [42300782531](https://github.com/FlareZ123/experiment-01/actions/runs/42300782531) failed because the harness shallow-copied each fullName string into an object instead of passing string arrays. The corrected test uses independent `slice()` copies for each identical deck; no first-attempt rows are included in the result.

## Next steps

1. Replay the original rank4/rank1 seed list with identical rank4 decks under both protocols. This isolates deck composition while retaining the exact seed/seat cohort that showed the 8/0 legacy mulligan skew.
2. Compare Agent26's adapter against the built-in `runMatch({isolatePhysicalShuffleRandomness:true})` implementation, which uses different salts.
3. Capture initial shuffled order/top-seven Basic counts to locate any shuffle-stream interaction directly.

**Scope:** setup and simulator-randomization diagnostics only. No deck-strength claim, no completed competitive games, and no demonstrated Aichi Top 32 win rate.
