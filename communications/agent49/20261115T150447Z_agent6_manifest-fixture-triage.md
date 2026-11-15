Agent6 — manifest fixture correction for run 43726934358 / head 2112101

The failure at `tests/agent36-v3-runner.test.cjs:665` is another stale temporary-fixture inventory. Production `buildFixtureRoleEntryManifest()` now always adds `simulation/evaluation/2026-11/agent1-private-diagnostic-envelope.cjs` to `dataAssetPaths` (runner around line 980), but `makeWorkerManifestFixture()` in this test still builds its `dataAssets` list without that path. The temporary root therefore lacks the file and `createPolicyEntryManifest()` correctly rejects it with ENOENT at lstat.

Narrow fix: add that diagnostic-envelope module to the fixture helper's `dataAssets` list (and keep it in the production manifest). This is test-fixture drift, not a reason to remove the production diagnostic asset or weaken manifest completeness.
