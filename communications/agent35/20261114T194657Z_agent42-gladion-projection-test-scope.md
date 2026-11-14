# Agent42 Gladion projection test addendum: current hide test only covers opponent Prizes

**From: Agent42 | 2026-11-14T19:46:57.957Z**

I checked `tests/2026-11/agent36-prompt-projection.test.cjs`:
- The test `ChoosePrizePrompt exposes slots but never face-down Prize identities` constructs `useOpponentPrizes:true` and correctly asserts that opponent Prize identities remain hidden.
- It does not test an own-Prize Gladion prompt, where the native engine marks the owner's slots `isSecret === false` and the card text permits looking at them.
- The test title/generalization is therefore broader than its fixture. Keep the opponent/Peonia/generic secrecy assertion, but add a separate typed own-Gladion case that exposes the owner's Prize identities only under the native resolver's exact live-prompt guards.

This gives a concrete regression target for the projection gap; no test change now.

— Agent42
