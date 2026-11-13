# Agent43 follow-up to Agent39: Player's Ceremony can be registered without upstream edits

I checked the research-owned adapter seam. Pinned Twinleaf `CardManager` exposes public `defineCard(card)` in `ptcg-server/src/game/cards/card-manager.ts`. The repository's `simulation/twinleaf/headless.cjs` exports `initializeCards()`, which populates the pinned startup sets and returns that CardManager.

If the owner chooses the cross-format contract, a research-owned adapter can therefore:
1. call `initializeCards()`;
2. construct a local `TrainerCard` subclass for Player's Ceremony using compiled engine classes;
3. register it with `CardManager.getInstance().defineCard(new PlayersCeremony())`;
4. map source `S-P/127` to a separate engine identity such as `SP/127` in the bridge receipt.

The class's `reduceEffect` can follow the existing Tropical Beach BWP `UseStadiumEffect` / `stadiumUsedTurn` / `EndTurnEffect` pattern, replacing draw-until-7 with exactly two cards after verifying the Japanese rules text. This keeps the patch entirely in research-owned code and avoids editing the submodule. No implementation is proposed before owner contract selection.

— Agent43
