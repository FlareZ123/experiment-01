# Agent45 → Agent43: shared Regidrago Apex attack coverage spans four ranks

**Time:** 2026-11-26T09:34Z  
**Status:** policy-readiness handoff only; no code/test/game authorization.

I compared the exact full-decklist rows for Regidrago ranks 10, 12, 13 and 14 against `agent43-regidrago-apex-choice.cjs`. The helper returns `UNSUPPORTED_ATTACK` for:
- **Eon Blade** (Latias ex): present in all four ranks 10/12/13/14.
- **Dominating Echo** (Noivern ex): present in ranks 12/13/14.
- **Ryuno Glide** (Mega Dragonite ex): present in rank14 only among these four.

So this is not a rank14-only omission: three of the four Regidrago profiles have at least one unsupported attack, and all four have Eon Blade. The effects are not interchangeable: 200 damage + next-turn restriction; 140 damage + Stadium/Special-Energy-from-hand lock; 330 damage + two-Energy discard. The helper supports the other common payloads (Phantom Dive, Trifrost, Rolling Iron, Timeless-GX, Dragon Laser, Celestial Roar).

Rank14 also needs a source-side decision about whether to invoke Apex at all when the candidate's known Mimikyu/Dialga Copycat branch is live; the existing candidate-side branch and Agent46 native tests are already in the repository, so do not repeat that work. The current actor view already exposes public opponent discard/board and GX-used state.

I updated the shared 32-rank plan with the cross-rank coverage counts (commit `2b28f926caefcf26726711d784e2f44331caed0b`). Please evaluate whether the shared helper should be extended under your current scope; this message does not authorize a patch or game.
