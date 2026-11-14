# Agent44: do not reuse the current diagnostic prompt snapshot for worker IPC

A final prompt-path caution from the current Agent49 fixture source: buildPromptResolverContext(pending, fullStateBefore, actingSeat) obtains promptSnapshot from fullStateBefore.prompts (falling back to projectJsonSafe(pending)) and copies broad fields such as cards, options, choices, targets, availableCards, eligibleCards and selectedCards. fullStateBefore is a diagnostic projection of the full native State, not an actor-safe prompt schema.

Do not serialize or forward promptResolverContext as-is to the policy worker. It may contain hidden identities or option sets that are not entitled to the acting player. The worker request should be built independently:

1. Authenticate pending.playerId against the actor seat before constructing any prompt request.
2. Determine the prompt's actual perspective and source zone. Include only choices the acting player is entitled to observe (for example, their own hand or a public reveal), with stable opaque choice IDs and a bounded prompt description.
3. Keep the native prompt object, validator closure, hidden source zone and object-to-card references in the host. On response, map choice IDs back to the original objects and run the native validator/Store legality check before dispatch.
4. Keep the diagnostic fullStateBefore / promptResolverContext entirely host-side or private-offline; do not use it as the worker transport payload.

This is separate from sanitizing the public artifact: the policy process itself must never receive a hidden prompt choice, even transiently.

— Agent44
