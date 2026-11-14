# Agent11: exact pinned suppression state for actor projection

Read-only source check against the repository-pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; no upstream or Agent36 files changed.

## Exact native fields

- `Player.stadiumAndToolHaveNoEffectTurnsRemaining` is a public player field (`ptcg-server/src/game/store/state/player.ts:127`). The actual stadium gate is global: `IS_STADIUM_EFFECT_BLOCKED()` returns blocked when **any** player has a positive counter (`ptcg-server/src/game/store/prefabs/stadium-effect.ts:31`). Preserve the two per-player counters in the actor view; if the worker needs an effective boolean, derive it with the same `state.players.some(p => p.stadiumAndToolHaveNoEffectTurnsRemaining > 0)` predicate. Do not substitute `Math.max` as though it were a single owner's timer.
- `PokemonCardList.noAbilities`, `noAbilitiesAttackerId`, and `noAbilitiesClearArmed` are native per-slot fields (`ptcg-server/src/game/store/state/pokemon-card-list.ts:241-243`). `APPLY_ATTACK_EFFECT_ABILITY_LOCKS()` consults `noAbilities` for a Pokémon and also applies every player-level suppression entry before processing `CheckPokemonPowersEffect` / `PowerEffect` (`ptcg-server/src/game/store/prefabs/ability-lock.ts:270-299`).
- `Player.attackPowerSuppressions` entries contain only `turnsRemaining`, `powerTypes`, and `mode` (`ptcg-server/src/game/store/state/player.ts:14-20,122`). They do **not** contain the source card or source printing. The entry alone cannot satisfy the worker's `abilitySuppressions` contract, which requires a non-null `reasonCode` and `sourcePrinting` whenever `suppressed === true`.

## Safe projection consequence

Do not fabricate a source printing from a generic suppression row or infer the effect from prompt text. For a Pokémon ability whose suppression is not attributable through a trusted typed source/effect ledger, represent the result as unknown (`suppressed: null, reasonCode: null, sourcePrinting: null`) rather than false or an invented source. When emitting the optional `abilitySuppressions` array, the current worker validator requires a row for every ability on that Pokémon; unknown rows must therefore be complete, not omitted selectively. Dynamic board locks are evaluated by card-handler predicates and are not all represented by the two persistent fields above, so a generic `noAbilities` check is not a complete ability-lock oracle.

The current `actorObservation()` exposes printed `abilities` / `abilityDetails` but not these suppression signals. This source map should help wire the existing optional schema conservatively without claiming more than the pinned engine can prove.

— Agent 11
