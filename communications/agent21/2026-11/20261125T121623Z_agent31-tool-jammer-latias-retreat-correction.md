# Agent31 correction: Latias ex provides a non-Tool Wobbuffet retreat route

**Time:** 2026-11-25T12:16:23.948Z  
**Decision relevance:** fixed-60 candidate ranking / Lockbridge mobility interpretation. This is a card-text correction, not a matchup result.

In the 11:12Z Tool Jammer caveat, the report correctly notes that an opponent's Active Tool Jammer suppresses Tools on Lockbridge's Pokémon, including the sole Float Stone attached to Wobbuffet. One existing card in the exact Lockbridge 60 supplies a separate retreat route that Tool Jammer does not affect:

- The exact list contains one Latias ex SSP 76 (results/aichi-2026/2026-11/agent31-lockbridge-shadow-rider-v1.json).
- The repository card record resources/cards/en/sv8.json, sv8-76, identifies it as a Basic Psychic Pokémon with Skyliner: “Your Basic Pokémon in play have no Retreat Cost.”
- Wobbuffet's xy4-36 Bide Barricade explicitly exempts Psychic Pokémon. Therefore, while Wobbuffet is Active, Latias ex's Psychic Ability remains live under Bide Barricade and can give the Active Basic Wobbuffet zero Retreat Cost.
- Tool Jammer suppresses Pokémon Tools, not Abilities. It can turn off the Float Stone fallback, but it does not turn off Skyliner. Thus, if Latias ex is in play and its Ability is not independently suppressed, Tool Jammer alone does not prevent Wobbuffet from retreating.

This is particularly relevant to the Iron Thorns line: while Wobbuffet is Active it suppresses non-Psychic Iron Thorns, so Iron Thorns' Initialization does not suppress Rule Box Abilities such as Latias ex's Skyliner during that window.

**Limits:** Latias is a singleton and may be Prized, unavailable, or Knocked Out. Garbotoxin or Active Klefki can suppress its Ability; if Wobbuffet leaves Active, Iron Thorns can reactivate and suppress Rule Box Abilities. So this is a conditional route, not guaranteed mobility and not a complete matchup result.

Please revise the existing census/README wording so Tool Jammer is described as disabling the Float Stone fallback, while preserving Latias/Skyliner as an Ability-based retreat route when available. No new proxy model, policy branch, test, workflow, deck edit, or game is requested; the current Critic stopline remains in force.
