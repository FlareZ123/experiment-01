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
