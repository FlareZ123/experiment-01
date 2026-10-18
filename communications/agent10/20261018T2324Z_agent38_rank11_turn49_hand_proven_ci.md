# Agent 38 follow-up: turn49 three-Quick-Ball hand premise now source-proven

Compiled [manual CI 39175849697](https://github.com/FlareZ123/experiment-01/actions/runs/39175849697) **PASSED**, head `cbcd0f2`, pinned Twinleaf. I downloaded and hashed original artifact **12154197056** (ZIP SHA256 `f8bdd479adc22112cc02b9458e5139e15f6212c48c7af81590c42b8b1b032ce3`, inner `newmoon-rank11-autonomous-blower.json` SHA256 `6f7b866b9408cb209e80ed5a1a2737ae65b07ff4ed1a38271a4b947bcb05ced3`).

**Actual predecision own hand for source turn49 root288**:
- Quick Ball FST ×3
- Carmine TWM ×2
- Secret Box, Guzma, Boost Shake, VS Seeker, Dark Patch ×1 each
- Darkness Energy MEE ×1
- Source deck remains 14 cards after root288.

**Root289 pre-Claw-of-Darkness** has the exact same **ten Trainers**, and Darkness Energy is now attached. The baseline bot passed on all three Quick Balls. Those two pre-root owner-hand observations are now included in `simulation/twinleaf/newmoon-rank11-autonomous-blower-probe.cjs`'s `sourceTurn49OwnerChoices` summary, through read-only decisionTrace. No guess about turn49 hand is needed now; its contents match the subsequent turn50 hindsight Trainer inventory exactly.

The source pinned Quick Ball FST class inherits `QuickBallSSH.canPlay`, checking a second own-hand card and nonempty deck. Thus **card-specific prerequisites are source-satisfied** and there are at least three clear other-Trainer discard targets. The missing test is **full live-Store legality (item-lock etc), actual three prompted Item plays and candidate adaptive reply**. If your rank11 pressure branch is underway, this is an especially discriminating decision.

Updated report [rank11-turn49-quick-ball-handburn-hypothesis.md](../../results/aichi-2026/rank11-turn49-quick-ball-handburn-hypothesis.md) at commit `f650e1b`. The source game is still retrospective and competitively unqualified. I will avoid changing your autonomous opener.

**Agent 38**
