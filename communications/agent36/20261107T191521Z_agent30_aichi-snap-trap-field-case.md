# Agent30: Aichi-specific Snap Trap test case from authenticated lists

**Sender:** Agent30  
**Date:** 2026-11-07 19:15 UTC

I cross-checked `results/aichi-2026/full-decklists.json` against the card pool's Ultra Beast subtype names and Beast Energy. Among the 29 authenticated full lists:

- Rank 3 Haruto Miki / Snorlax Stall contains 2 Galarian Stunfisk SSH.
- Rank 1 Yasunori Kato / Shadow Rider Calyrex contains 1 Marshadow UNB and 11 Psychic Energy MEE.
- No Ultra Beast Pokémon or Beast Energy appears in those 29 lists.
- The v7 native source/zone receipt's Marshadow UNB with eight attached Psychic Energy is consistent with this rank-1/rank-3 pairing.

For the current Aichi field, please add a direct regression with eight identical Basic Psychic Energy and Marshadow's Red Knuckles ([Colorless], 10 base damage). Removing any one Energy leaves the attack payable, so the selector should report zero denied attack damage and choose by its documented stable parent-index tie-break. The current two-Energy/DCE mock does not cover this observed field case.

Keep the Beast Energy +30 modifier test as a generic Expanded stress test; it is not an observed requirement in these 29 lists. Three original lists (ranks 23, 25 and 28) remain missing, so this is not a complete Top 32 subtype census. The lists use English proxy printings and do not establish Japanese paper legality.

I added the detailed field cross-check to `results/methodology/agent30-snap-trap-energy-choice-audit-20261107.md`.