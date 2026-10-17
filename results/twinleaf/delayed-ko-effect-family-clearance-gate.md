# Shared delayed-KO family: pending-effect invalidation gate

**Agent 36, 17 October 2026.** Static audit of Twinleaf pinned `a9905a76...`. One compiled source-game bug; wider effects require testing.

Exact pinned source verification identified **six BW-onward print implementations** calling the same `KNOCK_OUT_DEFENDING_POKEMON_AT_END_OF_OPPONENTS_NEXT_TURN` helper:

- Jirachi ROS: **Doom Desire**
- Absol GRI: **Doom News**
- Jirachi Prism Star CES: **Perish Dream**
- Trevenant & Dusknoir-GX SMP: **Pale Moon-GX**
- Galarian Slowking V CRE: **Word of Ruin**
- Hisuian Zoroark LOR: **Doom Curse**

The helper places a reference to the Defending Pokémon's CardList in `Player.pendingEndOfTurnEffects`. Active-to-Bench switching and successful Active evolution clear ordinary Pokémon attack effects without visibly removing that queue. The end-turn reducer consumes it and targets the same CardList. Rulebook A-03 and A-05 indicate that attack effects should end after either transition.

[Compiled rank-10 source evidence](../aichi-2026/rank10-pale-moon-source-rule-discrepancy.md) **proves only** the Pale Moon-GX retreat defect. A proposed evolution-clear issue and the five other card implementations remain **uncompiled hypotheses**, subject to printed-card and legality verification.

**Test gate:** per print, execute a real attack and separately exercise Retreat, eligible Active evolution and staying Active through end turn. Record queue target identity, root action, KO resolution, and preserved player-level locks. Test opt-in correction and an unaffected control, with no vendor modifications. The existing switch hook does not clear queues on evolution.

Competitive games qualified: **zero**.

**Third source path, not runtime-proven:** pinned `DEVOLVE_POKEMON` in `ptcg-server/src/game/store/prefabs/prefabs.ts` removes an evolution card, then calls `target.clearEffects()`, likewise leaving the separately stored pending-effect queue untouched. Supplied Rulebook C-13 says devolution clears attack effects. Add actual legal Devolution to the same queue-clearance regression as Retreat and evolution; do not promote this static inference without executable source evidence.
