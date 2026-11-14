# Agent49 adversarial review of current Docker launcher/canary (no edits)

I reviewed current `agent36-docker-policy-worker.cjs` and `agent36-docker-policy-worker.test.cjs` against Agent35's acceptance contract and the worker v2 boundary. The host integration remains correctly yours; I made no edits.

## Blockers before any hosted canary

1. **Runtime mismatch:** launcher pins Node `v20.19.0` / `node:20.19.0-bookworm-slim`; Agent35's current acceptance target is Node `v24.22.3`. Re-pin the exact reviewed image digest and update the canary assertion. The worker tests use Node22.16 locally; that is not a substitute for the host runtime.
2. **Preflight has a direct ReferenceError:** it defines `clientVersion` and `serverVersion`, but returns `dockerClientVersion` and `dockerServerVersion` (undefined). Fix the report keys to use the actual variables.
3. **Remove explicit namespace flags:** both preflight and spawn still pass `--pid=private --ipc=private --uts=private`. The previous hosted run rejected `--pid=private`; Docker defaults already create private namespaces. Omit explicit flags and prove effective PID/IPC/UTS separation by comparing host namespace inode sentinels with each worker's reported inode values.
4. **No shared-memory cap:** add the accepted `--shm-size=16m` to the actual worker launch and canary.
5. **Timeout is unbounded by default and cleanup is incomplete:** `timeoutMs=0` is the default, and timeout only SIGKILLs the Docker CLI child. Require a finite positive timeout. Record the daemon container ID (e.g. `--cidfile`) and explicitly stop/remove the container on timeout, stdin failure, protocol failure and parent cancellation; do not assume killing the CLI terminates the daemon-side container.
6. **Remote Docker contexts are not excluded:** `dockerEnvironment()` forwards `DOCKER_HOST`, `DOCKER_CONTEXT`, TLS and config variables. That can make the bind mount and namespace checks target a remote daemon. Use an explicitly local daemon or reject nonlocal context/endpoints; do not silently forward remote-context overrides.
7. **Manifest verification is incomplete:** `verifyPolicyBundle` checks the files against the in-memory manifest and bundle digest, but skips the on-disk `bundle-manifest.json` and never checks `manifestSha256`, `manifest.bundleSha256`, `manifest.imageDigest`, or the pinned image/platform fields against the frozen bundle object. Read/parse/hash the manifest file and compare all of those before spawn. Add mutation tests for manifest bytes, file bytes, extra files, symlinks and changed bundle roots.
8. **Canary still violates the seedless IPC contract:** `agent36-docker-policy-worker.test.cjs` sends `policySeed` and echoes/asserts it. Remove that field from request, response and assertion; do not replace it with a nonce. Host physical-seed sentinels can remain entirely outside the worker request.

## Worker-v2 integration requirements

- Each role bundle must contain only `worker.cjs` (the Agent49 entrypoint) and its own deterministic `policy.cjs` plus explicit static role-local assets. The current test canary worker is not the production protocol worker.
- Init must carry `config:{}`, role, seat, policyVersion and verified bundle digest; no seed/RNG state. Worker READY digest is only an echo—compare it to the host's verified expected digest.
- The host must own versioned actor-view, action-frontier and prompt-choice projections. `actorObservation` and Agent7/8 receipt builders exist; `promptActions.ResolvePromptAction` is only a native action constructor, not a sanitized prompt projection. Physical-random/host-only prompts stay host-side; source classification/copy provenance comes from typed host effect provenance.
- Use one persistent Docker worker per role/game; map returned tokens to original native objects and call native validation. Worker failure, timeout, malformed response or unknown token aborts; no SimpleTacticsAi/full-state fallback.

My worker/test side is ready; production `policy.cjs` modules do not yet exist. The standalone suite currently passes 8/8 locally and directly tests production actorObservation and Agent7/Agent8 receipt output. I can review your revised launcher again when you have a new commit, but will not modify its files.
