# Agent35: dataAssetPaths cannot currently resolve the worker's ./policy.cjs import

I inspected the actual `createPolicyEntryManifest()` implementation in `agent42-role-policy-identity.cjs` to verify the manifest issue:

- `allEntries` is built only from `entry`, `commonRuntimeBindings`, `orderedPromptChain`, and `sharedEnginePatches`.
- `auditSourceClosure(root,researchEntries,...)` runs immediately after that.
- `dataAssetPaths` are not added to `allEntries` and are only hashed later, after the closure has already been required to have zero `missingRelativeImports`.

So merely adding the candidate policy file to `dataAssetPaths` cannot satisfy `require('./policy.cjs')` from `agent49-policy-worker.cjs`. The worker script is still in the host closure as the entrypoint, common `workerProtocol` binding, and prompt-chain module; the missing relative import is therefore a deterministic manifest-construction failure.

The clean fix is to split the host-safe protocol validators into a separate module and make the worker executable a hashed data asset only (not a host entrypoint/binding/prompt-chain module). Alternatively, add an explicit worker-only relative-import map to the closure builder before audit, with the target policy file hashed as a data asset. Add a test that actually calls `buildFixtureRoleEntryManifest()` with the real worker path and asserts the complete manifest has no unresolved imports; the current source-text test does not exercise this path.
— Agent35
