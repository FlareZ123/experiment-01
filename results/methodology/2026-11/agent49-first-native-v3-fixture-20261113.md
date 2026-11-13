# First complete V3 native Store fixture

**13 November 2026.** The frozen Hood Shield Shadow Rider v1 candidate and the original rank-1 Shadow Rider reference completed the same preset deal before and after a fixture-runner correction. Rank 1 went first and won by clearing the candidate's board on global turn 7. Both players had six Prizes remaining. The Store accepted all 38 actions, 19 per seat. Both games were fixture-only.

| Measurement | Initial run | Replay after resolving engine waits directly |
|---|---:|---:|
| Store actions attempted / accepted | 38 / 38 | 38 / 38 |
| Candidate unsupported prompt fallbacks | 11 | 2 |
| Opponent unsupported prompt fallbacks | 11 | 1 |
| Opponent unexpected seat bypasses | 11 | 2 |
| Actor-only boundary | Invalid | Invalid |

The 19 WaitPrompt responses are empty engine acknowledgements. The headless runner now handles them without calling either player policy. The replay reached the identical final public state, SHA-256 `7808ff9fd01e588b16b76bc2ac427a3fbbeb1847d775a6fd10c8f0c786cbb7d0`. The remaining fallbacks were the starting-Pokémon choice on both seats and the coin winner's choose-first confirmation on the candidate seat.

The candidate made no Benching or search play and never developed a second Pokémon. Its first three turns attached to the lone Shadow Rider Calyrex V and used Shadow Mist. The opponent developed a Bench and Knocked Out the lone Active with Tapu Lele-GX's Energy Drive. The candidate did have an in-hand search route on each of its first three turns. That trace identifies the need for a bilateral early setup policy before deck comparison. This deal supplies no evidence that the registered list itself needs a particular card change.

## Reproduction

- Research commit [0b6b58f7](https://github.com/FlareZ123/experiment-01/commit/0b6b58f7316fa5e66439d265c64aa20f200cc791), Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, Node 20.19.0.
- Existing `agent36-v3-runner.cjs fixture-game` entry point, seed `agent36-v3-fixture-hood-rank1-20261112-01` (uint32 `4065045654`), baseline actor-root policy in both seats, Underworld Door compatibility hook enabled. Full fixture outputs were kept in local private scratch. Run the encrypted owner workflow to retain a transferable trace.
- Pushed-code replay hashes: decisions `e0742e22dd55b9bfe14f800829a07082929d78d10caaad076f879e70bb23d73c`, accepted-action ledger `fd80f7e117244c84c959c0891bf3f79c5891d4a6d901b92d6917885cfe6014a9`, policy application receipt `e558a2beb5eedfd88c82799a450444ea88d4ca0403269ade2d819d1296ecbad9`.
- 189 tests passed under the workflow runtime, including its complete fixture suite and the public printed-card profile tests. Source mappings appear in the [24-rank bridge](../../aichi-2026/2026-11/agent49-pinned-twinleaf-24-rank-bridge-20261113.md).

Zero competitively qualified games and no candidate win-rate estimate.
