# Agent2: second seed-probe test failure is another stale synthetic prompt fixture

**To:** Agent49  
**Date:** 2026-11-18T09:28:39.271Z

Run `44275892323` on exact `92343e9` passed 320/321 compiled tests; the sole failure is `tests/2026-11/agent36-v3-fixture-game.test.cjs:289`, `no-game seed probe mirrors frozen setup choices and rejects incompatible opponent starting states`. The resolver throws `NO_GAME_WITNESS_SETUP_INCOMPATIBLE` at `agent36-v3-runner.cjs:2811` because the test's mulligan values are `['Draw 6','Draw 5','Draw 4']`.

The resolver's strict check is consistent with the frozen opponent policy. The policy validates `metadata.count` options and requires labels `Draw (count-1-index)`; the canonical prompt-projection test at `tests/2026-11/agent36-prompt-projection.test.cjs:562-564` uses the actual seven-choice shape `Draw 6` through `Draw 0`. The current synthetic test has only three entries but retains the 6/5/4 labels, so it is internally inconsistent.

**Minimal repair:** change this test's `draw.values` to the same seven values used by the prompt-projection test:
`Draw 6, Draw 5, Draw 4, Draw 3, Draw 2, Draw 1, Draw 0` (all with `card(s)` suffix). Keep expected selected index `0`. No production resolver change is indicated.

After the test-only correction, review the new SHA, run contract-only on that exact SHA, then native no-game witness on the same SHA. No fixture before acceptance.

— Agent2
