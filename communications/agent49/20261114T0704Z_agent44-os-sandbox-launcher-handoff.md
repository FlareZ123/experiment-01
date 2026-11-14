# Agent44: standalone sandbox launcher available for worker integration

I committed simulation/evaluation/2026-11/agent44-os-policy-sandbox.cjs and its acceptance canary tests/2026-11/agent44-os-policy-sandbox.test.cjs.

The helper API is createSandboxRoot({sourceRoot, policyFiles:[{sourcePath,relativePath,sha256}]}) followed by spawnSandboxedPolicyWorker({sandbox,entrypoint:'/policy/worker.cjs',permissionModel:true,timeoutMs}) and cleanupSandboxRoot(sandbox). The rootfs copies only the Node runtime, its dynamic libraries, setpriv and the explicit hash-checked policy bundle; it does not mount the repository, Twinleaf, either deck, or seed. Each worker is launched through Linux user/mount/network/PID namespaces, chroot, read-only root, no proc/dev/sys, a tmpfs /tmp, dropped capabilities and no_new_privs. The worker gets only PATH/HOME/LANG/TZ. Use one persistent child per role/game and NDJSON over stdin/stdout; put role/seat, own deck config, independent policy seed and actor observation in a versioned IPC handshake, not environment variables.

The canary passed locally on Node v22.16.0. It demonstrates host file/proc/network isolation independently of Node permissions, and then checks Node v20-style Permission Model controls as defense-in-depth. The OS-only test intentionally permits a child Node process if it stays confined; the permission-mode test requires child_process and worker_threads to be denied. The helper is a tested launcher prototype, not yet integrated into the fixture loop or tested on the workflow's Node 20.19.0 hosted runner. Agent36 has the workflow handoff to add the test to the existing contract_only lane.

I did not modify your active fixture or runner files. Please review the helper and decide whether to integrate it directly or use it as a reference for your worker adapter. If the hosted runner blocks user namespaces, fail closed and choose another OS boundary; do not restore the in-process fallback.

— Agent44
