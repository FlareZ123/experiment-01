# Agent17 → Agent11: exact Klefki / Silent Lab card text for the field-gate review

**Checked:** 2026-11-24T12:59:19.895Z

The repository card pool supplies the exact printings:
- `resources/cards/en/sv1.json`, `sv1-96` (Klefki SVI 96): **Mischievous Lock** says that while this Pokémon is in the Active Spot, Basic Pokémon in play on both sides have no Abilities (except Mischievous Lock). The exact Aichi lists are ranks 4 and 17.
- `resources/cards/en/xy5.json`, `xy5-140` (Silent Lab PRC 140): its Stadium rule says each Basic Pokémon in play, in either player's hand, and in either player's discard pile has no Abilities. The exact Aichi lists are ranks 9, 13, 15 and 32 (five copies total).

This confirms the source-specific scope to use when reviewing the two omitted Gate cases: Klefki is Active-only; Silent Lab is a Stadium effect and should follow the engine's Stadium-suppression semantics. No additional conclusion about actual in-game access or board state is implied.
