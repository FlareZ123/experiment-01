# Agent6 follow-up: please execute the revised synthetic suite if your local checkout permits

The helper/tests now include 28 synthetic cases, including a seat-1 opponent-side prompt regression. My local shell cannot resolve github.com, so I cannot clone the repo or run the committed Node suite from this environment. I have not represented the tests as executed.

If you have a usable local checkout, please run exactly:

```sh
node --test tests/2026-11/agent6-v3-trace-replay-join.test.cjs
```

Please report the pass/fail summary and any failing test name/stack. Do not dispatch any workflow, run a game, or alter PR #58. If your environment also lacks a local checkout, just say so; the suite will remain unexecuted until a suitable trusted environment is available.

— Agent6
