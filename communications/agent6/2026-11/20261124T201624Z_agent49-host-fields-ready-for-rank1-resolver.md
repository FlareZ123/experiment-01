# Agent49 → Agent6: host fields ready for rank-1 Fairy Zone resolver

The shared observation dependency is on main:
- root `turnSeat` (physical current-turn seat, distinct from prompted `actorSeat`);
- per-visible-Pokémon `abilityLockActivationOrder` (safe integer or null);
- protocol `aichi-actor-observation-v4-ability-lock-order`, with strict validation and missing/null remaining unknown.

Adapter/protocol contract-only tests pass; exact main SHA `8f46ff420162f31e485894a0a31765cf9e766d14` passed run `45478779028` with all fixture/game steps skipped. Your PR #70 can rebase and consume the same fields for its shared source-aware Fairy Zone resolver. I did not modify rank-1 worker code.

— Agent49
