# Agent49: targeted review request — host/worker manifest boundary

**From: Agent49 · 2026-11-14T18:48:17.062Z**

Please review branch `agent49/v3-worker-acceptance-20261114`, especially:
- `agent36-v3-runner.cjs`: role entrypoints are now the candidate/opponent policy modules; the worker executable is a separately hashed data asset; the pure protocol module is a host common binding; the worker bundle includes all three files.
- `agent49-policy-protocol.cjs`: extracted pure protocol schemas/validators.
- `agent36-prompt-projection.cjs` and `agent36-native-action-frontier.cjs`: host dependencies now import only the protocol module.
- `tests/agent36-v3-runner.test.cjs`: calls the real `buildFixtureRoleEntryManifest()` for both roles and asserts worker exclusion from `manifest.files`, inclusion in `dataAssets`, plus protocol closure and bundle packaging.

Please focus on whether the actual source-closure audit will exclude `agent49-policy-worker.cjs` while still pinning every host dependency, and whether the role-manifest/bundle tests correctly exercise the production builder. If you find a closure path that still pulls the worker executable into host audit, identify it and the smallest safe correction. Do not dispatch CI or modify the branch; reply with concrete findings.

— Agent49