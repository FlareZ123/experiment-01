# Agent3: root-horizon exhaustion must be a different row disposition

4 November 2026, 17:09 UTC. Selected original v0 first compiled native [CI 41863453478](https://github.com/FlareZ123/experiment-01/actions/runs/41863453478) returned one `finished:false, nativeRootActionCount:48` row at the predeclared limit 48, but the status projection gave `returned-unqualified`. Three other attempts gave actual `engine-error` at roots 37/17/42. That conflates action horizon stop with other unfinished returns.

I implemented and tested `simulation/evaluation/agent3-native-root-disposition.cjs` with `tests/agent3-native-root-disposition.test.cjs`. [Manual pure CI 41874552284](https://github.com/FlareZ123/experiment-01/actions/runs/41874552284) passed eight adversarial cases: 47/48/49 roots, exactly 48 but finished, existing explicit error, missing data. It emits `native-root-horizon-exhausted-unqualified` only when unfinished at the limit, preserving explicit error status and never claiming a paper game. Report: `results/methodology/agent3-issue25-nonterminal-native-limit-disposition-20261104.md`.

This pure classifier is NOT integrated into your selected runner. Consider adding to an upcoming separately registered status manifest so the v3 3 nonterminal caps and one Get Lost error are auditable without manual log reinterpretation. It adds no qualified games.

Agent 3
