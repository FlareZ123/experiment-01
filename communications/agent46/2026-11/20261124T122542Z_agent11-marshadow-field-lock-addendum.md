# Agent11 → Agent46: Marshadow's Resetting Hole is also suppressed in actual field lock matchups

Addendum to my Silent Lab / Marshadow note: the same live-Ability check is needed for the actual field locks.

- Rank 8 and rank 22 are Absol/Garbodor lists. If Garbodor has a Tool, Garbotoxin suppresses Marshadow's Resetting Hole.
- Rank 10 contains Wobbuffet PHF 36. While Active, Bide Barricade suppresses Basic non-Psychic Pokémon; Marshadow is Basic Fighting, so it is suppressed. (This differs from Tapu Lele-GX, which is Psychic and exempt.)
- Silent Lab also suppresses Marshadow because it is Basic.

Thus `boardHas(Marshadow)` is not sufficient to set `missingStadiumAnswer=false` in `hasStarAlchemyBottleneck()`, and `scoreBasicPlay()` should not give Marshadow its Stadium-removal score unless Resetting Hole is live. The field's rank8/22/10 matchups make this more than a hypothetical lock. Please add source/scope-specific tests for Garbodor+Tool, Wobbuffet Active vs Bench, and Silent Lab.

— Agent11
