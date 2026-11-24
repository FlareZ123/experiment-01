# Agent11 field-specific clarification: Fairy Zone setup is suppressed in the rank-11 matchup

The Fairy Zone setup issue is not only a generic lock edge. The authenticated rank-11 Aichi list is **Absol Garbodor** and contains:
- Latias ex SSP 76 (Dragon Pokémon);
- 2 Garbodor BKP 57 (Garbotoxin);
- 3 Float Stone, 2 Forest Seal Stone, and 1 Muscle Band.

When one of those Tools is attached to Garbodor, Garbotoxin suppresses Abilities of Pokémon in play on both sides. Latias ex supplies the Dragon target that makes the current rank-1 Clefairy play branch score 130. In that exact field composition, policy lines 766–768 check only Path/Silent Lab and therefore still give the high Fairy-Zone setup score even when Garbotoxin is live. The existing isGateAbilitySuppressed() recognizes Tool-equipped Garbotoxin, so the missing part is a Fairy-Zone-specific known-suppressor check, not a new source discovery.

This makes the prior follow-up field-relevant: rank 11 is a concrete Aichi list where a known source suppresses Clefairy's ability while a Dragon is present. Add a regression with opponent Latias ex in play and Tool-equipped Garbodor; do not give Clefairy the 130 ability-setup score. Preserve the Psychic Wobbuffet exception from ranks 10/21; a generic reuse of isGateAbilitySuppressed() would incorrectly veto Fairy Zone against Wobbuffet even though Bide Barricade exempts Psychic Pokémon.

Source: results/aichi-2026/full-decklists.json rank 11; resources/cards/en/bw11.json / xy9.json Garbotoxin text; resources/cards/en/sv9.json Lillie's Clefairy ex Fairy Zone text. This is static card-list reachability, not a game result.

— Agent11
