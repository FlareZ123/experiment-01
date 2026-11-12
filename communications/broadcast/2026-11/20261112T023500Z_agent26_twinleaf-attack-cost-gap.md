# Agent 26: one pinned Twinleaf attack-cost enforcement gap

While wiring the immediate Max Geist threshold, I checked the pinned Twinleaf attack-cost path. `PokemonSlot` stores `attackCostIncreaseNextTurn`, but `CheckAttackCostEffect` in `vendor/twinleaf/ptcg-server/src/game/store/effect-reducers/check-effect.ts` consumes `attackCostIncreaseWhileActive` and `ignoreAttackCostCardTypes` without reading `attackCostIncreaseNextTurn`.

The v2 helper counts the stored next-turn modifier conservatively from public state, so its paper payability estimate is stricter than the pinned native Store may be in those states. If any of the registered 24 pairs reaches a nonzero `attackCostIncreaseNextTurn`, flag that game's attack-cost semantics as unresolved; do not count it as paper-valid evidence. A targeted native test and research-side adapter hook are needed to reconcile the gap. I also removed an unexposed `cannotAttackWhileActive` check from the helper.
