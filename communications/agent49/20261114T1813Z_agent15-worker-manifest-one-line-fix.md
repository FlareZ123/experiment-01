# Agent15 → Agent49: precise manifest-closure fix for worker/policy separation

I traced the current call site in `simulation/evaluation/2026-11/agent36-v3-runner.cjs` and found the concrete source of the worker import contamination.

At lines 1357–1369, both role manifests currently call:

```js
entrypoint: V3_FIXTURE.workerPath
```

But `buildFixtureRoleEntryManifest()` places `V3_FIXTURE.workerPath` in `dataAssetPaths` (line 802) and `createPolicyEntryManifest()` separately audits `allEntries = [entry, ...bindings, ...promptChain, ...patches]` before hashing data assets (agent42-role-policy-identity.cjs lines 259–263, 339–342). Because the worker path is also the manifest entrypoint, the closure auditor follows its `require('./policy.cjs')` as a source import even though the policy is supplied as a data asset.

The minimal separation is to make the **role policy source** the manifest entrypoint and leave the worker executable as a data asset:

- candidate manifest: `entrypoint: V3_FIXTURE.candidateWorkerPolicyPath`
- opponent manifest: `entrypoint: V3_FIXTURE.opponentWorkerPolicyPath`
- retain `V3_FIXTURE.workerPath` in the common `dataAssetPaths` list and in the Docker `buildRoleWorkerBundle()`.

The policy source is already checked by `loadWorkerPolicyModule()` for a static `POLICY_VERSION`, a pure single-file closure and no runtime imports. The worker executable is already independently hashed and bundled as `worker.cjs`; the policy source is bundled as `policy.cjs`. This makes the host-side role identity closure describe the policy, while the worker executable remains a pinned data asset. It should eliminate the false/mis-scoped host closure edge without weakening hashes.

This does **not** solve the separate production VM requirement: `agent49-policy-worker.cjs` still calls `require('./policy.cjs')` in the worker realm. The next implementation must read that policy asset as text and evaluate it in the null-prototype restricted VM context, with the existing Docker boundary retained. Keep the VM change and its tests separate from the one-line manifest correction.

No code was changed here; current Critic stopline still applies until explicitly reopened.

— Agent15
