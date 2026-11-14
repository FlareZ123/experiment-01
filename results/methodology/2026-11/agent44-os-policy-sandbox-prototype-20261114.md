# Linux policy-worker sandbox prototype

**Status:** tested local proof-of-concept; not yet accepted in CI or integrated into the V3 fixture loop.

## Purpose

Provide an enforceable process boundary for policy code. The policy process must not share the engine's Node heap, Math.random function, Twinleaf State/Store, physical RNG closure, seed-bearing environment, repository files, or host network. This is infrastructure only; it does not establish competitive deck strength or authorize another game fixture.

## Implementation

- simulation/evaluation/2026-11/agent44-os-policy-sandbox.cjs builds a minimal root from the current Node executable, its ldd-resolved libraries, setpriv, and an explicit list of hash-checked regular policy files. The entrypoint must be one of those allowlisted files. The repository is a source root for copying, not a mounted worker filesystem.
- The launcher uses unshare user, mount, network, IPC and PID namespaces, a private mount namespace, a bind-mounted read-only root, a noexec tmpfs at /tmp, and chroot.
- Inside the chroot, setpriv sets no_new_privs and drops the capability bounding, inheritable and ambient sets. RLIMITs cap open files at 64, per-UID process/thread count at 256, CPU time at 120 seconds, address space at 2 GiB, and core dumps at zero. No /proc, /dev, /sys, home directory, repository, Docker socket, or engine files are mounted.
- The worker receives only PATH, HOME, LANG, and TZ in its environment. Deck/config/seat/policy-seed data must travel through a versioned, actor-safe IPC contract, never argv or environment.
- The Node Permission Model is enabled by default as defense-in-depth (experimental-permission, read access only to /policy and /tmp, write access only to /tmp). The OS namespace/chroot boundary remains the security claim; the runtime permission model is not treated as a sandbox.
- The helper exposes createSandboxRoot(), spawnSandboxedPolicyWorker(), and cleanupSandboxRoot(). Every worker launch now requires a finite wall-clock timeout (1 ms to 5 minutes); a caller can reuse one immutable root for persistent role/game workers and communicate over stdin/stdout NDJSON. The helper does not implement policy semantics, prompt projection, action validation, frame-size limits, or the async Twinleaf loop.

## Local evidence

An equivalent local canary harness passed on Linux with Node v22.16.0. With the Node Permission Model disabled, the OS boundary alone produced:

| Probe | Observed result |
|---|---|
| Read host sentinel file | ENOENT |
| Read host /proc/<pid>/environ | ENOENT |
| Write under /policy | EROFS |
| Write under worker /tmp | succeeds on isolated tmpfs |
| Spawn child Node process and read host sentinel | child stays confined; read returns ENOENT |
| Start worker thread | ENOENT in this runtime because no /proc is mounted |
| Connect to host loopback sentinel server | ENETUNREACH; host server received zero connections |
| Math.random setter-capture canary | captures only the worker's own Math.random function; host physical-RNG closure call count remains zero |
| Worker environment | only HOME, LANG, PATH, TZ |

A second local run with the Node Permission Model enabled denied child_process and worker_threads with ERR_ACCESS_DENIED; host-file reads remained unavailable and network connections remained unreachable.

The committed acceptance test is stronger than that initial one-seat local harness: tests/2026-11/agent44-os-policy-sandbox.test.cjs starts persistent NDJSON workers, sends two sequential requests per worker, and repeats the canary for both physical seats in OS-only and Permission-Model modes. It has **not yet been run** on the repository's Node 20.19.0 / ubuntu-latest workflow.

## Required next steps

1. Add tests/2026-11/agent44-os-policy-sandbox.test.cjs to the existing contract_only lane in .github/workflows/agent36-bilateral-competence-v9.yml; do not create another workflow or dispatch input.
2. Run the contract-only lane on its pinned Node 20.19.0 / ubuntu-latest runner. Verify user, mount, network, IPC and PID namespaces are actually available there. If the OS boundary cannot be created, fail closed; do not fall back to in-process policy.
3. Agent36 owns the production launcher/client, async fixture-loop integration, host prompt projection/validation and native action mapping. Agent49 owns the worker entrypoint and actor-safe policy/prompt code. Agent35 owns the hostile acceptance contract. Agent44 reviews the transport and boundary.
4. Keep the Critic stopline: no V3 fixture/game until the complete decision surface (root, setup, prompts, fallbacks and continuations) is isolated, both seats pass the OS canary, and the owner has made the physical-seed disclosure choice.

## Limitations

- Local proof is Node 22.16.0 in this Linux runtime, not the workflow's Node 20.19.0 runner. Hosted-runner namespace support is unverified.
- User namespaces and the required Linux mount operations are mandatory. The helper fails when launch fails; CI must not silently skip this test.
- The prototype is not a formal defense against kernel vulnerabilities. It does enforce filesystem, PID, IPC and network namespace boundaries, resource limits, and capability removal before policy code starts. RLIMIT_NPROC is per host UID rather than a dedicated cgroup, so the hosted-runner test must verify it does not collide with the runner's existing task count.
- In the OS-only canary, a child process may be created, but it remains inside the same chroot/namespaces and cannot read host paths. The Permission Model additionally blocks process/worker creation. Built-in module resolution itself is not expected to fail: tests assert denied effects/capabilities, not failed require().
- The helper does not itself prove that a future worker's JSON observation or prompt projection is information-safe. The worker request must still exclude native objects, full state, hidden prompt choices, opponent private zones, physical seed, and physical RNG references; the host must validate every returned typed intent against live Twinleaf state.

Node v20.19.0 Permission Model documentation: https://nodejs.org/download/release/v20.19.0/docs/api/permissions.html
