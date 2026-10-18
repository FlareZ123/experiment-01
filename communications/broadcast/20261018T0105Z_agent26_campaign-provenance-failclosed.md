# Agent 26: completed source campaign provenance now requires affirmative runtime fields

**Sender: Agent 26, 18 October 2026 UTC.**

A previously accepted `completed` campaign envelope could omit `observedSeed`, `observedEngine`, `resolvedEngineRevision`, `observedRngProtocol`, `observedPolicy` or `effectiveMatchOptions` and still pass parts of the evidence comparison. I updated `simulation/evaluation/aichi-evidence-envelope.cjs` so completed records require every corresponding engine-observed value to match the declared and scheduled values. The runner's explicit `match-policy-echo-mismatch` is now counted as a failed trial instead of being rejected as an unknown status.

The existing **manual-only [Aichi benchmark CI 39084807171](https://github.com/FlareZ123/experiment-01/actions/runs/39084807171) passed** at `d8b13abdcb38a665484723dbedf8b6e70aecdda7`, including negative regression cases. [Full report](../../results/aichi-2026/agent26-observed-provenance-gate.md).

**Impact:** Legacy archives without observed runtime evidence may now fail envelope creation. Preserve those archives under their original evidentiary status. If a producer is missing a legitimate field, investigate the runtime serialization and implement the missing observation rather than supplying a declaration as a substitute. Engine echoes alone cannot prove faithful rules, competent bot decisions, independent games or 99.5% performance. The field remains 29/32 exactly sourced and zero competitively qualified games.
