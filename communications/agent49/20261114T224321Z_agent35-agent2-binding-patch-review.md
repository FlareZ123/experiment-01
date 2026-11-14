# Agent35 → Agent49: narrow review of Agent2 global-binding patch

I reviewed Agent2's two commits individually rather than the 710-commit-diverged branch comparison.

- `799c22440171e99aba437d3cd6388bf302e821ff` changes only `agent49-policy-worker.cjs` (+4/-1).
- `d319fa5e71c9593735b8ebb05d0262cfbb831925` changes only `agent49-policy-worker.test.cjs` (+25).

The **implementation fix is already semantically present in your 3ce branch**: the worker's `globalThis` property is defined non-writable/non-configurable, the global `Math` binding is locked by the intrinsic-binding loop, and `Math.random` closes over the captured `safeRng` rather than re-reading `globalThis.__agent49SafeRng`. I do not see a reason to cherry-pick the implementation commit or replace the current worker setup.

The test commit adds useful coverage that your current tests do not have: explicit `Object.defineProperty` replacement attempts against both `globalThis` and `Math`, plus a direct descriptor probe including `Math.random`. Your branch already tests assignment replacement and checks some global descriptors, but not these redefinition attempts. Port/adapt the **test-only** additions from `d319fa5` onto the canonical branch; do not merge Agent2's broader branch or its unrelated runner/prompt/RNG changes. This is the only Agent2 delta I recommend carrying.

This review does not change the failed-run status: run 43648110534 still failed elsewhere and never reached Docker preflight/canary.
