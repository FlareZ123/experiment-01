# Authentic Underworld Door owner-prompt continuation: pinned native two-seat settlement

**Agent 34, 3 November 2026.** Paper Expanded source-mechanics and native policy development. This is a narrower prerequisite to game-strength inference, and no game win rate is estimated.

## Previously observed failure motivating the change

The original preregistered rank-1 Shadow Rider comparison, [Actions run 41505123566](https://github.com/FlareZ123/experiment-01/actions/runs/41505123566), used the same original-source and candidate lists, root policy and eight independent seed groups across both physical seats. It observed 35 authenticated original-source Underworld Door root actions; 32 completed a full native Psychic attachment, marker transition and two-card draw. Three `ResolvePromptAction` attempts failed strict `AttachEnergyPrompt` validation after a real Underworld Door root. Three treatment attempts terminated with `engine-error`. An independent SHA-verified abort audit recovered 16/16 same source physical openings but only 13/16 proved full bilateral openings and verified first-player receipts. See [complete abort-pair audit](agent34-fresh-underworld-abort-source-parity-20261103.md).

## Implemented default-off owner-typed source continuation

`simulation/twinleaf/agent34-actor-typed-energy-prompt.cjs` adds a conservative owner-only candidate selector with a source-stamped real Store continuation. The selector sees the actual player's own-hand card printings and the two visible boards through a deeply detached observation; it cannot inspect opposing hidden zones. It considers held Basic Psychic Energy and printed Psychic recipients on the owner's Bench, preferring the exact source Bench slot when eligible. Before proposing a native typed `ResolvePromptAction`, it finds the physical Energy in the pending prompt and requires `prompt.validate(answer) === true`. The actual Store applies the effect and remains the final legal authority.

The tracker begins only after a real physical `UseAbilityAction` named Underworld Door was accepted by the live Store. It requires the same owner, physical seat, and turn. The wrapper restores original Store and bot prototypes after every call. Unrelated prompts are delegated unchanged. The compatibility correction for the pinned Underworld paper recipient bug is applied symmetrically to both players and both study arms.

The new continuation is explicitly opt-in through `ownerUnderworldPromptContinuation` in `simulation/evaluation/agent7-canonical-actor-composition.cjs`, and through `actorUnderworldDoorPromptOwner` in the bilateral `runDevelopment` fixture. It is default-off in historical baselines.

## Verified tests, exact scope and caveats

[Compiled pinned native Actions run 41626572430](https://github.com/FlareZ123/experiment-01/actions/runs/41626572430) **passed**: all 11 pure contract regressions, a clean compile of the exact checked-out Twinleaf engine, and two native staged tests across both physical seats. Each staged test used a real Shadow Rider Calyrex VMAX + off-type Dialga-GX Bench, genuine `UseAbilityAction`, real intervening `WaitPrompt`, real paper-recipient-restricted `AttachEnergyPrompt`, original physical Psychic Energy from hand, and actual Store attachment plus two-card deck draw. No off-type recipient was funded. The underlying card and engine setup are constructed test positions, separate from naturally dealt match outcomes.

The first CI attempt ([41625936682](https://github.com/FlareZ123/experiment-01/actions/runs/41625936682)) failed because the wrapper looked for synthetic `abilityName` rather than the pinned native `UseAbilityAction.name`. The genuine Store `agent34-underworld-physical-settlement-witness.cjs` revealed the correct action property; the fix and pure fixture correction passed the next native run. Engine semantics are therefore supported by executed tests rather than relying on the synthetic property.

A separate [posthoc replay driver](../../simulation/evaluation/agent34-rank1-underworld-owner-prompt-posthoc-development.cjs) keeps the previously observed 16 original trial rows and identical candidate lists, with the new owner-prompt selector in **both** arms and the original Underworld root as the only OFF/ON change. Because the new selector was designed after examining the three failed prompts, this is deliberately labeled **retrospective development**, with `competitiveQualifiedGames=0`. This file and the manual-only workflow were added to allow independent repeatable development and archiving; the native full-game outcomes have not yet been counted in this report.

## Next source-mechanics experiment

Determine whether the source-stamped owner-prompt continuation prevents all three historical strict failures on the same 16 trials while preserving real source Underworld payments and 16/16 full bilateral physical openings. Compare actual source-game terminal/censored status, not only the count of accepted roots. Independently check source-marker/attachment/hand-deck witnesses and Store records. Follow with **new preregistered seeds** for confirmatory testing if the retrospective repair succeeds. Integrate this source-agnostic root→prompt→payment pattern into a reusable owner action planner before promoting any win-rate claim.

**Qualifying competitive games:** 0. **Authenticated official opponent lists:** 29/32. **Proven 99.5% benchmark:** no.
