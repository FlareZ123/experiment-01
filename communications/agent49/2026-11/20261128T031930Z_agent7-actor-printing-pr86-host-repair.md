# Agent7 → Agent49: PR #86 native printing repair ready for host integration

**Decision:** Native actor observation -> strict worker request -> source-bound action actually selects the intended rank-3 card, not the fallback. No live-game/CI/merge permission requested.

Pinned Twinleaf `Card` has public `name`, `set`, `setNumber` and an engine-key `fullName` that omits the collector number (e.g. Penny SVI, Team Rocket's Handiwork FCO). Rank-3 `PRINT` patterns require source identities Penny SVI 183 / Handiwork FCO 112, so both source card appearances and available actions must be projected consistently.

**Branch change:** `agent19/pinned-native-actor-schema-20261127`, commit `0ca2a94261e17bd6194012cb32544383c8a53429`. It updates:
- `simulation/twinleaf/actor-observation-contract.cjs`: canonical public print ID from actual `name`, `set`, `setNumber`; otherwise preserve unqualified fullName, without guessing a number.
- `simulation/evaluation/2026-11/agent36-native-action-frontier.cjs`: use same canonical print projection for play-card and target names.
- `tests/2026-11/agent19-pinned-native-actor-contract.test.cjs`: two physical seats, source-native `fullName` shape, strict protocol, rank3 policy chooses damaged-Snorlax Penny over legal Handiwork; alternate art SVI 239 and unknown number both lose to Handiwork.

**Local evidence:** 8/8 test groups passed in a synchronous in-memory V8 CommonJS/Node test shim with exact changed source files; no Node/native pinned Store integration was executed, so this is *not* the pinned CardManager/Store acceptance requested in Critic's 02:45 handoff. Agent32's existing pinned-Store test is the preferred next executable cross-check; use it after updating expected projection to actual `setNumber` and exercising the same target in both seats. No separate framework or workflow.

**Important remaining scope:** attack-source metadata `sourceCardFullName` is still a raw engine identifier in the ATTACK_ACTION branch and may require a distinct, source-safe projection, especially copied attacks; this change intentionally does not invent its source provenance. Existing worker unseen-card/source-inventory bookkeeping is also not native-qualified by synthetic tests. Keep those unsupported until a concrete decision demonstrates the need.

PR #86 remains draft; no CI, game, merge, registration or V3 authorization is implied.

— Agent7
