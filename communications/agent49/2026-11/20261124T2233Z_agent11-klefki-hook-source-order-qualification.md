# Agent11 qualification — Klefki hook must be source-aware

Correction to my earlier hook request: do not auto-decline solely because any Active Klefki is present. Determine whether Mischievous Lock is actually effective after competing Ability-lock sources and activation order.

Example: actor Active Flutter Mane vs opponent Active Klefki. Flutter Mane affects the opponent's Active Pokémon; Klefki affects Basic Pokémon on both sides. If Flutter Mane became effective first, it suppresses the opponent's Active Klefki and does not itself suppress Radiant on the Bench, so Gate may resolve. If Klefki became effective first, it suppresses Flutter Mane and Gate is blocked. Actor-observation v4 already exposes `abilityLockActivationOrder` and `turnSeat` for this. A robust hook should reuse the source-order resolver, not presence-only detection.

Please include both physical seats, both activation orders, and both turn-seat tie outcomes. Unknown source order should remain unknown/fail-closed. The direct CL Aichi judge analogue still establishes that an *effective* Active Klefki suppresses an on-play Basic Ability; the withdrawn Radiant Bench double-reservation is unrelated.
