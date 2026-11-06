# Agent 3: physical Prize exits at every real Store root, including terminal automatic final three

**6 November 2026.** A native source-custody and accounting result for the **same original eight Aichi v8 registered trials** under two **different developmental policies**. The selected v8 common-policy control remains unmodified. A separately registered retrospective Telepath + default-Confirm-false treatment has seven capped attempts and one engine terminal. **Zero competitively qualified games, no new selected deck, and no demonstrated 99.5% field result.**

This extends [Agent3's v21 exact original-trial KO/prompt card custody](agent3-v21-selected-v8-registered-trial-prize-provenance-20261106.md) by observing *all physical Prize-zone exits* independently of `ChoosePrizePrompt`. The key distinction is that **taking all remaining Prize cards can be automatic**: the pinned Twinleaf `check-effect.ts` `choosePrizeCards` logic checks when the Prize award reaches remaining Prizes, calls `autoTakePrizeCards`, and ends the native game without constructing a Prize-selection prompt. The pinned `prefabs.ts` `TAKE_SPECIFIC_PRIZES` physically moves individual Prize objects to a destination, defaulting to their owner's hand.

## Source, instrumentation, and registration identity

- Same eight exact original trial IDs/historical 60-card sources, ranks **6/11/1/3**, candidate 60s Champion reference and New Moon Lockbreaker, source/candidate seat assignment and registered physical setup frame. Registration: `results/aichi-2026/registrations/agent36-issue25-common-v8-broader-prospective-20261106.json`. Fixed paper Expanded Black & White onward; printed legality is a separate question. 
- Pinned actual Twinleaf submodule revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Default-off observer `simulation/twinleaf/agent3-authoritative-root-prize-exit-observer.cjs` reads card **object identity and physical zone membership only** on the Store explicitly received from `headless.runMatch` `onRootStoreCreated` callback. It counts successful outermost Store dispatches and for each physical Prize exit records the exact registered trial ID, receiving player seat, root action type, turn, source Prize-count change and physical destination. It does not read Prize faces and does not classify any Prize exit as a legal KO by itself.
- KO→Prize-prompt observer `simulation/twinleaf/agent3-ko-source-prompt-physical-v4.cjs` independently records source-correlated native KnockOutEffect, genuine native ChoosePrizePrompt and exact Store-settled physical object transfers. One added callback parameter `trial.id` at the current research-owned `agent41-bilateral-v2-development.cjs` run boundary makes assignment unambiguous per registered attempt.
- Both observers are passive, rolled back after execution and regression-tested against other simulated Stores, missing root binding, hidden faces, two player seats, exception restoration and silent no-op. Both native test harnesses enforce the original registered trial IDs, pinned gitlink, typed status/root count, unqualified status, zero policy hidden Prize reads, and physical object joins.
- Running these observers does not alter the printed 60s, original physical deals, combat decisions, initial seeds, or the native game engine. Retrospective treatment differences are **separate from** observer noninterference.

## Compiled native executions

| Condition | Exact registered attempts | Root loop actions | Native Store successful dispatches | Prize-exit roots | Physical cards exiting to owner hand | KO-linked Prize prompts | Native terminal games | Qualified paper games |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Original selected v8 common-policy baseline | 8 | 887 | 903 | 6 | 8 | 6 | 0 | 0 |
| Retrospective Telepath + owner Confirm default false | 8 | 1006 | 1022 | 8 | 14 | 7 | 1 | 0 |

Both Store-dispatch denominators include 16 initial `AddPlayerAction` setup calls (two for each of eight native Stores) beyond the 887 and 1006 match-loop actions. Both archived audits recorded **zero thrown Store dispatches**, although the original baseline has five engine errors elsewhere in the native bot/decision sequence. An action-limit return is never a native game result.

**Baseline native CI:** [run 42309917320](https://github.com/FlareZ123/experiment-01/actions/runs/42309917320), **SUCCESS**, [artifact 13547933349](https://github.com/FlareZ123/experiment-01/actions/runs/42309917320/artifacts/13547933349), artifact ZIP SHA-256 `7c7819d9f08c6ec5f25e0b87f0925cafa167911a97165b67759d5fc393c1bcfa`, `agent3-v22-selected-v8-ko-source-physical.json` SHA-256 `085927e097a48f5464bf9b492aeffd1f6153ca0b7e94a35503e919094ba5c390`. The control has three 128-root caps and five engine errors. Its **six Prize-zone-exit roots exactly match all six prior native Prize-selection prompts**, with one-to-one same-trial/seat/turn/physical-card-count matching, and eight physical owner-hand card transfers. All six exits occurred in `ResolvePromptAction` roots. **No additional prompt-free physical Prize exits occurred within this bounded control.**

**Treatment native CI:** [run 42310603535](https://github.com/FlareZ123/experiment-01/actions/runs/42310603535), **SUCCESS**, [artifact 13549085324](https://github.com/FlareZ123/experiment-01/actions/runs/42310603535/artifacts/13549085324), artifact ZIP SHA-256 `0f186a14841b6459b8f6c8665e9c9948a96da506424e41cf0aba2f3de429316e`, `agent3-v23-selected-v8-ko-source-physical.json` SHA-256 `190905a4a94eade2bf4926796d02efcbe696335e6b9d33d06f3804c9a8d1da0f`. The treatment has seven 128-root caps, **one native engine terminal at 110 roots**, zero native engine errors. Exactly seven prompt-mediated native Prize settlements account for **11 physical objects**. One additional prompt-free native Prize-taking event accounts for **three physical objects**. All 14 events were owner-hand transfers, all eight physical root exits used `ResolvePromptAction`, and both observer suites matched all seven prompt-mediated events.

## Newly verified native terminal last Prize-taking

The exact original registered trial is **`1:212:B:champion-reference`**, rank 1 Shadow Rider opponent at seat0 against fixed Champion-reference candidate at seat1. This is the already discussed default-Confirm-false retrospective treatment's **only native terminal**. The actual pinned Store finished at action/root 110 with `winner=1` (candidate seat1), `endReason=engine-game-end`, and **remaining Prize zones `[6,0]`**. The registered original source had zero actually declared attacks in that terminal, an important indicator of weak native opponent strategy.

The native read-only physical auditor now shows the **same six actual physical Prize card objects leaving the candidate's Prize zone** through three accepted Store roots:

| Turn | Candidate Prize count before → after | Exact objects moved to candidate hand | Actual native root action | Genuine KO-correlated ChoosePrizePrompt present? |
| ---: | --- | ---: | --- | --- |
| 13 | 6 → 5 | 1 | `ResolvePromptAction` | Yes |
| 17 | 5 → 3 | 2 | `ResolvePromptAction` | Yes |
| **25** | **3 → 0** | **3** | `ResolvePromptAction`, final phase 7 | **No** |

The final three physically moved to the player's hand in a **Store-settled prompt-resolution root**, while the KO-prompt observer saw no `ChoosePrizePrompt` for that final Prize award. One source `KnockOutEffect` candidate was unmatched to a Prize-selection prompt in the v4 observer during this treatment. The pinned native code's automatic final-Prize branch, the final three object movements, and the already independently observed four settled attacker actions together explain the source of that prompt-free receipt. That linkage still lacks a unique `executeCheckState` call token, so it is a **strong native-implementation consistency witness** and remains `paperKoCertified=false`.

The **only other new physical Prize exit** beyond the six control events is a three-card `ChoosePrizePrompt`-mediated hand transfer on treatment original **rank11 Absol/Garbodor vs New Moon Lockbreaker**, source seat1, turn20: source Prize count **5→2**. This event occurred after the original selected v8 run had terminated with an engine error at root88 and the retrospective Confirm/Telepath treatment continued to the 128-root cap. It therefore expands source exposure under a *different* policy and is not an isolated treatment-effect estimate.

## Why this matters, and what it cannot prove

The prior six-prompt instrumentation was **complete for the six physical Prize exits in the selected original v8 control** but would have **missed the final three winning Prize cards in the continued terminal treatment**. Any simulator summarizer relying only on `ChoosePrizePrompt` would undercount actual physically taken Prizes in precisely the game-ending situation where correct accounting matters most.

The independent native Store-level physical-zone auditor fills that evidence gap by counting all exited card objects, classifying the destination, and retaining the action, registered trial and observed owner. The observer does **not** assert that all exits are legal Knock Outs; effects like Gladion, Prize recovery, Lost Zone redirection, and sudden-death setups require classification before treating movement as Prize achievement.

The terminal is from a **retrospective, combined** owner Telepath and default-false Confirm prompt treatment. It cannot attribute its game ending to Telepath, prove strategic quality of declining optional Abilities, certify attack payment or deck legality, or represent a competent rank1 opponent. The original rank1 source made zero attacks. No full paper 25-minute adjudication or all-32 opponent admission exists. The data should improve **native simulation accounting and causal source diagnostics**, while retaining **zero qualified competitive games and no claimed 99.5% performance**.

## Reuse and handoff

- **Pure tests:** `tests/agent3-authoritative-root-prize-exit-observer.test.cjs`, `tests/agent3-ko-source-prompt-physical-v4.test.cjs`.
- **Native exact original selected-v8 baseline:** `tests/agent3-issue25-v22-v8-all-root-prize-exits.native.test.cjs`.
- **Native independently continued v8 treatment:** `tests/agent3-issue25-v23-telepath-confirm-auto-prize-physical.native.test.cjs`.
- **Execution:** existing manual-only `.github/workflows/agent50-rank26-koko-dual-recipient-native.yml`, input `issue25_v14_only=true`; no new push-trigger job and no upstream submodule edits.
- Next: integrate complete physical Prize-zone exit census into prospectively registered native policy comparisons; store a separate engine KO source token for genuinely unique cause proof; improve rank1 source action/decision competence and paper-rule payment before elevating any win.
