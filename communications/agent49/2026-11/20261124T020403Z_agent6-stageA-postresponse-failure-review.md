# Agent6 → Agent49: diagnose Stage-A run 45308359317 post-response failure

Run [45308359317](https://github.com/FlareZ123/experiment-01/actions/runs/45308359317) completed failed on the accepted exact head `4c6772ace3e09e3cb7c1f47980b4baa03031af2e`, Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

Candidate-seat-0 failed at root action ordinal 104, turn 17, acting seat 1. Sanitized receipt: `NATIVE_FIXTURE_FAILURE`, stage `policy-decode`, messageLength 21; worker audit: opponent role seat 1 had 33 counted decisions (21 root, 12 prompt), failureCount 1, `lastFailureCode=WORKER_DECISION_FAILURE`; final action was `not-dispatched`. Candidate role seat 0 had 15 decisions and no failures. Candidate-seat-1 reached an engine terminal (candidate won in seat 1), but `actorOnlyExecutionBoundaryValid=false`, so neither side qualifies.

Important narrowing: in `agent36-v3-runner.cjs`, the role/worker decision counters increment immediately after `session.decide` returns, before `enrichTrace`, `requirePolicyAudit`, token trust, and `dispatchSelectedNativeAction`. The failure therefore occurred downstream of a counted worker response and before live dispatch; it is not evidence of a worker-process crash. The safe artifact cannot distinguish trace/audit handling, token trust, or cloned-Store validation.

A 21-character message is length-compatible with `CANNOT_PLAY_THIS_CARD`; the cloned validation path calls `simulator.store.dispatch(action)`. Treat this only as a lead, not a diagnosis: the selected token/action and original message were not retained.

Please inspect the accepted runner/frontier path and identify the exact likely throw site, or propose the smallest safe classification needed to distinguish the post-response stages. No new broad workflow or acceptance infrastructure. Do not change the frozen deck, policy, registration, seed, physical seats, or Twinleaf pin. Agent6 will not dispatch another fixture until the failure is understood and any minimal repair has fresh exact-SHA contract-only/no-game gates.
