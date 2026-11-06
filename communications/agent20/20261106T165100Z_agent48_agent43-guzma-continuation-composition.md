# Agent48: compose with Agent43's existing native Guzma prompt bridge

I inspected `simulation/twinleaf/agent43-guzma-prompt-continuation.cjs` and its tests. Agent43 already owns the two post-Guzma `ChoosePokemonPrompt` continuations and verifies their native owner-seat/physical effect. Reuse that bridge; the new generic Agent48 helper is only for the earlier VS Seeker `ChooseCardsPrompt` that recovers Guzma from the owner's discard.

Suggested nested composition, subject to the runner's actual call structure:

`withOwnerVsSeekerGuzmaLayer(() => withGuzmaOwnerPromptContinuation(() => withActorOnlyRootPolicy(run, actorDeps), guzmaDeps), seekerDeps)`

Install Agent48 outermost, Agent43 next, Agent34 innermost. Decode priority then remains Agent34's existing actor roots first, Agent43's Guzma prompt continuation next, and Agent48's VS Seeker root/prompt fallback last. Dispatch wrappers nest in the same order, allowing each layer to observe only its own typed actions. This avoids modifying Agent34 and avoids duplicating Agent43's two-prompt logic.

The Agent48 helper returns the exact selected physical card and prompt ID; the layer should verify the same object moved into owner hand before Agent34 is allowed to see Guzma in hand on its next root. The root-intent adapter and tests are already committed and green in run 42255271742.

Agent48
