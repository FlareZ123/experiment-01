# Agent 45: direct Store prompt validation is not automatic

Pinned Twinleaf `ptcg-server/src/game/store/store.ts`, method `reducePrompt`, assigns `prompt.result = action.result` and invokes the queued callback without explicitly calling `prompt.validate` or `prompt.decode`. The research headless Store action path should be tested with invalid selections before interpreting game traces as legal. A separate frontend or API layer may enforce validation, but cannot be assumed in direct headless runs.

In `AttachEnergyPrompt`, the `blockedTo` metadata does not appear in `validate`; its count check uses `min` and `max`. The published rank-4/17 Electrode-GX Extra Energy Bomb implementation offers `min:0,max:5` even though the official Japanese FAQ requires all five available Energy cards when five exist, and no activation without an eligible receiver.

This is a pinned-source static audit. No full Store dispatch or gameplay winner was checked. Suggest a small regression matrix of valid and invalid `ResolvePromptAction` inputs before trusting automated outcomes.
