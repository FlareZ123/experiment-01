# Rank-8 source 60: invalid Tapu Koko Prism Star two-target Energy assignment

**Agent 11, 17 October 2026.** Evidence class: fresh compiled physical source-deal replay, post-choice strict-prompt rejection and pinned resolver source audit. **Zero competitive games qualified.**

## Reproduction and provenance

- Archived [Agent 41 six-game rank-8 source pilot CI 39041216040](https://github.com/FlareZ123/experiment-01/actions/runs/39041216040), source head `0de5fdf1965dbc388cebe65dff400cb5a5494b9c`, had one fatal `AttachEnergyPrompt` result in `pilot:8:0:temple-v1:A` at prompt **57**.
- I added a single-game replay `simulation/twinleaf/rank8-attach-energy-prompt-source.cjs` and an explicitly opted-in job to the **existing manual-only** `aichi-lock-board-tests.yml`. [Fresh compiled CI 39050139463](https://github.com/FlareZ123/experiment-01/actions/runs/39050139463), head `9499bed6be877d511e6ad951f6f7e7a7c235eae2`, **passed**. The one-game replay reproduced prompt 57 and yielded artifact **12107865511**, `rank8-temple-A-attach-prompt/rank8-attach-prompt.json`.
- Same fixed candidate `Temple v1` source 60 against rank-8 Yusuke Kobayashi's registered Absol/Garbodor 60, physical candidate slot **A**, seed **3755937400**, pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, current `DoubleDragonAttachTactic-v4`, strict prompt validation and source-known guards. This is a replay under the current code and policy, not an invariant recreation of every historical implementation detail.
- The fixture catches the expected failure and records its evidence as an explicit **failed action proposal**; the workflow passing means the diagnostic completed. It does **not** mean the match or bot decision was valid.

## Exact rejected decision

The failure's `post-choice-invalid-attach-energy-selection-v1` evidence records:

| Field | Observed |
| --- | --- |
| Prompt | 57, `ATTACH_ENERGY_TO_ACTIVE` (`AttachEnergyPrompt`) |
| Source zone | Own discard pile, **22 cards** |
| Eligible source cards | **2** Lightning Energy |
| Required count | `min=1, max=2` |
| `differentTargets` | **true** |
| Proposed result | **2** different physical `Lightning Energy MEE` cards |
| First destination | Benched **Tapu Koko Prism Star**, slot index **2** |
| Second destination | **The exact same Tapu Koko** in slot index **2** |
| Other eligible Bench Pokémon | Two Mega Absol ex, slots **0** and **1**, plus Trubbish slot **3** |
| Underlying failure | Two **identical destinations** while `differentTargets=true` |

Both Energy assignments were drawn from the actual discard zone, both satisfied the Energy filter, and the two source cards were physically distinct. The strict validator correctly refused the duplicated destination.

This prompt is emitted by the pinned `TapuKokoPrismStar` class (`ptcg-server/src/sets/08-sun-and-moon/set-team-up/tapu-koko-prism-star.ts`), Ability **Dance of the Ancients**. The printed TEU 51 text requires selecting **two Benched Pokémon** and attaching one Lightning Energy to **each**, supporting the distinct-target restriction (see [printing and 2026 Aichi rank-8 source](https://limitlesstcg.com/cards/teu/51)). The engine prompts with `differentTargets:true`.

## Pinned source root cause

The pinned `ptcg-server/src/simple-bot/prompt-resolver/attach-energy-prompt-resolver.ts` `getPromptResult` iterates Energy and calls `assignToBestTarget` separately. Each call sorts targets by speculative `getStateScore` and selects the highest scoring target. It reads and honors `blockedTo`, but **does not read `differentTargets` or track previously selected destination targets**. After assigning the first Lightning Energy to Tapu Koko, the second independent pass may select Tapu Koko again. The selection is still passed to `ResolvePromptAction`; the opt-in strict validator rejects it.

This is a concrete generic bot policy implementation defect with a legal target alternative on the same board. It directly explains the repeatable single invalid trial recorded by Agent 41. The bot also chose its own Tapu Koko for both intended Energy attachments even though that Pokémon goes to the Lost Zone as Dance resolves. That self-defeating choice indicates separate strategic weakness; correcting the duplicate alone cannot qualify the policy.

## Field scope, qualifications and next experiment

Tapu Koko Prism Star TEU 51 appears as a singleton in four available source lists: ranks **8, 19, 22 and 26**. No frequency of actually using its Ability is established. First implement a **reversible research-side** resolver correction satisfying `differentTargets` while preserving accurate counts, source-card identity and attachment legality; then prove current rank-8 replay passes prompt 57, inspect new continuation and test a serious alternative opponent line. Compare with an unmodified control of `differentTargets=false` and with no eligible second target. Do not alter Twinleaf upstream.

The archived and reproduced failures and the generic source inspection do not establish any actual competitive win rate, match advantage or correctness of an entire game. The global research target of 99.5% across 32 matchups remains unverified.


## Reversible distinct-target policy contrast, same source game

The [manual CI 39050769262](https://github.com/FlareZ123/experiment-01/actions/runs/39050769262) step **`Paired rank-8 Tapu Koko distinct-target source replays` passed**, source head `eb5fb30a56d79f79d1376e79986126a8ba9ae025`. Archived diagnostic artifact: **12107932005** (`rank8-distinct-target-contrast/rank8-distinct-targets.json`). The main workflow was still completing independent later diagnostic steps when the specific paired test evidence was retrieved; a green step does not imply an entire workflow is green.

The [reversible research-owned bot hook](../../simulation/twinleaf/distinct-attach-targets-hook.cjs) wraps the actual compiled `AttachEnergyPromptResolver` `getPromptResult` and `assignToBestTarget` methods. For `differentTargets:true` only, it temporarily adds each previously selected destination to the prompt's `blockedTo` list, leaving the original per-target scoring in place and restoring the source prompt options after each suggestion. Its install/restore also preserves both original prototype methods. The [two-arm physical replay](../../simulation/twinleaf/rank8-distinct-targets-contrast.cjs) uses the **same physical candidate/opponent 60-card identities, same seed 3755937400 and identical remaining engine/policy flags**.

| Observation | Unmodified source resolver | Opt-in distinct-target guard |
| --- | --- | --- |
| Prompt 57 | Invalid duplicate Tapu Koko target | Progressed past prompt 57 |
| Run status | `AttachEnergyPrompt` exception | Completed engine game |
| Root dispatch count | Interrupted | **134** |
| Engine turn count | Interrupted | **13** |
| Engine `finished` | N/A | `true` |
| Engine winner slot | N/A | **0** (physically Temple candidate A) |
| Number of distinct-target prompts seen by hook | N/A | **2** |
| Successful proposed Energy destinations recorded by hook | N/A | **4** |
| Earlier destination exclusions applied | N/A | **2** |
| Resolver prototypes restored | Not installed | **Yes, both** |

**Interpretation:** A small reversible restriction correction removes a real source-game fatal prompt and permits a complete diagnostic trial. The engine's candidate-A terminal winner is **not a competitive win**: the opponent policy was previously demonstrated to be weak, initial-turn coverage is inadequate, card rules remain incompletely corrected, and the revised prompt policy is not independently qualified. In particular, the restriction hook does not ensure that Energy is allocated to useful attackers rather than to Tapu Koko, which removes itself from play.

**Next evidence:** Inspect exact corrected target destinations and source-game opponent attacks/passes; test alternate usable target choices and realistic Absol/Garbodor responses, including the other physical starting order. Retain the fixed policy/version label when comparing raw and guarded actions. This hook is independently scoped to this experiment and **has no headless `runMatch` request flag yet**.


## Source-game attack and chosen-Energy continuation audit

A second [compiled source replay 39051229231](https://github.com/FlareZ123/experiment-01/actions/runs/39051229231) **passed**, archiving `rank8-distinct-target-contrast` artifact **12106854300** at source head `38d8634945f021bc553bbe54c0794d31f690fafe`. The diagnostic was extended with actual root `attackTrace`, `PassTurnAction` counts, first-turn evidence, final Prizes and explicit pre-choice-independent resolver target proposals. It confirms the same completed **134-action, 13-turn** corrected source game, actual candidate **seat A first**, engine winner **A**, final remaining Prizes **[0,6]**.

| Seat | Actual attacks | Observed Pass actions |
| --- | --- | ---: |
| Temple v1 candidate A | **6 Full Moon Rondo**, on turns 3/5/7/9/11/13, all by Lillie's Clefairy ex | 1 |
| Source rank-8 Absol/Garbodor B | **1 Venomous Fang** (Crobat V, turn 6); **2 Terminal Period** (Mega Absol ex, turns 10/12) | 3 |

The resolver's diagnostic target proposals for **source prompt 57** occurred twice in the policy/scoring process. Each proposal assigned the first physical Lightning to **Tapu Koko** Bench index **2** and the second to one **Mega Absol ex** Bench index **0**. The two proposal observations should not be construed as two distinct actual uses of Tapu Koko's once-only Prism Star Ability. The source game's Tapu Koko consequently receives Lightning immediately before exiting play, a strategically wasteful option while two Mega Absol attackers are available. The pinned resolver's `differentTargets` correction makes the proposal legal, with its strategic preference still substantially questionable.

In view of the opponent's limited, conditional attack sequence and six-Prize terminal margin, the **13-turn engine victory remains demonstrably unqualified as a human-competitive result**. It is a specific source-policy trajectory, and the correct adversarial next test is to force a plausible legal alternate opponent-owned Bench/Discard choice: attach one Lightning to **each Mega Absol ex**, then continue from the unchanged source seed and other decisions as far as the real policy permits. The counterfactual is implemented in `simulation/twinleaf/rank8-tapukoko-two-mega-absol-counterfork.cjs`; its own CI proof must be recorded before drawing any outcome conclusion.
