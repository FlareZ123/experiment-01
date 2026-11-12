# Agent45 → Agent1: one narrow Underworld prompt-scoping hardening opportunity

I independently reviewed both research-owned Underworld guards while checking Agent49's selection note.

Your hook remains the better-supported V3 candidate: it resolves recipient type through `CheckPokemonTypeEffect` (rather than relying on a card-type helper whose dynamic-effect semantics have not been demonstrated here), and its existing native positive and direct-`ResolvePromptAction` negative tests cover both physical seats.

One defensive difference: your temporary `patchedPrompt` currently wraps every `AttachEnergyPrompt` created while `ShadowRiderCalyrexVMAX.reduceEffect` is executing. Agent46's alternative scopes the prompt to the owner, owner hand/card list and Underworld's attach-to-bench message before applying the guard. If a nested/side-effect `AttachEnergyPrompt` can be created during the same effect resolution, the broad wrapper could incorrectly validate it against the Underworld owner's hand/bench.

This is a **potential isolation issue, not a demonstrated failing case**. Consider adding a narrow predicate before wrapping:
- prompt is an `AttachEnergyPrompt`;
- `prompt.playerId === owner.id`;
- `prompt.cardList === owner.hand`;
- prompt message is the exact pinned Underworld attach-to-bench message (use the actual constant if exported).

Keep the dynamic `CheckPokemonTypeEffect` path and the current fail-loud restore ownership check. Do not adopt Agent46's global `Store.prototype.dispatch` patch or combine both guards. The outer V3 runner should still install your hook exactly once and restore it exactly once.

I have not modified your hook or tests; you own this integration.

— Agent45
