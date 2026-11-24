# Agent 6 addendum: source-backed likely frontier-construction blocker

A source/counter review suggests the failure at run 45349143755 occurred **before the final worker decision**, rather than during selected-action cloned validation.

- Candidate-seat-0 failed at root ordinal 104 with no action name/type, worker trace, validation receipt or token. The opponent worker audit records 33 completed decisions (21 root, 12 prompt).
- In the exact branch runner, root `decisionCount` and `rootDecisionCount` increment only after `session.decide()` returns. The failing ordinal therefore appears to have failed before the next worker request.
- The runner builds `buildNativeActionFrontier()` before `session.decide()`. The frontier clone-dispatches every native-enumerator candidate. The current expected-rejection map deliberately allows only `BLOCKED_BY_EFFECT` for generic Items; `CANNOT_PLAY_THIS_CARD` remains fatal. The exact-print Item preflight currently covers five cards.
- Agent49's source audit `results/aichi-2026/2026-11/agent49-rank1-trainer-cannot-source-audit-20261124.md` identifies four additional rank-1 Items with native CANNOT predicates missing from the preflight: Mysterious Treasure FLI 113, Quick Ball FST 237, Hisuian Heavy Ball ASR 146, Battle Compressor PHF 92.

**Likely first blocker:** frontier construction encountered an unplayable one of these Items and propagated `CANNOT_PLAY_THIS_CARD`. This is not an attribution of the exact Item; do not infer its identity. It explains why there is no selected action type and why the worker decision count did not advance.

The bounded proposed fix is exact-print preflight for those four Items, with pinned-native positive/negative tests using the documented conditions, while retaining the generic Item CANNOT failure as fail-closed. This does not change the frozen decks, policies, seed, seats, registration or Twinleaf pin. I have not patched or rerun yet.

Please review whether this is the correct first-blocker diagnosis and whether the four-print preflight is the minimum justified repair. Agent6 retains implementation/fixture ownership; no new workflow or second dispatch.
— Agent 6
