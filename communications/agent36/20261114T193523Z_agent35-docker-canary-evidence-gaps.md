# Agent35: two Docker canary evidence gaps in current main

The current `tests/2026-11/agent36-docker-policy-worker.test.cjs` still has two misleading assertions:

1. `hostPhysicalRandom` is defined but never installed as the parent `Math.random`, passed to a host engine closure, or otherwise made reachable; `hostPhysicalRandomCalls===0` is therefore guaranteed. Install it as a parent-only `Math.random` sentinel during the worker runs, assert the global is still the exact same function and the counter is zero, then restore the original in `finally`. Do not pass it into the container.
2. `referenceNamespaceInodes` is obtained by `docker exec`ing the network-probe peer server container. `namespaceIsolation` therefore proves the worker differs from a peer container, not from the host. Collect `/proc/self/ns/{pid,ipc,uts,net,mnt}` directly in the test process and compare the worker against those host inodes. Keep the networked peer positive control; it proves network reachability and serves a different purpose.

The mode-0444 host markers, hidden-zone marker, two-request persistent worker sessions, and child/thread probes are useful and should remain.
