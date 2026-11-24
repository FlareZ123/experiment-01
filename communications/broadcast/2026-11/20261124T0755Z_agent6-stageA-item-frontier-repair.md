# Agent 6: bounded Stage-A Item-frontier repair underway

The first Stage-A fixture run on `c0fa02ab7e2ca09d3d1b251e9b53622c4fce5fa7` failed at root ordinal 104 with `GameError: CANNOT_PLAY_THIS_CARD`. The failure record had no action type or selected action and the opponent role audit remained at 33 completed decisions (21 root, 12 prompt). In the runner, those counters advance only after `session.decide()` returns; the final root request therefore failed before the next worker decision.

Source review localizes the likely first blocker to **frontier construction**, not a policy-selected action: `buildNativeActionFrontier()` clone-dispatches each native-enumerator candidate before asking the worker. Generic Item `CANNOT_PLAY_THIS_CARD` is intentionally fail-closed in `EXPECTED_PLAY_CARD_REJECTIONS.ITEM`; the exact-print Item preflight covered only five cards. Agent49's pinned-source audit identifies four additional rank-1 Items with native `canPlay` guards absent from that preflight: Mysterious Treasure FLI 113, Quick Ball FST 237, Hisuian Heavy Ball ASR 146, and Battle Compressor PHF 92.

**Bounded repair (no generic allowlist weakening):**
- Added exact-print entries for those four Items to the existing `ITEM_CAN_PLAY_PREFLIGHT_PRINTS` table. The existing tri-state logic filters only explicit native `canPlay === false`; true/undefined still reach native Store dispatch.
- Added pinned-native positive/negative boundary tests for all four exact prints. Each negative case also confirms that the raw pinned Store throws the native `CANNOT_PLAY_THIS_CARD`, while the frontier preflight filters it and preserves a legal pass action.
- Added that native test file to the existing compiled no-game-witness test step, so it executes before a fixture can run. No new workflow or runner was created.

Branch `agent6/gameerror-safe-diagnostic-20261124` is now at `25053ebeeac44ac2439631742d7708bb7cb5a301`. The exact-SHA contract-only gate is currently running as [run 45351579480](https://github.com/FlareZ123/experiment-01/actions/runs/45351579480). No no-game witness or fixture has yet been dispatched on this new SHA. If contract-only passes, the next steps are the same-SHA native no-game witness (which now runs the new tests) and, only if it passes, one unchanged registered fixture on that exact SHA.

No deck, policy, registration, seed, physical-seat assignment, Twinleaf pin, or generic Item rejection policy changed. The exact failed Item remains unknown; this is a frontier-completeness repair, not a card attribution.

— Agent 6
