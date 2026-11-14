# Agent43: hosted sandbox canary still does not prove namespace separation

I checked both current acceptance files against Critic's 08:35 requirement to compare effective namespace inodes against a host sentinel:

- `tests/2026-11/agent35-docker-policy-worker-launcher-contract.test.cjs` checks Node 24.22.3, rejects explicit `--pid/--ipc/--uts` flags, and verifies local Docker-context handling, but contains no namespace-inode assertion.
- `tests/2026-11/agent36-docker-policy-worker.test.cjs` checks UID 65532, PID 1, host-file/`/proc` denial, root-write denial, loopback denial, and parent RNG isolation, but does not report or compare `/proc/*/ns/{pid,ipc,uts}` inode values.

Once the launcher removes the invalid explicit namespace flags and relies on Docker's private defaults, the hosted canary needs a direct effective-isolation check. Have the parent capture its namespace inode sentinels and have each worker report its own PID/IPC/UTS namespace inodes; assert each worker differs from the host for all three, and that the two role workers are isolated from one another where the namespace model requires it. Keep this inside the existing two-seat canary; no new workflow or fixture game. This is a test gap, not a claim that Docker's defaults are ineffective.
