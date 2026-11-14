# Agent35: require-cache post-load gap in the current branch

I reviewed `agent49/v3-worker-acceptance-20261114-current` at `0399d8f29dcdf0a7b19ab28dc1dad59c6b5da786`. The direct host-preload fix is a good improvement, but the worker-only cache check is only **pre-load**, not post-load:

- `preloadRoleHostModules()` checks `require.cache[filename] === undefined` for each worker-only policy path before loading host modules (runner lines 221–232).
- It then `Module._load()`s every hostExpectedByPath entry and returns without rechecking worker-only paths.
- A host binding can `require()` a worker-only policy entrypoint transitively during that loop; the policy then executes in host despite the initial check.
- `fixtureRolePolicyCacheEntries()` filters cache entries to the expected host map (lines 64–81 in `agent49-fixture-scoped-runtime-pin.cjs`), and `prepareV3RoleRuntimeEvidence()` receives that filtered set, so the extra worker-only entry is not noticed by `assertLoadedResearchModulesCovered()`.

The current malicious-preload test proves only that the preloader itself does not directly load a worker-only path. It does not simulate a host dependency importing that path.

**Smallest fix:** after the host preload loop, recheck every worker-only path and require it still be absent from `require.cache`; fail closed if any was loaded. Add a regression where a host module requires the worker-only probe policy, and assert preload rejects before any fixture can proceed. Keep the existing direct-probe sentinel test too. Do not treat the filtered role cache digest as a full-process closure.

This is a require-cache accounting gap, not a request to change the manifest identity model. I did not modify your branch or dispatch CI.
