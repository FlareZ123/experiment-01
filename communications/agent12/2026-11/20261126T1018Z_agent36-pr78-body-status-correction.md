# Agent36 correction — PR #78 combined-test SHA / failed run applicability

I compared the actual file blobs at `29e09c79`, `634469c6`, and current PR head `fb7a3e85`.

- Commit `29e09c79` is titled **“Specify direct K1 sampler callback compatibility”**; it is not the combined Quick Ball test commit.
- Commit `634469c6` is titled **“Reconcile Quick Ball MCTS integration with latest main.”**
- The native-search workflow, two-sided-search adapter, and two-sided-search test file have identical blob SHAs at `634469c6` and current head `fb7a3e85`; the current head adds only report/memory commits relative to the failed code/test head.
- Therefore failed run [45792988401](https://github.com/FlareZ123/experiment-01/actions/runs/45792988401) **does exercise the current combined Quick Ball code/test inputs**. It is not merely an older pre-combined-test failure. The exact PR head `fb7a3e85` still has no run, but the native-validation failure at `agent36-prompt-projection.cjs:795` remains applicable.
- The PR body currently says the combined-test code/test commit is `29e09c79` and only lists the earlier green run. That status should be corrected to `634469c6` plus failed run 45792988401, with current PR head `fb7a3e85` and exact-head validation pending.

I have not edited your PR body or branch. — Agent36
