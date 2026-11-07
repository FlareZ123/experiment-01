# Agent21: pinned Night Stretcher SFA false-positive playability and scoped owner-discard-only fix

**7 November 2026 UTC. Source-specific paper-fidelity diagnosis and bounded native regression, no natural games.**

The actual pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` implements `Night Stretcher SFA` in [`nightly-stretcher.ts`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/10-scarlet-and-violet/set-shrouded-fable/nightly-stretcher.ts). The printed [Night Stretcher SFA 61](https://limitlesstcg.com/cards/SFA/61) is an Expanded-legal Item that returns **one Pokémon or one Basic Energy** from its owner's discard to their hand. It cannot be played in a way that has no eligible target and no applicable effect.

## Native pinned-engine discrepancy, fully executed both seats

Its `NightlyStretcher.canPlay` directly checks whether owner discard contains **any Energy** or any Pokémon, counting Special Energy as sufficient. The actual native effect checks **Basic Energy** or Pokémon and throws `GameError('CANNOT_PLAY_THIS_CARD')` when the only card in the discard is a Special `Double Colorless Energy NXD`.

This contradiction was reproduced with genuine printed `Night Stretcher SFA` on both physical seats, not just inferred from source:

- [CI **42348491623**](https://github.com/FlareZ123/experiment-01/actions/runs/42348491623), **12/12 native Item tests passed**, including genuine `canPlay=true` under Special-only discard followed by `PlayCardAction` throwing `GameError(CANNOT_PLAY_THIS_CARD)`, while Basic recovery and Pokémon recovery cases both successfully move original physical objects to owner hand.
- Source [test](../../tests/agent21-night-stretcher-staged-native.test.cjs), report [owner-deck search and Night findings](../methodology/agent21-pinned-native-box-fog-search-whiff-20261107.md), artifact ID **13564572625**.

The false-positive matters because a headless player that trusts `canPlay` may select a game-aborting Action in a syntactically ordinary Item-play evaluation. It does **not** show this situation occurred in a recorded natural original source deal, and it is not a count of spoiled games.

## Reproducible correction outside vendor code

Research adapter [`simulation/twinleaf/agent21-night-stretcher-paper-eligibility.cjs`](../../simulation/twinleaf/agent21-night-stretcher-paper-eligibility.cjs) exports `withPaperNightStretcherEligibility(execute,deps)` and uses a scoped native prototype descriptor patch. The replacement `canPlay` reads **only the active owner's public discard zone**, returning false if it contains neither any Pokémon nor Basic Energy; otherwise it delegates to the original printed method. It never inspects hidden own deck/Prizes or opponent cards, never modifies the pinned upstream source, and restores the exact original `canPlay` descriptor in a `finally` block even if the caller throws.

An independent [native scoped-hook test](../../tests/agent21-night-stretcher-paper-eligibility-native.test.cjs) **3/3 PASS** in pinned compiled Twinleaf, [CI **42349354851**](https://github.com/FlareZ123/experiment-01/actions/runs/42349354851), artifact **13564976927**, complete `agent21-night-stretcher-paper-eligibility-native.log` SHA-256 ZIP `937b44206a89a5ffb7fb58ff665de8faa0bfd46c7aa33a181a3cc837ac06a45a`. Both actor seats separately accepted Basic and Pokémon targets, rejected a Special-only discard and empty discard, restored the original vendor false-positive **after the scope**, and reported owner-discard-only access. An additional deliberate exception confirmed restoration. Three controls passed, none skipped.

The helper is a **verified component with default-off opt-in scope**; it has not been attached to the shared v8/v9 bilateral opponent policy or evaluated in complete new natural source games. It corrects only this Item's `canPlay` prerequisite. It does not by itself prove the exact Item prompt's minimum-selection behavior obeys paper rules. The pinned source prompts with `min:0` even when a legal target exists; further native experimentation should determine whether `validate([])` is accepted and whether that causes a second card-text mismatch before any broader patch.

## Competitive boundary

This single native fix has no credible qualified game or win-rate evidence. The 99.5% target remains unproven, with 29/32 authenticated original Aichi names/counts and zero competitively qualified matches. Its immediate purpose is to prevent an avoidable false-available action and preserve the real native source game for later evaluation.

## Additional native mandatory-one selection bug, 7 November 07:06 UTC

The printed [Night Stretcher SFA61](https://limitlesstcg.com/cards/SFA/61) says **“Put a Pokémon or a Basic Energy card from your discard pile into your hand”**, explicitly one legal target. The native `NightlyStretcher` implementation instead constructs its `ChooseCardsPrompt` with **`min:0,max:1`** and `allowCancel:false`, even when it has an eligible target. A second native test was committed that stages exactly **one original Basic Psychic Energy in owner discard** alongside a Special DCE, plays the actual Night Stretcher Item, calls genuine `prompt.validate([])` and then dispatches the empty answer.

**Result: confirmed both seats**, [CI **42349547234**](https://github.com/FlareZ123/experiment-01/actions/runs/42349547234) success, native [test](../../tests/agent21-night-stretcher-staged-native.test.cjs) **14/14 PASS**, artifact **13564704258**, ZIP SHA-256 `71b95f178ea14d191a8baf0f320482a3fcbf6337b355ffe4d9b3201b2af75354`. In both seat0 and seat1, actual native `validate([])===true` despite one selectable Basic, `ResolvePromptAction(id,[])` succeeds, printed Item is discarded and the Basic remains in discard. This is a **paper-text/card-effect fidelity problem**, separate from the legal empty restricted *deck search* permitted by Secret Box/Fog and from the previously proven Special-only false-positive `canPlay` bug. Under the bundled Advanced Player's Rulebook, an Item that instructs selection of one target cannot voluntarily fulfill its one-card effect with zero when an eligible target exists. It also means a naive bot could exploit the engine to burn Night Stretcher from hand without recovering anything.

**Remediation scope:** the current `withPaperNightStretcherEligibility` helper fixes only the `canPlay` false-positive. A separate source-owned and native-tested prompt boundary should enforce **exactly one legal Basic Energy/Pokémon** for this specific Night Stretcher effect, without altering ordinary zero-target restricted deck searches or every generic `ChooseCardsPrompt`. Preserve original paper prints, actual owner discard identities, original Info prompts and Item custody when testing. No vendor source changes or global policy release were made in this invocation.
