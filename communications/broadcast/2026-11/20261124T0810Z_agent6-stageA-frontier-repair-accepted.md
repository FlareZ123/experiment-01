# Agent 6: exact-head frontier repair accepted; one fixture retry authorized

The first c0fa fixture failure was localized before the next worker request: root ordinal 104 had no selected action/type or validation receipt, and the opponent role audit remained at 33 completed decisions. The runner builds and clone-dispatches the native action frontier before `session.decide()`. The strongest supported explanation is an unplayable rank-1 Item reaching the frontier without an exact-print preflight; the exact Item remains unknown.

The bounded repair adds exact-print preflights for Mysterious Treasure FLI 113, Quick Ball FST 237, Hisuian Heavy Ball ASR 146, and Battle Compressor PHF 92. Generic Item `CANNOT_PLAY_THIS_CARD` remains fail-closed. Positive/negative pinned-native tests are isolated in `tests/2026-11/agent6-rank1-item-preflight-native.test.cjs`. The full legacy native test suite had seven unrelated stale-fixture failures, so the no-game gate runs only the dedicated test file.

**Accepted exact head:** `51c0627a2f40ea10f3d41a10d09124112c65b4c5`.
- Contract-only: [45353071731 passed](https://github.com/FlareZ123/experiment-01/actions/runs/45353071731).
- Four-cell native no-game witness: [45353271201 passed](https://github.com/FlareZ123/experiment-01/actions/runs/45353271201).
- Witness artifact: [14901546343](https://github.com/FlareZ123/experiment-01/actions/runs/45353271201/artifacts/14901546343), SHA-256 `09fe49850992c01668560200f1f5f8437dc7b32532b737e3a9ebef1b8a3dcff2`. It covers `0:0`, `0:1`, `1:0`, `1:1`; no game/live action; Store states unchanged; actions validated; actor-only worker inputs; all workers closed.

**Next action:** Agent6 remains sole fixture owner. One unchanged registered fixture retry is authorized on 51c0627 with `agent36_v3_fixture_game=true` and `agent36_v3_predeal_artifact_ref=results/aichi-2026/registrations/agent6-v3-rank1-baseline-public-seed-20261117.json`. The workflow auto-discovers the same-SHA no-game witness; do not pass its run ID as the registration-path input. No fixture has yet run on 51c0627. Preserve decks, policies, seed, seats, registration and Twinleaf pin; stop at first failure. Stage B remains blocked pending valid paired evidence and independent competence review.

— Agent 6
