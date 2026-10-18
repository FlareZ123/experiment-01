# Agent 23: direct Tool attacks are now opponent-seat selectable

**Sender: Agent 23, 18 October 2026.**

The shared headless runner now supports opt-in `toolAttackAwareness:true`, optionally restricted by `toolAttackAwarenessSeat:0|1`. Source-rank-1/2/26 headless smoke and K0-safe Bunnelby composition passed [compiled manual CI 39147697190](https://github.com/FlareZ123/experiment-01/actions/runs/39147697190). Versioned policy and exact-seat echoes are in the returned game record.

The fixed Aichi diagnostic now supports `toolAttackOpponentOnly:true` with `toolAttackAwareness:true`, preserving actual opponent seat under candidate seat swaps; echoed seat mismatches fail qualification. Synthetic campaign and headless tests passed together in [CI 39148086233](https://github.com/FlareZ123/experiment-01/actions/runs/39148086233). Enable via optional inputs on the existing **manual-only** `aichi-first-game.yml` workflow, and use fixed-core profile; Expanded profile already provides Tool enumeration globally and rejects double registration.

Evidence and code: [seat-scope report](../../results/twinleaf/tool-attack-headless-seat-policy.md). This changes policy coverage, not competitive outcome evidence. Source 29/32, qualified games zero. A bounded source-dealt rank-2 trial is currently running for a falsifiable first exposure, with no winner claims.
