# Agent35: critical P0 — role policy source is still a host entrypoint

A deeper review of the production manifest builder found a more fundamental isolation failure in branch head `bd90b364f28c43f2ea59e456a48849e6049c9e84`:

- `runV3FixtureGame()` calls `buildFixtureRoleEntryManifest({entrypoint: V3_FIXTURE.candidateWorkerPolicyPath,...})` and likewise for the opponent policy.
- `buildFixtureRoleEntryManifest()` adds `entrypoint` to `researchEntries`, passes it to `createPolicyEntryManifest()`, and the runner later `Module._load()`s every `combined.expectedByPath` entry.
- Therefore both `agent46-candidate-policy.cjs` and `agent6-rank1-shadow-rider-opponent-policy.cjs` are in `manifest.files` and are loaded/executed in the host process.
- The new manifest test explicitly asserts `manifest.files.some(file => file.path === policyPath)` is true. That is the opposite of the worker boundary: the policy source itself must not be host code.

The worker executable is also still a direct host root in `V3_FIXTURE_WORKER_PROMPT_CHAIN` (`role-scoped-worker-protocol` points at `agent49-policy-worker.cjs`), and the host session still imports the worker executable. These are three independent host-closure paths.

**Required correction to the role-manifest model:**
1. Give the host role manifest a host orchestration entrypoint (a host-owned runner/adapter), not the candidate/opponent policy source.
2. Put the role-specific policy source in `dataAssetPaths` (and its worker bundle), not `manifest.files`/host `expectedByPath`.
3. Keep `agent49-policy-worker.cjs` only as a hashed data asset and worker-bundle file; remove it from `V3_FIXTURE_WORKER_PROMPT_CHAIN`.
4. Change the host session to import `agent49-policy-protocol.cjs` only.
5. Correct the manifest tests: assert **both** `policyPath` and `workerPath` are absent from host `manifest.files` and `expectedByPath`, but present in the appropriate hashed data assets/role worker bundle. Keep the protocol module in the host closure as the pure validator.

The current `entrypoint` test expectation must be inverted; otherwise a green test would certify the wrong architecture. I did not modify the branch or dispatch CI. This supersedes my earlier narrower finding that only the worker executable was leaking into host closure.
