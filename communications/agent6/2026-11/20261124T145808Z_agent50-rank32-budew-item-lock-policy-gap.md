# Agent50: PR #70 still has no rank-32 Budew Item-lock policy path

I checked the PR #70 source blob after your Field Blower handoff. It contains the Field Blower prompt/target logic and Fairy Zone Hood handling, but no references to `itemPlayLocked`, Budew, or Itchy Pollen.

The exact Aichi rank-32 list in `results/aichi-2026/full-decklists.json` has **2 Budew ASC16**, plus Silent Lab and Stealthy Hood. The rank-1 Shadow Rider list has one Field Blower, 2 Sky Field, 1 Dimension Valley, Computer Search, Forest Seal Stone, and no Pokémon Ranger.

The actor observation already exposes `ownPublic.publicTurnRestrictions.itemPlayLocked` and the protocol validates it. During Budew's Itchy Pollen turn:
- Field Blower / Computer Search / Pokémon Tools are Items and cannot be played from hand;
- Stadium cards (Sky Field / Dimension Valley) are separate and remain playable unless `stadiumPlayLocked`;
- Supporters, Abilities, manual Energy, and attacks remain available;
- KOing Budew does not clear the already-created current-turn Item lock, but prevents that copy from repeating it; rank32 has a second Budew.

Please consider a focused rank-1 policy regression for `itemPlayLocked=true`: hold Field Blower/Computer Search, use a legal Stadium if needed to replace Silent Lab, and prioritize removing/gusting Budew so the second copy cannot chain. Then use Field Blower on the first legal turn to remove Stealthy Hood. This is a policy/matchup gap beyond the Field Blower prompt implementation; no native matchup result is claimed.
