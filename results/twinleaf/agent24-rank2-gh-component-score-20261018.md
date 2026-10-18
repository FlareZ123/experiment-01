# Rank-2 Guzma & Hala: nine-part score attribution

**Agent 24, 18 October 2026. Predeclared before compiled outcome.** Exact source rank-1 (physical A) and rank-2 (physical B) Aichi 60s, seed 20261023, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, first mover B, global turn5/root action68. Both arms use source-K0 Bunnelby and Stage target; they differ only in optional G&H mode-one resolver. The [first verified score probe](agent24-rank2-gh-root-score-20261018.md) measured G&H -185 versus -189, with Bellelba -186 in both arms. The new read-only component observer attempts to locate which of nine existing `StateScore` components generated that four-point change.

[Source](../../simulation/twinleaf/rank2-gh-score-components.cjs) and [regression](../../tests/rank2-gh-score-components.test.cjs) wrap the existing nine `getScore` methods and the actual `PlaySupporterTactic` evaluation. Each implementation is invoked once without independent rescoring, and prototypes are restored in `finally`. Controls require unchanged selected-action trace and that the nine returned component values sum to the recorded `StateScore` total. A difference in root selected action or incorrect sum invalidates this attribution. No published-card changes, new deck proposal or competitive game is evaluated.

[Manual CI run 39136504791](https://github.com/FlareZ123/experiment-01/actions/runs/39136504791) dispatched at head `fc026892a36072b47790c7accde2a6b6dd33e479`, **pending at protocol creation**. Artifact when produced: `rank2-gh-score-components`.

## Compiled outcome

[Manual CI 39136504791](https://github.com/FlareZ123/experiment-01/actions/runs/39136504791) **PASSED** at head `fc026892a36072b47790c7accde2a6b6dd33e479`. Both source-dealt baseline versus passive-observer root action traces were identical. The nine component sums matched all four original `StateScore` totals. Archived `rank2-gh-score-components` artifact ID **12140057094**, ZIP SHA256 `c615fd488da72405525ba0375a6fc1d5050d86e8f9fd7951ce37cad33b539f63`.

| Genuine G&H scorer component | Mode one OFF | Mode one ON | Difference |
| --- | ---: | ---: | ---: |
| HandScore | 12 | 10 | **-2** |
| PlayerScore | 40 | 38 | **-2** |
| OpponentScore | -62 | -62 | 0 |
| ActiveScore | 9 | 9 | 0 |
| BenchScore | 56 | 56 | 0 |
| EnergyScore | -240 | -240 | 0 |
| Special conditions, damage, tools | 0 | 0 | 0 |
| **Total** | **-185** | **-189** | **-4** |

Bellelba's unchanged option-independent score was -186 (Hand 10, Opponent -59, Player 38, Active 9, Bench 56, Energy -240, other components zero). The two competing scores therefore reverse ordering entirely through HandScore and PlayerScore under the added mode-one resolver.
