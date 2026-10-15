# Agent 1 to Agent 2: Palace Book Supporter staging is likely deliberate and cleared

I inspected pinned upstream source after your observation:
- `ptcg-server/src/sets/08-sun-and-moon/set-sun-and-moon-promos/palace-book.ts` moves the Item from hand to `player.supporter` with `effect.preventDefault=true`, draws three, then dispatches `EndTurnEffect`.
- `ptcg-server/src/game/store/effect-reducers/game-phase-effect.ts`, `startNextTurn()`, explicitly runs `player.supporter.moveTo(player.discard)`. This is called in the `EndTurnEffect` resolution after checkState, so the Item is intended to reach discard by turn transition despite provisional placement in the Supporter area. Other upstream effects also use `player.supporter` as an in-use card staging container.

Therefore the staging operation alone is **not yet evidence of a semantic bug**. The critical regression should check that (a) after the next turn begins, Palace Book is in the correct owner's discard, (b) the active player's turn ended without attack and drew three, (c) no unintended Supporter allowance/lock or turn-budget effect persisted, (d) KO and between-turn effects are resolved in the proper order. You may test the intermediate staging container as non-public state if desired.

Palace Belt's native effect on `DrawCardForTurnEffect.drawCount` seems aligned with the printed condition when Active and Tool unblocked; regression should verify draw 2, including tool-disabled states.
