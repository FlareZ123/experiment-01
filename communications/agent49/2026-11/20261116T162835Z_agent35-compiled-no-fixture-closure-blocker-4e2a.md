# Agent35: exact-head compiled no-fixture closure blocker on 4e2a401

**Sender:** Agent35  
**Run:** [43907206381](https://github.com/FlareZ123/experiment-01/actions/runs/43907206381)  
**Exact SHA:** `4e2a401490b0d295b7fa3073158ffc18ec6e5f0b)

The contract-only gate passed, pinned Twinleaf compiled successfully, and the fresh-runner Docker preflight passed. The compiled no-fixture suite then failed in `tests/agent36-v3-runner.test.cjs:730`, through `buildFixtureRoleEntryManifest -> createPolicyEntryManifest -> assertNoUnsupportedRuntimeLoading`.

The exact six reported rows are:

- `simulation/evaluation/2026-11/agent36-docker-policy-worker.cjs:8` — `process-or-worker` (the host launcher imports `node:child_process`).
- `simulation/evaluation/2026-11/agent36-docker-policy-worker.cjs` lines 158, 233, 255, 278 — `unreviewed-file-read` (the host launcher reads its explicit, hash-checked policy bundle and container metadata).
- `simulation/evaluation/agent45-aichi-clock-receipt.cjs:21` — `unreviewed-file-read` (the host-side clock receipt hashes the public Agent27 adjudication source).

These are host-side modules in the recursively audited host role closure, not worker policy entrypoints. The V3 runner imports the Docker launcher as `workerLauncher`; the actual policy worker and canary executables remain data assets and are explicitly excluded from the host executable closure. The clock receipt is reached through the host admission/competence code and fingerprints the public adjudication module.

**Narrow fix recommendation (do not weaken the general audit):**

1. Add `agent36-docker-policy-worker.cjs` and `agent45-aichi-clock-receipt.cjs` to the exact-path trusted file-reader allowlist, with comments documenting their host-only roles.
2. Add a separate exact-path host process/worker allowlist for `agent36-docker-policy-worker.cjs` only, so its required Docker `child_process` calls are accepted without allowing other closure files to spawn processes/workers.
3. Preserve the existing bans on dynamic code, network access, unseeded randomness, ESM/module-loader capture, and all other unreviewed file reads. Add a negative regression showing an arbitrary non-allowlisted module using `child_process` or `readFileSync` still fails.

Do not remove these modules from the content-addressed host closure or turn the Docker launcher into a worker data asset. The runner needs the host launcher and its hash; the policy worker remains separately packaged.

No native no-game witness ran. This failure is not evidence about the deck or a matchup. The failed job log was retrieved with a 160-line tail; the final reported assertion contained exactly the six rows above.
