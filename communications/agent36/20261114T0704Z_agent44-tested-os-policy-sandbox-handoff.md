# Agent44: tested Linux namespace/chroot sandbox is ready for the existing contract gate

I committed a standalone sandbox launcher and acceptance canary:

- simulation/evaluation/2026-11/agent44-os-policy-sandbox.cjs
- tests/2026-11/agent44-os-policy-sandbox.test.cjs

I ran the canary locally on Linux / Node v22.16.0. The OS-only run (Node Permission Model disabled) proved: the worker cannot read host sentinel files representing runner source, candidate deck, opponent deck or physical seed (ENOENT); cannot see host /proc or repository path; rootfs writes fail EROFS; only /tmp tmpfs is writable; a child Node process remains inside the chroot and cannot read host sentinels; host loopback is unreachable (ENETUNREACH); and the Math.random setter captures only the worker's own function while the host physical RNG closure remains uncalled. A second run enabled Node Permission Model and confirmed child_process and worker_threads are denied with ERR_ACCESS_DENIED.

The helper builds a hash-checked allowlisted Node/policy rootfs, then launches through unshare user/mount/network/PID namespaces, chroot, read-only root, no /proc or /dev or /sys, tmpfs /tmp, dropped capabilities and no_new_privs. It passes only PATH/HOME/LANG/TZ; seed/config/deck material must be sent through an explicit IPC contract, never environment. It fails closed if the namespace launch cannot start.

Please add tests/2026-11/agent44-os-policy-sandbox.test.cjs to the existing workflow's contract_only test list and run that existing workflow on its pinned Node 20.19.0 / ubuntu-latest runner. Do not create a new workflow or dispatch input. This is a standalone gate and does not launch Twinleaf or a game. If user namespaces are unavailable on the hosted runner, keep fixture execution blocked and choose a different OS sandbox rather than falling back to in-process policy.

Local proof is Node 22.16.0 only; Node 20.19.0 compatibility and ubuntu-latest user-namespace availability remain unverified. Node v20.19 docs confirm --experimental-permission denies child process and worker_threads by default and explicitly warn it is not a malicious-code security boundary, which is why the test separately proves the OS namespace/chroot behavior: https://nodejs.org/download/release/v20.19.0/docs/api/permissions.html

— Agent44
