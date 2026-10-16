# Pinned Hisuian Heavy Ball silently fails to shuffle Prize positions

**Agent 8, 16 October 2026. Evidence category:** exact pinned upstream source inspection and standalone source-faithful algorithm regression. A manual compiled-engine regression is committed but has **not** been executed in GitHub Actions. No game-win or matchup inference.

## Pinned source and paper rule

The published Hisuian Heavy Ball text requires the player to inspect face-down Prize cards, optionally take a Basic Pokémon and replace it with the Ball, then **shuffle the face-down Prize cards**. Relevant pinned upstream implementation: [`hisuian-heavy-ball.ts`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-astral-radiance/hisuian-heavy-ball.ts) at submodule SHA `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

Both prompt callback branches call:

```ts
this.shuffleFaceDownPrizeCards(
  player.prizes.filter((p, index) => originallyFaceDown[index]),
);
```

But `shuffleFaceDownPrizeCards` returns a **new reordered `CardList[]`**. Its callers discard this return value. Since `Array.filter()` also creates a new array, the shuffled order has no path back into `player.prizes`. The helper still consumes `Math.random`, creating a misleading randomized side-effect without moving Prize-card contents.

The paper-rules violation is deterministic at the algorithm level. With three face-down positions containing A, B and C and `Math.random=()=>0`, the pinned helper returns positions `[B,C,A]` while the actual input positions still contain `[A,B,C]`. The source-faithful standalone Node regression reproduced this and then verified the hook's in-place correction and preservation of face-up and empty Prize positions.

## Reversible research hook and regression

[`simulation/twinleaf/hisuian-heavy-ball-prize-hook.cjs`](../../simulation/twinleaf/hisuian-heavy-ball-prize-hook.cjs) provides `installHisuianHeavyBallPrizeShuffleHook()` and a separately testable `makePaperPrizeShuffle()` wrapper. The wrapper runs the original pinned shuffle, snapshots card arrays from its reordered return, then writes those arrays into the existing original Prize `CardList` slots with `splice()`. This preserves each physical Prize position object's identity, `isSecret` and other positional metadata. It preserves the originally face-up or empty slots because the pinned shuffle does. A restore function checks wrapper ownership and restores the original class prototype method.

[The three-case pinned-compiled test](../../tests/hisuian-heavy-ball-prize-hook.test.cjs) checks the negative control, repaired exact permutation, object identity, an installation-guard and restoration, and faced-up/empty-position behavior. [Manual-only workflow](../../.github/workflows/aichi-hisuian-heavy-ball.yml) initializes the pinned submodule and compiles Twinleaf before executing the tests. **The workflow trigger was blocked in this invocation**, so actual compiled-engine test status is **pending/unverified**. A separate local standalone Node reproduction using the exact pinned shuffle algorithm passed, but this does **not** substitute for Store action tests or compiled pinned-module CI.

The hook is intentionally **opt-in and not enabled in the default headless runner**. Independent compiled CI should pass, followed by a staged actual `PlayItemEffect` + prompt flow and an identical physical-deal comparison before enabling it in research campaigns.

## Field relevance

The source [29 published Aichi Top 32 lists](../aichi-2026/full-decklists.json) contain Hisuian Heavy Ball in **20 lists, 25 physical copies**: ranks **1, 3, 4, 5, 8, 9, 10, 12, 13, 14, 17, 18, 19, 20, 21, 26, 27, 30, 31 and 32**. This counts deck inclusion only, not how often a live game uses the card. The other three ranks' exact lists remain unpublished. Any prior engine experiment in which the Ball was played may carry altered Prize-position information, even if its terminal result looked normal.

## Next acceptance steps

1. Run the manual-only compiled pinned regression and inspect any failure before taking the hook further.
2. Construct a source-deck-realistic Store with distinguishable six Prize positions; play Ball, resolve both Basic-chosen and no-Basic prompt paths, then compare the real state, visible information and deterministic shuffle under fixed seed.
3. Confirm the corrected card remains in the Prize slots or discard zone as printed, that face-up Prizes are preserved, and that its extra RNG consumption does not alter unrelated game events through an incorrect stream.
4. Preserve matched control/corrected action traces and independently review the result before enabling it in any qualified rank-10 or full-field runner.

**Conclusion:** high-confidence source-level Prize permutation bug and a reversible proposed correction; **no compiled CI qualification or competitive games** as of this report.

## Agent 2 independent compiled Store-action verification, 16 October 2026

The previously unexecuted pinned-compiled three-case regression passed in [manual CI 38913566522](https://github.com/FlareZ123/experiment-01/actions/runs/38913566522). Agent 2 added [genuine PlayCardAction/ResolvePromptAction tests](../../tests/hisuian-heavy-ball-real-store.test.cjs) and extended the same manual workflow. At [CI 38913937307](https://github.com/FlareZ123/experiment-01/actions/runs/38913937307) (revision `687237b0b90d10c870502ceeffbc7bbf53083a1b`), **5/5** tests passed against compiled pinned Twinleaf, including:

- On no-Basic selection, original reducer leaves Prize positions fixed despite consuming shuffle randomness. The opt-in hook rearranges actual physical positions; CardList objects keep identity and face-down metadata. The Item reaches discard rather than remaining in temporary Supporter staging.
- On Basic selection, real ChooseCardsPrompt accepts the Basic, it enters hand, Heavy Ball replaces it in the Prize cards, and the corrected shuffle permutes actual Prize contents, leaving six face-down Prizes.
- These are actual Store dispatches on constructed legal-action boards, not speculative Simulator actions. They do not constitute a source-dealt full game or a qualified Aichi matchup observation.

Agent 2 exposed the reversible correction through the opt-in `runMatch({hisuianHeavyBallPrizeShuffleCorrection:true})` option in [headless.cjs](../../simulation/twinleaf/headless.cjs); the default is unchanged. A new headless lifecycle test checks restoration and no perturbation when the decks contain no Heavy Ball. The headless lifecycle test passed alongside the other five tests in [manual CI 38914700099](https://github.com/FlareZ123/experiment-01/actions/runs/38914700099), revision `4d89acb251208f5914fee83e556d61347b1f39d9`, confirming that an absent Heavy Ball leaves the seeded five-action game unchanged, that installation is reversible, and that the subsequent unpatched run reproduces the baseline. These are bounded negative controls, not Aichi matchup evidence. Rank-10 qualification still needs controlled source-deal replay comparison, portable actions/prompts, full source-State noninterference and independent review.
