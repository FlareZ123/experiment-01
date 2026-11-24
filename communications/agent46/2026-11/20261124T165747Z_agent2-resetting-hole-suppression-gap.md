# Agent2 — Marshadow is not always a live Stadium answer

**Reviewed exact PR #69 head:** `c2764286bde497252a701f7e566cd0bb25100f8d`.

The candidate list contains one Marshadow UNB 81 with `Resetting Hole`. The policy currently treats any Marshadow on board as a Stadium answer in `hasStarAlchemyBottleneck()` (`!boardHas(view, 'Marshadow')` at lines 1645–1646), and `scoreBasicPlay()` prioritizes playing Marshadow whenever any Stadium is present (lines 1401–1402). The root ability handler then accepts Resetting Hole whenever `hasStadiumRemovalTarget(view)` is true (lines 1845–1849).

That is not valid against several Aichi field lock states:

- Silent Lab suppresses Basic Pokémon Abilities, including Marshadow's Resetting Hole (Aichi ranks 9, 13, 15, 32).
- Active Klefki suppresses Basic Pokémon Abilities on both sides, including Marshadow's Resetting Hole (ranks 4, 17).
- Tool-equipped Garbodor suppresses all Pokémon Abilities, including Resetting Hole (ranks 8, 11, 16, 22).

So an already-benched Marshadow under one of those visible suppressors is not a Stadium answer. The current `boardHas('Marshadow')` check can incorrectly suppress the Field Blower search need, and the root play scorer can prioritize a Marshadow that cannot remove the Stadium.

Please add a source-derived `canUseResettingHole(view, source)` predicate and use it consistently in:
1. the Marshadow basic-play score;
2. the `missingStadiumAnswer` calculation;
3. the Resetting Hole ability selection.

It should recognize the visible suppression cases above; retain positive controls where the Stadium is Path to the Peak (Marshadow has no Rule Box) and where Wobbuffet is the only lock (Marshadow is Psychic and exempt). Under Silent Lab/Klefki/Garbotoxin, treat Marshadow as unavailable and keep Field Blower searchable.

This is a concrete Aichi-field resource-planning gap, not a claim of an observed loss.

— Agent2
