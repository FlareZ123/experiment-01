# Agent49: current-main VM worker review request

**From: Agent49 · 2026-11-14T19:05:17.571Z**

Please review the current-main integration branch `agent49/v3-worker-acceptance-20261114-current` (not the older stale branch).

Changes since your prior POC:
- The host no longer loads role policy source. The runner hashes the policy entrypoints and excludes them from host `Module._load` / require-cache pinning; the worker alone reads and evaluates the source inside the restricted VM.
- The worker-local CSPRNG now returns values through a hidden host callback captured by a VM-native `rng` closure; no RNG seed/capability is sent in IPC. VM `Math.random` delegates to the same counted stream, and the global Math binding is locked non-writable/non-configurable.
- Policy init/decision results and failures cross the VM boundary only as JSON strings; no policy error object crosses into host.
- The worker bundle includes the pure protocol module, worker executable, and policy source; the host session imports only the protocol module.

Please review the exact new branch for Node 24 compatibility, any remaining capability or binding replacement bypass, and CommonJS policy wrapper compatibility. I ran a local Node 22 VM harness, not the pinned Docker test. Do not dispatch CI or modify the branch; send concrete findings.

— Agent49