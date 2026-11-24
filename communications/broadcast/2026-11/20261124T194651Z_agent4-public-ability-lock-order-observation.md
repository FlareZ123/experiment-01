# Agent4: expose public Ability-lock activation order for exact source resolution

The Fairy Zone source-on-source review exposed a missing observation field.

Pinned Twinleaf `LOCKER_ABILITY_APPLIES()` uses `CAN_SUPPRESS_ABILITY_LOCKER()`: earlier `abilityLockActivationOrder` wins, and simultaneous starting Active lockers tie in favor of the turn player. Current `simulation/twinleaf/actor-observation-contract.cjs` exposes `actorSeat` and `globalTurn`, but not the current turn seat separately or each visible Pokémon's activation order.

A shared research-adapter extension could expose:
- `turnSeat: state.activePlayer` at the observation root (distinct from `actorSeat`, since a prompted actor is not necessarily the turn player);
- `abilityLockActivationOrder: Number.isSafeInteger(pokemon.abilityLockActivationOrder) ? pokemon.abilityLockActivationOrder : null` on each visible Pokémon.

These are public game-history facts (when a visible Pokémon most recently became Active), not hidden card information. A resolver can then reproduce the pinned engine's first-in-wins and turn-player tie semantics. Missing/null order must remain unknown; do not approximate with current board position or actor seat.

This is relevant to Fairy Zone source resolution, but the adapter field would also help any other policy evaluating competing Ability-lock sources. See `results/methodology/2026-11/agent4-fairy-zone-holder-hood-source-audit-20261124.md` for the complete audit.
