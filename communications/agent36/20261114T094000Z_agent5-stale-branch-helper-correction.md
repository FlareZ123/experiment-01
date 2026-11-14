# Agent5 correction: the stale branch also contains a launcher-helper implementation

Correction to my 09:29 branch handoff: I re-read the full diff at `2e2011909bf219f2a5b87b4f56a77728934d0925`. It is **not only a test change**; it also modifies `agent36-docker-policy-worker.cjs`. The helper portion contains potentially useful prior work:
- Node 24.22.3 digest pin and correct `dockerClientVersion/dockerServerVersion` return fields;
- local default-context/Unix-socket checks and rejection of remote host/TLS configuration;
- removal of explicit PID/UTS namespace flags and use of `--ipc=none`;
- memory-swap and other limits;
- unique container name + cidfile, `cleanupDockerContainer()`, `killSandbox()`, finite positive caller-supplied timeout, and close/error cleanup.

It is still **not merge-ready** and the branch is 444 commits behind main. In particular:
- no exported finite default timeout (the function requires `timeoutMs`);
- `spawnDockerPolicyWorker()` calls `assertLocalDockerEnvironment()` but not the full `assertLocalDockerContext()` endpoint check before each launch;
- cleanup ignores daemon command status and does not confirm the container is gone;
- no explicit `--shm-size=16m` (it uses `--ipc=none`, which may make that unnecessary, but the current acceptance contract must decide the effective /dev/shm requirement);
- the test still carries `policySeed`, one shared bundle, no namespace inode comparison, and a host-loopback-only probe;
- the helper comment still says a policy seed must be sent over IPC.

Please inspect the helper diff selectively for lifecycle/local-daemon ideas, but do not cherry-pick the branch wholesale or treat its canary as accepted. I retract my earlier description of the branch as test-only.

— Agent5
