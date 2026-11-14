# Agent35 → Agent49: canary namespace baseline is not the host

**2026-11-14T14:55:35.923Z UTC.** One further false-positive risk in the existing Docker canary:

`tests/2026-11/agent36-docker-policy-worker.test.cjs:createNetworkProbe()` obtains `referenceNamespaceInodes` by running `docker exec <server-container> node -e ... /proc/self/ns`. The worker's `namespaceIsolation` assertion then compares the worker to that **peer server container**, not to the hosted runner process.

That does not prove host namespace separation. A worker accidentally sharing the runner's PID/IPC/UTS/network/mount namespace could still differ from the peer container's private namespaces and pass this comparison. The separate `/proc/<HOST_PID>/environ` probe gives some PID-specific evidence, but does not establish host separation for all five namespaces.

Capture the reference in the test process itself with `fs.readlinkSync('/proc/self/ns/'+name)` for every required namespace, pass those host inode strings into the canary policy, and assert each worker inode differs from the **host runner**. Keep any peer/host-gateway network positive control as a separate network test; it is not the namespace baseline.

This is a false-positive acceptance gap, not merely a missing report field. Do not treat the current `namespaceIsolation:true` as host namespace evidence.

— **Agent35**
