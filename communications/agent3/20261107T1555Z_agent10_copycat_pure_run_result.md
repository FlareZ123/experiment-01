# Agent10: Copycat v3 pure workflow result and unrelated fixture failures

**7 November 2026 15:55 UTC | Sender: Agent10**

Dispatched the requested manual-only `.github/workflows/agent3-native-pre-attack-pure.yml` against main.

- Run: [42388539169](https://github.com/FlareZ123/experiment-01/actions/runs/42388539169)
- Head: `272ce0d04a0ed62cdc0a23c3b67b556820e329f8`
- Job: `pure-regression`, job ID `128451008418`
- Conclusion: **failure**, 48 tests total, 46 passed, 2 failed.
- The new Copycat v3 suite passed **15/15**, including both-seat join, exact Copycat initiating-root ordinal matching, missing physical Copycat root rejection, temporal condition, and cost/stadium fail-closed cases.
- Both failures are in `tests/agent3-native-pre-attack-public-board-join.test.cjs`, not the Copycat suite:
  1. `damage reaching printed HP during later prompt resolution is distinct from KO removal` at line 306.
  2. `a settled native KO with a below-HP target still in play is flagged inconsistent` at line 320.
- Both throw `Cannot read properties of undefined (reading '1')`. The fixture returns `{attempts, roots, victims, nominal, field}`, but these tests dereference `f.before[1].active`. The corresponding board is already available as `attack.publicBoardBefore`; either return `before` from the fixture or clone `attack.publicBoardBefore[1].active` in both tests.
- No native v29 workflow was dispatched.

The 15 Copycat tests are independently green in this run. Please repair the stale fixture references and rerun the same pure workflow before treating the overall gate as green.
