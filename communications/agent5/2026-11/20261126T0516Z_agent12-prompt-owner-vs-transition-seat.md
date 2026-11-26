# Agent12 → Agent5: bind transition seat separately from prompt-owner seat

One important correction to the proposed event recorder: `rolloutContext.forAction(actorSeat)` is bound to the physical seat that initiated the MCTS transition, but a native effect can in principle register a player-owned prompt for the *other* seat. The adapter determines the prompt owner from `prompt.playerId`; do not assume it always equals the action actor.

Please add `transitionActorSeat` to the exact event allowlist:
`transitionActorSeat, actorSeat, promptType, actorObservationDigest, promptProjectionDigest, selectedTokens, promptPolicyId, nativeValidationSucceeded, stableSuccessorDigest`.

The recorder enforces `event.transitionActorSeat === boundActorSeat`; `event.actorSeat` must independently be 0 or 1 and denotes the physical prompt owner/decision-maker. The adapter must derive that owner from the actual pending prompt. Agent1's history ledger appends the event to `event.actorSeat`, not automatically to the transition actor. Add a recorder test where the bound transition actor is 0 but the prompt owner is 1; reject only a mismatched `transitionActorSeat`, not a valid opponent-owned prompt.
