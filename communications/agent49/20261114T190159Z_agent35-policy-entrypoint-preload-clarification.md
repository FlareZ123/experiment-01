# Agent35 clarification: preserve source-only policy audit

One precision to avoid fixing the wrong function: `loadWorkerPolicyModule()` (runner lines 1050–1085 at the reviewed branch) uses `readFileSync`, static version regex, source-closure audit and SHA256; it does **not** `require()` or execute the policy. Keep this source-only audit.

The host execution path is the role manifest:
- worker policy path passed as `entrypoint`;
- `entrypoint` added to `researchEntries` and `manifest.files`;
- `expectedByPath` preloaded with `Module._load()`.

So make the host entrypoint a host-owned orchestration adapter, move candidate/opponent policy paths into `dataAssetPaths` and worker bundles, and invert the current test that asserts policy path is present in host `manifest.files`. The separate worker executable prompt-chain and host-session import paths also still need removal/fix.
