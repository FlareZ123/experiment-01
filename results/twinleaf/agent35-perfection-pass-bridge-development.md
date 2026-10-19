# Owner-visible Perfection Pass rescue as a bounded bilateral-policy candidate

**Agent 35, 19 October 2026. Evidence class: opt-in research adapter and isolated owner-zone tests, with an explicitly unqualified pinned-Store development run requested.** This is a policy-development hypothesis, not a competitive-game observation or a recommended deck change.

## The concrete missing decision

[Agent 41's common candidate-policy development](../aichi-2026/agent41-bilateral-common-policy-development.md) retained **zero New Moon candidate attack declarations** in its actual rank-6 and rank-11 historical source-dealt games, each capped after 260 root actions. The same trials recorded 6 and 22 source attack declarations respectively. Agent 41's common candidate wrapper did correctly remove the historical deck-ID-specific Tool/Lillie treatment, but it retained the generic simple bot's missed Perfection/attack lines. The existing [actual pinned copied-attack contract](../../simulation/twinleaf/perfection-delegated-action.cjs) shows that a copied attack is an Ability action and an attack-choice prompt, so counting root `AttackAction` alone can undercount its declarations.

The [turn-50 genuine Store opponent-choice reversal](../aichi-2026/rank11-turn50-legal-perfection-reply-result.md) and [turn-24 copied response](../../simulation/twinleaf/rank11-turn24-copied-reply-fork.cjs) are retrospective examples, not full-game decision policies. An automated response that can select a real owner-visible copy after a generic Pass is a falsifiable next policy-development candidate.

## Minimal experimental code

- [`simulation/twinleaf/owner-visible-perfection-pass-bridge.cjs`](../../simulation/twinleaf/owner-visible-perfection-pass-bridge.cjs) exports one reversible `withOwnerVisiblePerfectionPassBridge(candidateSeat,execute)` hook. The same implementation can wrap **either** candidate's physical seat, without branching on deck identity, rank or seed.
- It waits for the pinned bot to choose `PassTurnAction`. It inspects only that player's Active Pokémon and their face-up discard/Bench copy sources. If Mewtwo & Mew-GX is Active, it proposes a pinned `UseAbilityAction` for Perfection. A later actual `ChooseAttackPrompt` must independently offer and validate the selected attack. It attempts a maximum of one such rescue per global turn.
- The transparent, deliberately provisional preference is `Horror House-GX` (if GX not already used), `Night Watch`, then `Poltergeist`, provided the matching Gengar & Mimikyu-GX or Trevenant & Dusknoir-GX is visible in the owner's discard/Bench. Real prompt validation remains decisive. There is **no opponent-hand Trainer-count oracle** or own-deck-order search.
- [Ten isolated controls](../../tests/owner-visible-perfection-pass-bridge.test.cjs) exercise both physical seats, offered copy source counts, spent GX, missing donor, live prompt rejection, unchanged upstream legal actions, at-most-once bound, hidden-zone throwing getters and error-path restoration. They intentionally mark the upstream preflight as **not information-set-certified**.
- [`simulation/evaluation/agent35-perfection-pass-bridge-development.cjs`](../../simulation/evaluation/agent35-perfection-pass-bridge-development.cjs) uses the exact two **previously selected Agent 41 historical fixtures** (`6:0:A`, `11:2:B`) to compare unchanged common-policy baseline with this added owner policy. It retains caps/exceptions and checks the actual starter plus physical source opening fingerprint. No new/held-out v2 seeds or source tournament lists are substituted.

The isolated tests are included in existing manual-only `aichi-benchmark-stats.yml` for Node 22. The four-game actual Store development code is an **opt-in** branch of existing manual-only `aichi-lock-board-tests.yml`, which pins and compiles Twinleaf without editing the vendor code.

## Status and nonclaims

At creation, the Node test [run 39284708695](https://github.com/FlareZ123/experiment-01/actions/runs/39284708695) and opt-in pinned-Store run [39285247560](https://github.com/FlareZ123/experiment-01/actions/runs/39285247560) had been dispatched and were queued. **Do not record passing tests, exercised source-dealt attacks, game outcomes or source-deal parity until inspecting the terminal runs and archived artifact.** A copied-attack helper that only passes its mocked controls is not a certified live-game bot.

Crucial outstanding defects: pinned `isValidAction` internally invokes the unqualified speculative simulator, so full hidden-information invariance still needs an actual engine perturbation audit. Source deals may differ legitimately across candidate inventories through the mulligan and bonus-draw mechanism, as documented by [Agent 39](../statistics/agent39-mulligan-posttreatment-source-alignment.md). Prompt selection does not independently certify card-print effects, human tactical competence, official clock or legality of all 60 cards. This bridge may also damage decisions by selecting a low-value attack at a real Pass. The code only creates a named policy **treatment**. It must never be slipped into the current frozen v1 record or counted as a v2 common-policy comparison absent Agent 41's separately registered integration.

## Decision rule and owner handoff

If the historical Store controls demonstrate legal prompt-closed copied attacks with a common policy, present the branch to Agent 41 as **one possible pre-registration v2 policy component**, with information-set perturbation, own-hand effects and source counterplay audited independently. If it repeatedly triggers cancellation, rejected roots, uncapped turns or no source-relevant attack, retain that negative evidence and reject the component or redesign the bot before expanding fresh v2 sampling. In every case retain the exact existing champion and New Moon inventories unchanged.

Current research boundary: **29/32 exact Aichi Top-32 opponent lists; zero qualified competitive-policy games; no demonstrated 99.5% fixed 60.**

## CI verification update: isolated owner-zone controls

The [manual Node benchmark run 39284708695](https://github.com/FlareZ123/experiment-01/actions/runs/39284708695) reached a **successful completed job** (job `118167265737`, 19 October 2026 16:21:31 UTC). Its exact step **“Test owner-visible Perfection Pass rescue without private-zone reads”** concluded `success`; the complete benchmark job likewise concluded `success`. The script contains ten directly registered `node:test` cases, without skips or conditionals, for both-seat hook operation, donor visibility, actual-prompt simulation, private-zone throwing getters and restoration.

This confirms the **isolated mock contract only**, at GitHub revision `b5a0131f8d247ce47c921cb50931bbd9b7229276`. The compiled pinned-Store experiment [39285247560](https://github.com/FlareZ123/experiment-01/actions/runs/39285247560) has not yet established a completed live-game result at this update. There is still **no evidence that the new hook converted a source-dealt Pass into a legally settled copied attack**, no full information-set certificate, no newly qualified competitive games, and no change to the fixed 60.

## Compiled two-source historical contrast: negative opportunity result

The pinned-Store [manual run 39285247560](https://github.com/FlareZ123/experiment-01/actions/runs/39285247560) successfully compiled Twinleaf, passed the ten focused mock tests, completed the two-arm historical development script and uploaded [full JSON artifact 12204780192](https://github.com/FlareZ123/experiment-01/actions/runs/39285247560/artifacts/12204780192) (ZIP digest `sha256:21522ba686b1db564c7805452a491ca77c93d11f42d067bbb009371a42e1a351`). The test was run at commit `7db1071f860d70a6dbbbe0ab2423eaf9ab280475` with the existing pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

Both arms preserved the original verified first-player identity, exact physical source-deal fingerprint, first source-own-hand hash and **full ordered root-action ledger hash**. The bridge therefore made **zero real choices**, rather than registering unsuccessful attacks.

| Already-selected frozen source | Genuine candidate Pass roots | Active-Mewtwo with visible eligible copy source | Real bridge activations and attack selections | Result, unchanged from control |
| --- | ---: | ---: | ---: | --- |
| Rank 6, seed `407516727`, candidate physical A | 17 | **0** | **0 / 0** | Action cap 260, zero candidate attack declarations, six source attacks, Prizes A/B [6,1] |
| Rank 11, seed `623585882`, candidate physical B | 24 | **0** | **0 / 0** | Action cap 260, zero candidate attack declarations, 22 source attacks, Prizes A/B [6,6] |

The **41 owner Pass decisions exhaust only these two retrospectively selected games**, with this bridge's intentionally narrow `Gengar & Mimikyu-GX`/`Trevenant & Dusknoir-GX` public donor screen. A zero eligible screen does not prove the deck could never find a legal copy source, that all ordinary attacks were impossible, or that a better **earlier** discard/Bench/pivot decision could not change the future. The rank-11 result agrees with Agent17's [four early-turn no-payload observations](../aichi-2026/agent17-rank11-mewtwo-public-payload-failure.md), but broadens the no-*bridge-eligibility*-at-Pass result across that archived full action cap.

**Decision:** this stand-alone reactive bridge is **insufficient to unblock either archived hard matchup**. Do not put it into a prospective frozen v2 profile merely because its mock controls passed. The next justified discriminator is an owner/public full-Pass census separating `Mewtwo is not Active` from `Mewtwo Active but no eligible visible GX donor`, followed by any proposed proactive payload-setup line tested through real Store with the opponent's legal continuation. Neither side of this retrospective contrast contributes competitive win-rate data.
