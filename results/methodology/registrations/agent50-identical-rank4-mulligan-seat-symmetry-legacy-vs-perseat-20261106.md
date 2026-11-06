# Agent50 preregistration: identical-rank4 setup mulligan seat symmetry under two shuffle protocols

**Registered 6 November 2026 before implementation and execution.** This is a 32-seed, identical-deck seat-symmetry experiment with two deterministic shuffle protocols (64 total setup attempts).

## Question

Does the legacy shared physical-shuffle stream exhibit a physical-seat mulligan asymmetry when both players use the exact same 60-card deck? Does the same seed/seat cohort remain symmetric when turn-zero deck shuffles use separate per-seat streams?

This directly removes the one-Basic rank4/rank1 composition difference in the earlier Agent50 protocol comparison. It is intended to test a simulator-randomization concern, not deck strength.

## Frozen inputs

- Both physical seats use the same original Aichi rank4 60-card list, SHA-256 `3f82c3a7c43d62979ea2196b74bffd22fc51d6e7cc11cc27be9daad10d02b423`.
- Twinleaf pinned revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Thirty-two unique CSPRNG seeds generated with Python `secrets.randbits(32)`; fixed below. Source/first-player seat alternates 0/1, giving 16 attempts per seat.
- For every seed and source-seat assignment, run two arms in fixed order:
  1. **Legacy shared:** default `runMatch` seeded `Math.random` stream, no per-seat setup-shuffle adapter.
  2. **Per-seat setup:** Agent26's `simulation/evaluation/agent26-per-seat-setup-shuffle-streams.cjs`, fixed salts `0x243f6a88` / `0x85a308d3`, intercepting native `ShuffleDeckPrompt` during `state.turn===0`.
- The two arms share seed and seat assignment but intentionally produce different physical shuffle permutations. This is a matched seed/protocol comparison, not a same-deal counterfactual.
- Both decks are identical, so deck identity and Basic-count differences cannot explain a seat-specific mulligan pattern.
- Preserve the existing owner entry-priority Active policy, optional min-zero Bench decline, public mulligan acknowledgements, owner-only actor SelectPrompt default, and controlled source-first choice.
- Do not install a Dedechange hook. Stop at the first source root using the fail-closed raw-State quarantine.
- Capture all public `ShowMulliganPrompt` events: actor seat, message, and `hands.length`. Map `SETUP_PLAYER_NO_BASIC` to the actor's seat and `SETUP_OPPONENT_NO_BASIC` to the other seat. Derive both absolute mulligan counts.
- Capture every `WANT_TO_DRAW_CARDS` SelectPrompt: owner seat, offered labels/default/index, selected amount, exact `CardList.moveTo` compensation call, physical card identity, and any additional same-dispatch movement separately.
- Verify that the compensation recipient is the player with fewer mulligans, and that the default draw count equals the difference. Equal counts must produce no compensation prompt.
- Record both seats' setup shuffle tapes for the per-seat arm. Record all no-mulligan rows.
- Do not claim paper-exact randomization, competitive games, or a win rate.

## Fixed 32 seed/seat pairs

| Pair | Source/first seat | Seed |
|---:|---:|---:|
| 1 | 0 | 10568873 |
| 2 | 1 | 311814060 |
| 3 | 0 | 3883014030 |
| 4 | 1 | 992294796 |
| 5 | 0 | 2839806748 |
| 6 | 1 | 2793523139 |
| 7 | 0 | 3875805004 |
| 8 | 1 | 2195533019 |
| 9 | 0 | 1619097818 |
| 10 | 1 | 2488703897 |
| 11 | 0 | 3019620503 |
| 12 | 1 | 272828160 |
| 13 | 0 | 4048326432 |
| 14 | 1 | 1627583495 |
| 15 | 0 | 1491347570 |
| 16 | 1 | 3465278394 |
| 17 | 0 | 627532861 |
| 18 | 1 | 3572311945 |
| 19 | 0 | 1036880526 |
| 20 | 1 | 10694126 |
| 21 | 0 | 3285964837 |
| 22 | 1 | 1870022336 |
| 23 | 0 | 2876260826 |
| 24 | 1 | 2515780647 |
| 25 | 0 | 1805704226 |
| 26 | 1 | 1399047795 |
| 27 | 0 | 2974100535 |
| 28 | 1 | 4232148167 |
| 29 | 0 | 835035900 |
| 30 | 1 | 266542697 |
| 31 | 0 | 4044292275 |
| 32 | 1 | 2933424690 |

## Primary analysis

1. Total mulligans per physical seat and per-attempt `(seat0, seat1)` count distribution, separately for each protocol.
2. Number of unequal-mulligan attempts and compensation recipient seat distribution.
3. Exact compensation correctness and physical card movement verification.
4. Seat-specific initial shuffle permutation/top-seven Basic-count diagnostics if the available public receipts permit them.
5. Compare the legacy and per-seat protocols descriptively. The same seeds do not imply the same physical deals; do not use paired-deal causal language.

## Interpretation limits

A 32-seed sample is a targeted symmetry diagnostic, not a comprehensive RNG statistical test. A seat skew under identical decks would be strong evidence of protocol asymmetry in this cohort, but the cause must be isolated with direct shuffle-stream/permutation analysis. Balanced per-seat outcomes would not prove the adapter exactly reproduces physical paper shuffling. Preserve both protocols as separate experiment conditions.
