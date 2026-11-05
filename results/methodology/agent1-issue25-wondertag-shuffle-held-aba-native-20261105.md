# Native source-ranked Wonder Tag affirmative search with identical shuffle validation in all A/B/A arms

**Agent 1, 5 November 2026. Evidence level:** 24 native Twinleaf Store attempts on eight previously registered Aichi source-development trial IDs. **All 24 return unqualified. Zero competitive game outcomes.**

## Research question

The draft Agent3 v15 Wonder Tag affirmative treatment also changed the numeric shuffle validator only in its treatment. An independent [shuffle-only A/B/A negative control](agent1-issue25-shuffle-only-aba-native-negative-control-20261105.md) subsequently reproduced the original eight 2026-11-04 registered source deals and showed zero public-root or disposition differences attributable to numeric validation alone in the no-Wonder-Tag treatment path. The remaining causal problem was that an affirmative Wonder Tag search introduces a new shuffle occasion.

This experiment holds the exact same **`withNumericShuffleValidator`** wrapper selected in **A, B, and repeated A**, while leaving the printed source 60s, physical seats, seeds, protected opening, v14 owner Confirm/Prize/ChoosePokemon baseline, printed source-attack policies and Night Watch private entropy selection unchanged. The one intended variation is the owner-only `withOwnerWonderTagPrompts` affirmative Supporter-search handler in the B arm.

## Executing policy and evidence

New [comparison runner](../../simulation/evaluation/agent1-issue25-wondertag-shuffle-held-aba.cjs), [pure wrapper-selection test](../../tests/agent1-issue25-wondertag-shuffle-held-aba.test.cjs), [native 24-arm test](../../tests/agent1-issue25-wondertag-shuffle-held-aba.native.test.cjs). The runner invokes the published Agent3 v15 `compareWonderTagAba` comparator, which in turn uses the stricter v13 A/B/A physical-prechoice HMAC and complete public-root tests. The same eight original `agent1-issue25-prechoice-input-custody-retro-v8-20261104` registered rank6/rank11 physical source identities were replayed. No seed or list was chosen after observing these results.

[Manual GitHub Actions run 42035868116](https://github.com/FlareZ123/experiment-01/actions/runs/42035868116) built pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, committed workflow/run revision `9fd77f7dd3726e237b655de3307fe89ff6112a1a`, and **passed** both pure policy tests and the exact native 24-attempt comparator test. The original untouched "sham" and separate shuffle-only jobs were skipped by the explicit manual flag.

| Validation criterion | Actual native observation |
| --- | ---: |
| Native registered Store attempts | 24 |
| Original source trial IDs | 8 |
| Same real owner input HMAC across campaign contrasts | 32/32 |
| Same native request HMAC | 32/32 |
| Same native first-player | 32/32 |
| Repeated A identical public roots and native disposition | 8/8 |
| All-three source-deal fingerprints identical | 8/8 |
| Validated Affirmative Wonder Tag prompts offered | 2 |
| Actual affirmative confirmations native accepted | 2 |
| Real owner deck Supporter search prompts offered | 2 |
| Actual source-owner Supporter selections native accepted | 2 |
| Exactly selected Supporter physically transferred to own hand | 2 |
| Native Wonder Tag selections rejected / unsettled | 0 / 0 |
| Trials with A→B public root difference | 2/8 |
| Trials with A→B changed native disposition | 0/8 |
| Competitively qualified paper games | 0 |

The two changed trials were the previously observed **rank11:103:B** original-source-Aichi printings, one each of the champion-reference candidate and the New Moon Lockbreaker v1 candidate. Their first different public roots were at original Store action ordinals 12 and 18, respectively:

| Trial | Identical immediately preceding public roots | Control next public root | Affirmative Wonder Tag next public root |
| --- | --- | --- | --- |
| `11:103:B:champion-reference` | `PlayCardAction Tapu Lele-GX`, `ResolvePromptAction ConfirmPrompt` | `PlayCardAction Darkness Energy` | `ResolvePromptAction ChooseCardsPrompt` |
| `11:103:B:new-moon-lockbreaker-v1` | `PlayCardAction Tapu Lele-GX`, `ResolvePromptAction ConfirmPrompt` | `PlayCardAction Darkness Energy` | `ResolvePromptAction ChooseCardsPrompt` |

The positive owner-local audit reported `confirmOffers=2`, `searchOffers=2`, `confirmed=2`, `selectedSupporters=2`, `settledSupporterTransfers=2`, `nativeAccepted=4`, `nativeRejected=0`, `nativeUnsettled=0`, `nativeCustodyFailures=0`, `nativeMissingSearchFollowup=0`, `readsUnrevealedDeckBeforeSearch=false`. All four accepted choices were in physical **seat 0**. This panel therefore does **not** demonstrate the same affirmative behavior arising naturally in seat 1; a separate existing native staged synthetic test covers that seat under eligible conditions. The `wholePolicyInformationSafe` audit explicitly remained **false**, so overall decision-policy privacy certification cannot be inferred.

The six rank6/rank11:102 trials had identical complete native public-root histories between A and B. All eight source-trial A/B/A runs returned `returned-unqualified`; their native terminal statuses and failure/cap dispositions were unchanged. No source-vs-candidate game strength inference follows.

The complete sanitized result, including public accepted roots, all original A/B/A failure statuses and experimental control fields, is preserved as [artifact 13418567757](https://github.com/FlareZ123/experiment-01/actions/runs/42035868116/artifacts/13418567757). The native receipt writer printed an inner JSON file digest `sha256:c7e7d7cb0f0c7e4aae26ebcd81cf3db7d393907fe746e837f06a9dbcf2cad59b` and **23,414 bytes**; the GitHub Actions ZIP artifact lists `sha256:7c0e15c6e204882aab0f796857f34aec85cef314365d4b10397274231d24d539`. Both are cited from native output, without independently downloading and rehashing the ZIP.

## Meaning and remaining blockers

The matched native evidence isolates an **accepted owner-affirmed Supporter search**, changing a real subsequent public root in precisely two previously registered development contexts. It follows the correct physical source deck, generates the native ChooseCardsPrompt, and transfers exact physical Supporters with successful Store dispatch. That is a useful new executable policy capability.

There is no demonstrable improvement in game win rate, matchup coverage, tactical Supporter search quality, posterior source-deal prevalence, legal opponents beyond these original source cases, or full paper-rule correctness. The default owner search always chooses the **first** available Supporter; no AMR or multi-axis tactical valuation is implemented. The selected source-level correction for Lele under Iron Thorns is already included in the preexisting frozen request flags; [our separate guard-composition test](agent1-wondertag-iron-thorns-guard-composition-native-20261105.md) verified its native wrapper compatibility. This exact A/B/A panel cannot itself certify full-game policy information safety, printed Guard effects on every state, native ShuffleDeckPrompt reveal/shuffle temporal completion, or useful KO/Prize tempo.

The original benchmark remains **29 authenticated Top32 sixty-card inventories**, no original lists for ranks 23/25/28, **zero competitively qualified games** and no established 99.5% performance. Any comparison citing this experiment must label its outcome as retrospective policy mechanics, not deck strength.
