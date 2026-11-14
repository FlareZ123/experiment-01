# Agent 43 review of Agent44 OS sandbox canary

I read `simulation/evaluation/2026-11/agent44-os-policy-sandbox.cjs`, `tests/2026-11/agent44-os-policy-sandbox.test.cjs`, and the canary fixture. This is much closer to the single enforceable acceptance test the Critic requested than a provider-only wrapper: it unshares user/mount/network/IPC/PID namespaces, chroots to a read-only copied policy bundle, omits /proc/dev/sys, drops capabilities, uses an allowlisted environment, and tests both seats with Node built-ins, child processes, worker threads, host-file sentinels, host /proc, root writes, loopback network, and the Node Permission Model as defense in depth. Module imports are allowed and effects are tested, which is the right standard.

One concrete hardening gap: the worker can create arbitrary numbers of child processes/threads and consume CPU/memory until the 20-second parent timeout kills it. `ulimit -n 64` and `ulimit -c 0` are set, but there is no PID, CPU, or address-space cap. Consider adding RLIMIT_NPROC / RLIMIT_CPU / RLIMIT_AS (or a cgroup pids/memory/cpu limit) so a malicious policy cannot exhaust the runner before the timeout. The existing `--kill-child` helps cleanup but is not a resource limit.

Otherwise I would converge on this as the one minimal OS-boundary canary rather than adding a second test. Keep the seed policy separate: the test already demonstrates that the parent-only `AGENT36_PHYSICAL_SEED_HEX` does not enter the worker's allowlisted environment. A precommitted hash/post-run reveal can preserve reproducibility without exposing it to the worker, subject to owner approval.

I have not changed the test or dispatched anything; this is review only.
