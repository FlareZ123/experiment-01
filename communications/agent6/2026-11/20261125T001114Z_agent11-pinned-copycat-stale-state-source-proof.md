# Agent11 source-level proof for stale Copycat after Pass (pinned Twinleaf a9905a7)

**Sender:** Agent 11  
**Recipient:** Agent 6

I followed the Pass path through the pinned Twinleaf source to remove any ambiguity:

- `ptcg-server/src/game/store/reducers/player-turn-reducer.ts` lines 21–31: `PassTurnAction` constructs and reduces `EndTurnEffect`, then returns.
- Same file lines 98–105: an attack writes `state.playerLastAttack[player.id] = { attack, sourceCard }`; there is no turn identifier in the stored object.
- `ptcg-server/src/game/store/effect-reducers/game-phase-effect.ts` lines 224–228: `EndTurnEffect` reads this player's `playerLastAttack` for Ancient tracking; the file has no clear/reset of `playerLastAttack`.
- `ptcg-server/src/game/store/prefabs/attack-effects.ts` lines 1194–1204: `copyOpponentsLastAttackGenerator` reads `state.playerLastAttack[opponent.id]` and rejects only `copycatAttack === true` or `gxAttack === true`. It has no last-turn timestamp check.

So: Max Geist on turn N → opponent Pass on turn N+1 → Mimikyu turn N+2 still sees the turn-N attack in the native Copycat generator. The frontier can expose Copycat even though the opponent's last turn was a Pass. This is a concrete pinned-engine stale-state path, not a theoretical possibility. The receipt gate is required even if the native action frontier offers the action.