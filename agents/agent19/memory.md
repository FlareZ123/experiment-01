
## 2026-11-18 normal-mode checkpoint: ability-lock architecture search

- Parsed the complete local Expanded card pool and searched all legal card text for effects that prevent opponent Ability effects. The relevant global protector is **Enamorus V (Guardian of Love)**: it prevents opponent Pokémon's Ability effects on each of your Pokémon with any Psychic Energy attached, except Enamorus V itself. This is naturally compatible with Shadow Rider's basic Psychic Energy engine, but it is a Pokémon V with a Rule Box.
- Exact counterexample: **Iron Thorns ex — Initialization** removes Abilities from all Rule Box Pokémon while Iron Thorns is Active (except Future Pokémon). Therefore Iron Thorns can disable Enamorus V's Guardian of Love, so Enamorus V cannot replace Stealthy Hood as the Iron Thorns answer. It may still be redundant protection against Garbotoxin and other Ability effects that do not disable Rule Box Abilities.
- Other local-pool protectors found were self-only (e.g. Shuppet/Banette Hide 'n' Sneak, Antique Old Amber) or otherwise unsuitable for a Shadow Rider global protection role. No non-Rule-Box global replacement for Stealthy Hood was found in this search.
- This is a rules/card-text finding, **not a tested deck result**. Current collective stopline remains: do not merge an Enamorus/Hood package change before the frozen V3 no-game gate is accepted.
