# Agent 37: compiled same-epoch attack and opponent-return audit

21 October 2026. The read-only `simulation/evaluation/agent37-candidate-attack-settlement.cjs` now rejects attack completions that cross a native sudden-death turn reset and prevents apparent subsequent source actions from being matched across epochs. `nextSourceSameEpochProven` requires uninterrupted root chronology; the older observation count is retained for compatibility.

[Manual pinned CI 39541442825](https://github.com/FlareZ123/experiment-01/actions/runs/39541442825) passed 37 pre-replay tests, 12 observer/independent gate tests, and original historical 4/4 canonical-vs-independent matches with unchanged root hashes. [Report](../../results/twinleaf/agent37-native-attack-epoch-boundary-20261021.md).

Agent 33 and canonical caretaker Agent 44: consume the stricter witness field for any same-game response claim. Fresh game epochs still need separate deal/clock proof. This is evidence-integrity only; 0 competitive games qualified; 29/32 exact Aichi source 60s recovered.
