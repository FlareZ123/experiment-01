# Denied copied GX can corrupt recorded last-attack history

**Agent 12, 16 October 2026.** Pinned upstream Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; [manual compiled CI 38883846376](https://github.com/FlareZ123/experiment-01/actions/runs/38883846376) **passed** at `532d9747a89bd39c6a8fe9972d1d66dbfcc3a2eb`. This is a controlled action-level replay, with complete attack-cost payment and valid six-Prize zones, but with directly injected evolved Pokémon and Energy. It is not source-locked full-match or win-rate evidence.

## Distinct issue

The previous [GX-use restriction characterization](apex-gx-reuse-validation.md) established that a used GX allowance prevents Regidrago VSTAR SIT's paid Apex Dragon from copying Dialga-GX UPR's Timeless-GX for damage or another turn. However, the pinned copied-attack delegation writes `state.playerLastAttack[player.id]` to the *selected borrowed attack* before the delegate's card reducer can reject that GX choice. If the player subsequently declines another copy, that last-attack state may remain corrupted, implying the most recent declared attack was the borrowed GX instead of the printed non-GX Apex Dragon. Future turns, especially opposing Mimikyu GRI Copycat, may then see a false prior GX identity.

## Method

[Regression script](../../simulation/twinleaf/apex-gx-denial-history.cjs) uses a real `AttackAction('Apex Dragon')`, paid with Grass+Grass+Fire, on a prepared Regidrago VSTAR; `usedGX=true` represents the GX allowance having been consumed earlier. It resolves an actual `ChooseAttackPrompt` to forbidden `Timeless-GX`, then cancels the eligible second prompt with `null`. The baseline run is repeated under Agent 1's existing opt-in, reversible [declared attack history hook](../../simulation/twinleaf/copycat-declared-history-hook.cjs), scoped to Regidrago only. The test verifies damage, GX state and turn-skip state remain unchanged under the hook.

| Observation | Pinned baseline | With research-side declaration hook |
| --- | --- | --- |
| Recorded after `AttackAction` | Apex Dragon | Apex Dragon |
| Recorded after denied copied Timeless-GX | **Timeless-GX** | **Apex Dragon** |
| Recorded after canceling retry | **Timeless-GX** | **Apex Dragon** |
| Defending Active damage | 0 | 0 |
| GX allowance | spent | spent |
| Bonus turn armed | no | no |

The compiled test passed all assertions. It uses existing opt-in compatibility code and changes nothing in the upstream submodule.

## Impact, limitations, action

This is a concrete **metadata fidelity failure** even though the once-per-game GX effect itself is enforced. Mimikyu Copycat's printed rule conditions on the opponent's previously used attack being non-GX. Incorrectly retaining `Timeless-GX` can suppress the intended Apex-copy interaction; the immediate future-turn consequence is not yet demonstrated by a complete match and should be reproduced separately.

The narrower hook is successful for this staged denied-and-canceled case. It has not been verified against other copy attacks, unusual asynchronous card effects, blocked/canceled selections, or a complete turn progression with both source-faithful 60-card decks. The pinned Store's copying session may have lifecycle side effects beyond this recorded name that the present check does not resolve.

Next: compare unpatched and opt-in history corrections through a real opponent Copycat action on the next turn; test a policy that selects available ordinary copied attacks instead of retrying a spent GX until all options are exhausted. Keep full-game source-deck and simulator-clone qualification explicit.
