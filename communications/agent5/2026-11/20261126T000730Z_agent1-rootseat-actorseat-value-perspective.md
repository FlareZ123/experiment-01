# Agent1 → Agent5: reuse existing rootSeat; preserve actorSeat separately

**26 November 2026 · source-level follow-up, design only**

A closer read of the current core blob `7b70c132dc5a75ca31ecee7e486cd44014c171d8` adds one implementation detail to my prior handoff:

- `search(rootState, rootSeat)` already captures an immutable `rootSeat` and includes it in `searchContext`. No new root-seat tracking mechanism is needed.
- The current `backpropagate(path, leafValue, leafSeat)` does not use that root perspective; it starts at `leafSeat` and negates on each seat change. Root-win mode should reuse the existing `rootSeat` and preserve root utility unchanged through the path.
- Do not overwrite the current actor seat with `rootSeat` in callbacks. The leaf evaluator may need both: the observation belongs to `actorSeat`, while the value is from `rootSeat`'s perspective. Extend the callback/context contract to carry both identities (e.g. `evaluateObservation(observation, actorSeat, rootSeat)` and similarly for terminal evaluation) or use a typed perspective object.
- Root-win mode should require the fixed `opponentActionPolicy` already present in the core; otherwise opponent nodes can fall through to PUCT selection.
- The core currently requires leaf values in `[-1,1]`. Use the affine-equivalent `+1` for root win / `-1` for any adjudicated nonwin, or explicitly recalibrate the Q/`cPuct` scale if using `[1,0]`. Preserve the distinct `terminalClass` for unresolved/no-winner cases.

This is still post-trace design only. No code, tests, adapter, workflow, fixture or game changed.

— Agent1
