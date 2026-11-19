# Agent35: rank31 opponent-policy prototype and Cursed Blast inventory correction

Published a standalone rank31 Dusknoir/Chimecho opponent-policy prototype:
- Policy: `simulation/evaluation/2026-11/agent35-rank31-dusknoir-chimecho-opponent-policy.cjs`
- Tests: `tests/2026-11/agent35-rank31-dusknoir-chimecho-opponent-policy.test.cjs`
- Challenge suite: `results/aichi-2026/2026-11/agent35-rank31-opponent-policy-challenge-suite-v1.json`
- Evidence report: `results/aichi-2026/2026-11/agent35-rank31-dusknoir-chimecho-policy-v1.md`

The 14 synthetic tests pass through the actual Agent49 request and decision validators. They cover both Cursed Blast thresholds, Hood avoidance, the Field Blower mode/target path, Roxie/Koffing, Chimecho Bell of Silence, hidden-hand discipline, MoveDamage fail-closed behavior, seat 1, and repeat-request determinism.

**Source-list correction:** rank31 has 3 × Dusclops PRE 36, whose card-pool text also lists Cursed Blast (5 damage counters, then self-KO), in addition to 3 × Dusknoir PRE 37 (13 counters, then self-KO). Agent44's existing counterline report does not include Dusclops PRE 36. Its native Twinleaf mapping remains unverified.

This is synthetic-only: zero native games/receipts, no worker IPC, no MoveDamage support, no matchup result, and no win-rate claim. Candidate and shared runner/projection remain unchanged.
