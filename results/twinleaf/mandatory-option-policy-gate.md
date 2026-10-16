# Pinned bot cancels mandatory choice prompts and bypasses source card effects

**Agent 24, 16 October 2026.** Engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Source-backed policy-fidelity finding, **not a game-winning-rate observation**.

## Verified source dataflow

The pinned [SelectOptionPromptResolver](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/prompt-resolver/select-option-prompt-resolver.ts) always returns `undefined`. [SimpleTacticsAi.resolvePrompt](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/simple-tactics-ai.ts) consequently falls through to `ResolvePromptAction(prompt.id, null)`. This can happen when the prompt explicitly has `allowCancel: false`.

[Guzma & Hala CEC 193](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-cosmic-eclipse/guzma-and-hala.ts) is a concrete example. Its card effect presents a two-mode `SelectOptionPrompt` with `allowCancel: false` and default option `0`. Its callback searches for a Stadium when the result equals `0`; alternatively, choice `1` opens discard and multiple-card search prompts. A `null` answer fits neither branch. The pinned `Prompt.validate` inherited by `SelectOptionPrompt` defaults to true, and the pinned `Store.reducePrompt` passes a `null` result to the callback. This permits the bot to skip both modal branches.

The [source Aichi inventory](../aichi-2026/full-decklists.json) includes **13 copies of Guzma & Hala** across five published lists: rank 2 (four), rank 6 (two), rank 15 (three), rank 24 (two) and rank 29 (two). Each is part of an archetype where its specific mode choice can materially affect the turn, but no human matchup conclusions follow from that count.

## Research-side correction and tests

[`withMandatoryOptionFallback`](../../simulation/twinleaf/mandatory-option-policy.cjs) prepends a research-owned `MandatoryOptionResolver` to the bot's prompt resolver sequence. For noncancelable option prompts, it returns an **enabled default option** and falls back to the first enabled choice if necessary. When all options are disabled, it raises a visible error. Cancelable option prompts continue through the unchanged default behavior. The original engine is not modified.

The [compiled tests](../../tests/mandatory-option-policy.test.cjs) check the pinned default `null`, a corrected enabled choice, disabled-option selection, correct handling of legitimately cancelable prompts, and a *real pinned Store* `Guzma & Hala` fixture in which selecting mode `0` opens the Stadium-search card-selection prompt. [Manual CI 38835180998 passed](https://github.com/FlareZ123/experiment-01/actions/runs/38835180998). An additional negative-control test dispatching default `null` to the real Store is included in the next pending regression.

**Strategic limitation:** always selecting option `0` is a minimal action-legality fallback. A strong Guzma & Hala deck may need mode `1` to discard cards and obtain a Tool and Special Energy. This policy has no DCI/UDP awareness, Supporter contention model or multi-card ALS decision quality. The fallback therefore enables meaningful legal execution without certifying adequate play.

## Composition and next experiments

The [opt-in compound Expanded policy](../../simulation/twinleaf/policy-profiles.cjs) profiles independent tactical corrections for Double Dragon Energy, Supporter proposal, Temple response, Tool-supplied attacks, Bunnelby evolution and mandatory option prompts, while preserving an untouched baseline. It records a separate policy identifier and an explicit list of components. Its compiled-engine tests are in [`expanded-policy-profile.test.cjs`](../../tests/expanded-policy-profile.test.cjs), and [`expanded-policy-aichi-fixture.cjs`](../../simulation/twinleaf/expanded-policy-aichi-fixture.cjs) provides a source-deck execution probe.

A next useful test should set the actual rank-2 Vileplume board and hand for the `Tag Call -> Guzma & Hala -> Jet Energy + TM Evolution -> Bunnelby` ALS, with the correct Item/Supporter timing, realistic discard availability and the engine's real prompt interactions. Distinguish ability to execute the mandatory mode from the policy selecting the tactically best mode. Compare any candidate results only under one documented fixed policy and engine revision.
