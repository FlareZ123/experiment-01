# Pinned Twinleaf stale previous-attack state: Copycat may copy across passed turns

**Agent 7, 15 October 2026.** Status: **source-level timing defect candidate; game-state reproduction pending.** The existing [Mimikyu vs Apex Dragon flag audit](mimikyu-apex-copycat-audit.md) documents a separate too-strict gate. This report identifies a potential **too-permissive** path when the opponent did not attack on their latest turn.

## Printed condition

The bundled English Mimikyu **GRI 58** `Copycat` requires that the opposing Pokémon “used an attack that isn't a GX attack **during their last turn**.” The same wording occurs on Mimikyu TEU 112. Copying an eligible attack must therefore be disallowed after the opponent ends a turn with no attack, even if an eligible attack was used two turns earlier.

## Source path inspection, pinned Twinleaf a9905a76

- [Game state](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/state/state.ts) stores `playerLastAttack: {[playerId]: {attack, sourceCard}}`, with **no per-player turn number or expiry marker**.
- [Player turn reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/reducers/player-turn-reducer.ts) assigns `state.playerLastAttack[player.id]` when an `AttackAction` occurs. Its `PassTurnAction` branch applies `EndTurnEffect` and returns without clearing the entry.
- [Mimikyu Copycat source](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-guardians-rising/mimikyu.ts) calls `COPY_OPPONENTS_LAST_ATTACK`.
- [Generic last-attack copier](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prefabs/attack-effects.ts) looks up `state.playerLastAttack[opponent.id]`, checks only its `copycatAttack` and `gxAttack` flags, then delegates it. There is no previous-turn check.
- [Turn transition logic](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/effect-reducers/game-phase-effect.ts) advances the active player and increments `state.turn`. Its EndTurnEffect processing consults `playerLastAttack` for unrelated tag logic without expiring stale records. A global source search for `playerLastAttack` finds assignments in the player-turn reducer and copy delegation but no end-of-turn clearing of the prior attack record.

Taken together, these source paths imply the following bad behavior for an ordinary non-GX, non-copy-tagged previous attack:

1. Opponent uses attack `A`. Engine remembers `playerLastAttack[opponent.id] = A`.
2. Both players subsequently take turns, and opponent **passes** instead of attacking on their following turn. The record for `A` remains.
3. Player uses Mimikyu Copycat on their next turn. Engine sees `A` despite it **not having been used during the opponent's immediately preceding turn**, and attempts to execute it.

This timing defect could wrongly favor Mimikyu in passive/control matchups. It is logically independent of the Apex Dragon `copycatAttack` false-negative gate: together, the two bugs could pull simulated performance in opposite directions.

## Minimal regression contract

Use actual pinned Store/State, two Player objects, Mimikyu GRI active and a real attack with no `copycatAttack` or `gxAttack` flag (for example Dratini OBF's `Tail Snap`), with enough Energy for Mimikyu Copycat in an action-level variant:

1. Force a legal previous `AttackAction` by the opponent or inject the engine's own produced `playerLastAttack` record to isolate this field.
2. Complete a full **opponent turn with no attack**, ideally via `PassTurnAction`, observing any `EndTurnEffect`/turn-number transitions. Assert the engine still stores the old entry.
3. Give Mimikyu a chance to use Copycat immediately afterward. Printed-paper expected behavior: no copied effect. Current source predicts a copied attack.
4. Control: repeat with the opponent actually having used the same non-GX attack on its immediately preceding turn. Copycat must work. GX attacks must remain excluded.

A research-side compatibility fix should distinguish the immediately preceding opponent turn from older turns and preserve copied attack identity and extra-turn semantics. Avoid simply deleting the record after every end turn, because the engine currently writes its last-attack record **after** resolving the attack's EndTurnEffect. A turn-stamped attack record or a carefully scoped reducer/dispatcher hook needs its own explicit tests.

**Research relevance:** Aichi control/stall lists may regularly pass turns or force opponents to do so. False copied attacks can contaminate both attacking and defensive policy evaluation. This is a source-level analysis only; no quantitative matchup impact or full-game reproduction has yet been established.
