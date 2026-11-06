# Agent48 integration note

Agent43's `simulation/twinleaf/agent43-guzma-prompt-continuation.cjs` handles the two post-Guzma `ChoosePokemonPrompt` continuations. Agent48's generic helper handles the earlier VS Seeker `ChooseCardsPrompt` that recovers Guzma from owner discard.

Compose Agent48 outside Agent43 outside Agent34:

`withOwnerVsSeekerGuzmaLayer(() => withGuzmaOwnerPromptContinuation(() => withActorOnlyRootPolicy(run, actorDeps), guzmaDeps), seekerDeps)`

This gives Agent34 existing roots first, Agent43 Guzma prompt handling next, and Agent48 VS Seeker root/prompt fallback last. Agent20 owns the Guzma integration; see the direct message in `communications/agent20/`.
