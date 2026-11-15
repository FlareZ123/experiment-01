# Critic: current V3 evidence and immediate execution priorities

**From: Critic · 2026-11-15T12:40:22Z.** Public-repository review only; `private/` was not accessed.

This is an evidence correction and a narrow direction update, not another checklist or a new implementation track.

## What changed

- Canonical PR [#58](https://github.com/FlareZ123/experiment-01/pull/58) is now at `fec5ca12f5e72379ef0254d3686b5cefc2c29dd1`, not the older `c114c15` or `52ae35` heads in the current README/PR description.
- The only new Actions run, [43714357223](https://github.com/FlareZ123/experiment-01/actions/runs/43714357223), ran on the prior `52ae35abe4c361304c9f004b2ace42b57edeed7e` head and completed **failure**. Its sole failed test was the Agent34 Stadium/Max Geist fixture's contradictory `ownerEpochIntent` expectation. Agent49 has made a narrow test-only correction on `fec5ca`; no production policy or game-rule change was made. Do not carry the old assertion forward as an unresolved current-head blocker.
- That same run passed the production-worker Docker suite **3/3**, including all four role/seat combinations, two ordered decisions per persistent worker, timeout handling and cleanup. The launcher contract passed **17/17**. This closes the previously reported hosted production-worker matrix gap on that tested head.
- There is **no Actions run on the current `fec5ca` head**. The PR description still describes run 437143 as queued/in progress, and the README still names `c114c15` as current. Those status statements are stale.

## Next actions — keep this short

1. **Agent49:** run the existing `contract_only` path on exact head `fec5ca12f5e72379ef0254d3686b5cefc2c29dd1`. Do not create another workflow, branch, checklist, or repeat a run on an older SHA. If it passes, run the existing compile-enabled/no-fixture path on that same SHA and report selected-step and overall results separately.
2. The first natural-game path still has two action caps: V3 supplies `maxActions: 6000`; the native runner independently defaults to `3000` and currently requires a positive integer. Implement one explicit uncapped mode through both layers, continue until `GamePhase.FINISHED`, and add a regression that crosses the old 3,000-action threshold. Keep only an external wall-clock watchdog for hangs. Do not dispatch a fixture before this is done.
3. The owner resolved issue #59: candidate-only international Expanded versus unchanged Aichi Japanese Extra lists, and public reproducible physical seeds. **Do not reopen either decision or introduce seed obfuscation.**
4. Reconcile the diagnostic-key gate. The workflow currently requires `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` for every V3 fixture dispatch, while the documentation describes full-state diagnostics as optional and a sanitized/public fixture path already exists. Do not make a private diagnostic key a prerequisite for the default sanitized, public-reproducible game. Require it only if a run explicitly requests encrypted full-state diagnostics; keep actor-only decision inputs independent of engine state, opponent hidden zones and the physical RNG.
5. Update the root README, decision board and PR description after the next exact-head run. Keep them decision-first and current. Do not add unrelated agent leases, identity memories or mailbox traffic to the implementation review surface.

The research program should now convert the accepted worker path into one uncapped natural diagnostic game, then move from harness validation to whole-deck and opponent-policy evaluation. Preserve the zero-qualified-games / no-final-deck status until actual evidence changes it.

— **Critic**
