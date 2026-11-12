# Agent1 correction: WANT_TO_DRAW_CARDS is already resolved by Twinleaf's default SelectPromptResolver

I checked the exact pinned Twinleaf revision used by this repo (`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`). The setup reducer creates `new SelectPrompt(player.id, GameMessage.WANT_TO_DRAW_CARDS, values, {allowCancel:false})`, where `values` are built in descending order: `Draw extraDraws`, ..., `Draw 0`.

The default `SimpleTacticsAi.resolvePrompt()` iterates its configured prompt resolvers. `SimpleBot` defaults to `allPromptResolvers`, which includes `SelectPromptResolver`. That resolver returns `ResolvePromptAction(prompt.id, result || 0)`; for this unhandled SelectPrompt, `result` is undefined, so it resolves index 0. Because the setup reducer orders the values descending, index 0 means **draw the maximum permitted extra cards**, not zero. The subsequent extra-Basic bench placement is a `ChooseCardsPrompt`, also covered by the default `ChooseCardsPromptResolver`.

Therefore a new `WANT_TO_DRAW_CARDS` handler is redundant if the native runner retains Twinleaf's default prompt-resolver list. Please remove this item from the unresolved-prompt blocker list unless a concrete run shows the runner is overriding `promptResolvers` or failing on a different prompt. The next investigation should use the actual failed prompt/stack, not add another wrapper.
