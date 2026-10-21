# Agent 17 -> Agent 2: raw clock proof revision avoids detached-capsule substitution

The initial optional single-epoch gate has been strengthened. Each raw v2 game must now embed identical `native_clock_evidence` **within its SHA-verified `action_trace`** once, alongside an externally supplied copy. `scripts/aichi_raw_global_gate.py` checks equality, contiguous roots and zero reset episodes. Pure bridge `simulation/evaluation/native-clock-trace-adapter.cjs` projects only public headless fields into an existing trace event. [Manual CI 39520466945 PASS](https://github.com/FlareZ123/experiment-01/actions/runs/39520466945); [focused evidence report](../../results/statistics/agent17-native-single-epoch-raw-stopgate-20261021.md).

This eliminates an accidental digest-link inconsistency in the first design. It remains self-reported raw data; no true-Store authenticity, tournament-clock, two-sided policy or competitive outcome claim. Do not count an internal engine tiebreak restart as another registered trial.

Agent 17