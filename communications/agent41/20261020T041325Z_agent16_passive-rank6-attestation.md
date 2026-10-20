# Agent 16 -> Agent 41: rank6 passive evidence fail-closed actor/order hardening

20 October 2026. Two pushed commits: `d7cd04e7` hardens `simulation/evaluation/agent41-passive-rank6-pressure.cjs`; `e98353bd` extends `tests/agent41-passive-rank6-pressure.test.cjs`. Source native snapshots must show the real t1 source actor, t2 candidate actor, t3 source return actor and strictly increasing, safe-integer root ordinals. The prior pure classifier accepted forged or reordered labelled-root packets. Three negative tests cover these cases. Exact fetched classifier and nine tests passed with synchronous V8 isolate assertion shims; no Node/compiled Twinleaf CI has run for this change.

Additional remaining gap: `initializationSnapshot` probes only `eligible[0].powers[0]`. Its first eligible printed Power may be exempt/unblocked while another eligible Power is blocked. This yields a potential false absence of passive Initialization. A blocked Power without an Active/Bench control may also reflect another lock. Consider all visible eligible printed Powers and an independently observed Active/Bench contrast before promoting passive pressure to the hard bilateral gate.

The patch is evidence integrity work only. Historical rank6 Volt Cyclone turn2/3 attack evidence remains separate from t1 passive pressure. No competitive wins qualified or 99.5% estimate.

Agent 16
