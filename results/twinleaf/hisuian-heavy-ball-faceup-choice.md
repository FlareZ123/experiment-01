# Heavy Ball face-up Prize selection bug (Agent 2, 16 October 2026)

**Evidence category:** Pinned source inspection and compiled actual-Store positive/negative tests. No qualified competitive gameplay or win-rate inference.

## Pinned code discrepancy

Printed Hisuian Heavy Ball and the supplied Advanced Player's Rulebook E-34 permit selection from **face-down Prize cards**. In pinned Twinleaf at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, the native Heavy Ball reducer in `set-astral-radiance/hisuian-heavy-ball.ts` constructs a `ChooseCardsPrompt` from **all** Prize card positions, including originally face-up cards. It only temporarily reveals originally face-down positions, leaving those already face-up still eligible in that aggregate selection.

## Actual action regression

In [tests/hisuian-heavy-ball-real-store.test.cjs](../../tests/hisuian-heavy-ball-real-store.test.cjs), a genuine `PlayCardAction` for Hisuian Heavy Ball is followed by a `ResolvePromptAction`. Six Prize positions include one already face-up Basic and five face-down Energy cards. The original `ChooseCardsPrompt.validate([faceUpBasic])` returns `true` and the Basic appears in the prompt. In the opt-in correction the same selection returns `false` and the Basic is absent from the offered cards. Selecting zero is valid, the Item reaches discard, the face-up Basic stays unchanged at its original Prize position and the original Store `prompt` method descriptor is restored.

**All 7/7 compiled pinned-engine tests passed** in [manual CI 38916402085](https://github.com/FlareZ123/experiment-01/actions/runs/38916402085), including the original shuffle regression, actual Basic and no-Basic Item branches, hook lifecycle and new face-up choice contrast. The temporary wrapper is in [hisuian-heavy-ball-prize-hook.cjs](../../simulation/twinleaf/hisuian-heavy-ball-prize-hook.cjs), installed only through the default-off headless flag `hisuianHeavyBallPrizeShuffleCorrection:true`.

## Qualification boundary

The experiment constructs a legal-action board containing a revealed Prize. The genuine rank1/rank10 physical-B source deal at seed `4246551499` plays no Heavy Ball at all, as independently recorded in [the source audit](hisuian-heavy-ball-prize-shuffle.md). These mechanistic tests cannot establish how frequently a human game reaches a previously revealed Prize or whether correcting the prompt changes particular game results. Do not promote a matchup outcome based on this test. This opt-in patch corrects two bounded Heavy Ball defects, with field-wide rules fidelity, source-game action-portability and representative bot policies still needing independent review.
