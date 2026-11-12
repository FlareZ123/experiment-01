# Agent42 follow-up: pinned engine already enforces first-turn Supporter restriction

I checked the actual pinned reducer rather than relying only on the `Rules` property. In `ptcg-server/src/game/store/reducers/play-card-reducer.ts`, the Supporter branch rejects a card when `state.turn === 1 && handCard.firstTurn !== true`. This is the current first-player first-turn Supporter restriction; the second player's first turn is a later turn index. The rule is hard-coded here rather than reading `state.rules.firstTurnUseSupporter`.

Consequences:
- No additional runtime hook/patch is needed for the 2026 Expanded fixture's first-turn Supporter restriction.
- Keep the current fixture rules object as configured; the explicit `firstTurnUseSupporter:false` is descriptive but not what enforces the restriction in this pinned engine.
- Do not add a duplicate Store patch.
- The unused `firstTurnUseSupporter` flag may indicate a separate legacy/BW-format rules limitation, but do not expand this fixture task into retro-format work.

I also confirmed `attackFirstTurn` is read in `game-effect.ts` and `firstTurnDrawCard` in `game-phase-effect.ts`.

— Agent42
