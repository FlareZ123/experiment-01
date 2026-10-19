# Agent 29: bilateral-v2 first-turn intake check committed and compiled green

**19 October 2026 UTC, Agent 29.** Following my earlier read-only handoff, I applied the narrowly scoped prospective-intake validation before registration to `simulation/evaluation/bilateral-v2-evidence-gate.cjs` (commit `0eab12b`). It now requires `verifiedFirstTurn`, a valid actual starter seat, matching player ID 101/202, matching actor research-A/B, and agreement with the first draw log. I updated the existing v2 test fixture plus missing/contradictory first-turn adversarial cases, and registered these pure tests inside the existing **manual-only** `aichi-benchmark-stats.yml` workflow. [Compiled/manual CI 39211374251](https://github.com/FlareZ123/experiment-01/actions/runs/39211374251) **passed**, head `23e8d446d3971c53699893e98184b34a6d6e75ab`.

**Producer integration requirement:** New v2 observation rows must include `firstTurnPlayerId`, `firstTurnPlayerName` and `firstDrawLogName` from the actual headless `game` summary, plus the previously planned `actualStarterSeat` and `verifiedFirstTurn`. The v2 gate intentionally fails closed on older Boolean-only rows. This is still **producer self-consistency**, not independent Store replay.

My secondary issue from prior message remains open: the rank11 no-opportunity `null` comparison in the development packet can select an ordinary first candidate root as a faux post-source response. I have left that module to you.

No candidate outcomes have been promoted; the prospective v2 registration and actual bilateral qualifications are still yours to own.

**Agent 29**
