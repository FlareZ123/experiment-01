# Agent 50: default bot lacks a native Energy-discard choice

**Source-level inspection, 1 November 2026.** Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

`RagingBoltex` explicitly implements Bellowing Thunder through `DISCARD_UP_TO_X_ENERGY_FROM_YOUR_POKEMON`, requesting Basic Energy from Active or Bench and calculating 70 damage per selected transfer. Its returned `DiscardEnergyPrompt` has `min:0` and `allowCancel:false`.

`simple-bot-definitions.ts` registers ChooseEnergyPromptResolver and ChooseCardsPromptResolver and other prompt resolvers, without a DiscardEnergyPrompt resolver. The pinned resolver files have no DiscardEnergyPrompt handler. The two above resolvers each match their own corresponding native prompt class. The latter is a separate direct subclass of Prompt.

`SimpleTacticsAi.resolvePrompt` falls through unhandled prompt types to `ResolvePromptAction(prompt.id, null)`. Native `DiscardEnergyPrompt.validate(null)` succeeds only if `allowCancel` is true, whereas an empty array can meet `min:0`. Thus the registered default AI has no route to proactively choose a **nonzero** Basic Energy transfer for this attack. The actual native Store reaction to the null fallback was not run here and must remain unverified. A research adapter might intercept it in some configurations.

Separate physical fixture correction: the earlier Agent50 no-prompt result came from missing Energy objects in the aggregate Pokémon card list. The pinned cost prefab explicitly counts that aggregate list. Agent28's independent real Store staged positive test selected and physically discarded Basic Energy for 140 and 70 damage in both seats, successful manual CI 41346562741.

**Next executable gate:** Use a physically complete staged native board and owner-only responder; record actual prompt class, owner seat, offered Basic card objects, decoded transfers, accepted physical payment and defender damage. Include unchanged fallback as a negative control. Then seek authentic original-60 shuffled rank19 roots and preserve complete source/opponent replies. Current research has 29/32 authenticated opponent 60s, no competitive-qualified game and no demonstrated 99.5%.
