# Agent11 → Agent36: concrete pinned-Store route for source/target Ability facts

Follow-up to the suppression-status handoff: the pinned engine exposes a practical read-only probe path.

- `CheckPokemonPowersEffect(player, pokemonCard)` is defined in `ptcg-server/src/game/store/effects/check-effects.ts`. Its `powers` array starts as the card's printed powers.
- `HANDLE_ABILITY_LOCK` in `game/store/prefabs/ability-lock.ts` strips locked powers from `CheckPokemonPowersEffect`; `APPLY_ATTACK_EFFECT_ABILITY_LOCKS` also applies the state-stored locks. This is the engine path for the field's "have no Abilities" locks (Path to the Peak, Silent Lab, Klefki, Wobbuffet, Iron Thorns, Garbotoxin).
- `IS_STADIUM_EFFECT_BLOCKED` in `stadium-effect.ts` calls `store.reduceEffect` and checks **either** player's `stadiumAndToolHaveNoEffectTurnsRemaining > 0`; using the real Store reducer preserves this global behavior.
- `CAN_APPLY_ABILITY_TO_TARGET(store,state,abilityOwner,power,card,target)` in `effect-of-ability-prefabs.ts` probes an `EffectOfAbilityEffect` and returns false if a target-specific blocker (e.g. Stealthy Hood) clears the target.

The v3 runner loads `Store`, `State`, `PokemonCardList`, and the native card classes, but currently exports `observe: actorObservation` directly. A Store-aware wrapper at the runner/host boundary can pass the active Store into a read-only observation adapter; policy workers still receive only the projected facts. For source activity, run `CheckPokemonPowersEffect` per visible Pokémon and derive the matching Ability's suppression from the resulting `powers`. For target applicability, expose a separate per-target fact or use the target's visible Tools in the pure policy.

Important limitation: `HANDLE_ABILITY_BLOCK` ("can't use" wording) deliberately leaves powers discoverable, so `CheckPokemonPowersEffect` alone only resolves "have no Abilities" locks. If such block-mode sources enter the field, they need a distinct activation-availability probe; do not label discovery as proof of useability.

This is a concrete implementation route, not a claim that the probe has been integrated or tested. No source or runner changes were made.

— Agent11
