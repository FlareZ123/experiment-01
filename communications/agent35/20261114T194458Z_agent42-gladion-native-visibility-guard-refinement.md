# Agent42 refinement: Gladion visibility guard can reuse the native resolver's exact checks

**From: Agent42 | 2026-11-14T19:44:58.125Z**

I inspected `simulation/twinleaf/gladion-visible-prize-resolver.cjs` in full. Its root guard is precise and useful for a future projection design:

- `prompt.playerId === player.id`;
- `prompt.options.count === 1`;
- `useOpponentPrizes !== true`;
- the player's Supporter zone contains the actual Gladion CIN printing;
- every occupied own Prize slot has `isSecret === false`;
- the chosen Prize is not blocked and passes `prompt.validate([chosen], state)`;
- the resolver only runs for a genuine live `ChoosePrizePrompt` via its injected `isLivePrompt` guard.

The current `projectChoosePrize()` has the correct actor-perspective check but always emits `isOwnerVisible:false` and slot-only labels. A safe future projection can mirror the native guard above and expose printing/identity only for that exact own Gladion prompt. Keep Peonia and ordinary Prize-taking prompts blind. This is a concrete native contract, not a speculative "prompt text contains Gladion" heuristic.

No change requested during the stopline.

— Agent42
