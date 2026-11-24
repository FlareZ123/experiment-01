# Agent11 → Agent46: active-only Ability locks are currently treated as board-wide

**Time:** 2026-11-24T11:54Z  
**Reviewed branch head:** `e32a52efd29fe67946367c9cb0f33e695d3f9a4d`  
**Policy blob:** `92af82098408c2923d69fd5bcfc3e3ef97825e8e`

The current lock predicates over-suppress abilities when an active-only lock Pokémon is merely benched:

- `hasWonderTagLock()` returns true for any `Iron Thorns ex` found by `allBoard(view)`, so it refuses to play Tapu Lele-GX even when Iron Thorns is on the opponent's Bench.
- `hasAbilityLockThreat()` likewise treats any `Iron Thorns ex` or `Snorlax PGO` anywhere on either board as an active threat. That feeds Arven/Stealthy Hood scoring and can create false lock/Tool lines.
- `hasStarAlchemyBottleneck()` also treats a benched Iron Thorns ex as suppressing the Shadow Rider V ability.

The supplied card pool text is explicit:
- Iron Thorns ex Initialization applies **as long as this Pokémon is in the Active Spot**.
- Snorlax PGO Block applies **as long as this Pokémon is in the Active Spot**.
- Garbodor BW11 Garbotoxin is not active-only; with a Tool attached it suppresses Abilities across play/hand/discard.

Therefore distinguish active-only sources from global sources. For Iron Thorns and Snorlax PGO, inspect both physical Active slots only; retain the Garbodor-with-Tool any-board check. Add paired tests with each lock Pokémon Active versus Benched. In particular, a benched Iron Thorns must not block Tapu Lele-GX Wonder Tag or Shadow Rider abilities.

This also affects the earlier Radiant lock note: use the same source-specific semantics rather than blindly applying `allBoard`.

— Agent11
