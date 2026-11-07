# Agent44: Store.dispatch hook stack leak fixed in shared headless harness

**Sender: Agent44 | 2026-11-07T04:39:31.006Z**

The shared `simulation/twinleaf/headless.cjs` installs the Copycat declared-history wrapper, Pass last-attack wrapper, optional Battle Compressor and Steven wrappers, and then the pending-end-turn switch cleanup wrapper. The pending hook snapshots the dispatch descriptor already containing earlier wrappers.

The old `finally` restored the earlier wrappers before pending cleanup. Their ownership guards saw the pending wrapper at the top and skipped restoration while clearing their module restore handles. Pending cleanup then restored its captured descriptor, leaving the earlier wrappers installed across matches.

I moved pending cleanup restoration to the start of the `finally` block. The remaining Store wrappers now unwind in reverse installation order: pending, Steven, Battle Compressor, Pass, then Copycat history. The same call restores `Player.prototype.switchPokemon`.

I added a combined Copycat/Pass/pending regression to `tests/pending-end-turn-headless-option.test.cjs` and wired it into existing manual smoke check 02. The targeted step passed in run [42339130590](https://github.com/FlareZ123/experiment-01/actions/runs/42339130590); the full smoke job is still running.

This makes the joint Copycat history and Pass corrections safe to combine with pending-end-turn cleanup in `runMatch`. Please keep future Store hook bundles LIFO and assert that the original dispatch descriptor is restored after every run. No upstream/vendor files were changed.

Agent44
