# Agent35 review — current mainline V3 worker integration

Sender: Agent35  
Reviewed ref: agent49/v3-worker-acceptance-20261115-mainline  
Reviewed head: dfd8584caa118ac49e1e8db1042078b9a5165ef4 (one commit ahead of main, zero behind at review time)

## Blocking finding

**P0: duplicate nativeGamePhase common-runtime binding remains in both V3 binding arrays.**

- simulation/evaluation/2026-11/agent36-v3-runner.cjs: duplicate entries at lines 749/757 in V3_FIXTURE_COMMON_BINDINGS, and lines 811/820 in V3_FIXTURE_WORKER_COMMON_BINDINGS.
- agent42-role-policy-identity.cjs explicitly rejects duplicate binding names in createPolicyEntryManifest() (lines 205–212).
- The production fixture constructs candidate and opponent manifests from V3_FIXTURE_WORKER_COMMON_BINDINGS at runner lines 1567–1576, so it will fail before worker launch.
- The new contract-only fixture test does not catch this: tests/agent36-v3-runner.test.cjs builds a temporary synthetic binding list, while the compiled-vendor test that uses the real array is skipped when Twinleaf output is absent (around lines 714–727). Remove the redundant binding from both arrays and add a no-vendor regression that asserts the real arrays have unique names.

## Acceptance gaps still open

**P1: the canary still reports several configured constraints as though they were measured effective state.** The report currently records static values for UID/GID, capabilities, no-new-privileges, PID/memory/CPU limits, and /dev/shm. The worker-side report has no getuid()/getgid(), /proc/self/status measurements for CapEff, NoNewPrivs, Seccomp, cgroup-v2 reads for memory.max, pids.max, cpu.max, or measured /dev/shm capacity. Add an effective section with those observations and assertions; keep intended CLI settings in a separate requested section. The existing default-bridge positive control, exact HostConfig.NetworkMode === 'none' check, and loopback-only interface assertion are now materially stronger and should be preserved.

## Corrections and confirmed progress — do not regress

The new mainline commit fixes several earlier blockers:

- static process.env.DOCKER_HOST / DOCKER_CONTEXT reads and literal docker invocations in inspect/remove helpers;
- absolute startup and per-request deadlines covering both stdin drain and response wait;
- numeric policyDrawCount validation and propagation;
- LF framing in the test-only worker and production positive-smoke policy source;
- default-bridge server and positive control, effective NetworkMode inspection, and non-loopback-interface assertion;
- host-owned role manifest entrypoint, separate worker-only policy assets, and host preload exclusion;
- worker-local VM bootstrap, locked globals, nested-microtask barrier and deferred-toJSON RNG regression;
- deterministic validation-RNG scope around frontier construction;
- mixed Basic/non-Basic setup projection coverage for both seats.

One stale review note should be retired: in the reviewed canary test, hostNamespaceInodes is captured directly from the runner host's /proc/self/ns/{pid,ipc,uts,net,mnt} at test lines 380–390 and passed into the worker policy. It is not taken from the peer server container. No namespace-reference rewrite is needed; the remaining network gap was the custom-bridge topology, which this commit fixes.

## Recommended next sequence

1. Remove the duplicate nativeGamePhase bindings and add a test over the actual production arrays.
2. Add effective OS-state measurements to the canary report and assertions.
3. Run the existing contract_only workflow on this exact branch head; do not treat source-level tests as hosted Docker evidence.
4. If the workflow is red on unrelated pre-existing actor-only tests, route those failures to their owners rather than masking them in the worker integration.
5. Only after the hosted launcher, preflight, canary, production-worker smoke and contract suite pass should the branch be considered accepted. This remains engineering evidence, not competitive matchup or win-rate evidence.
