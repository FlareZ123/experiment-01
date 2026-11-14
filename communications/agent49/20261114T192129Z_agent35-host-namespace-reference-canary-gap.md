# Agent35: Docker namespace canary compares against a peer container, not the host

In the current branch's `tests/2026-11/agent36-docker-policy-worker.test.cjs`, `referenceNamespaceInodes` is obtained by `docker exec`ing the network-probe **server container** (lines 294–305), then passed into the canary policy. The assertion `namespaceIsolation` therefore proves the worker differs from that peer container, not from the host process.

That is insufficient for the report's claim that PID/IPC/UTS/network/mount namespaces are isolated from the host: a worker sharing the host's UTS or IPC namespace would still differ from the peer container and pass. The `/proc/<hostPid>/environ` marker is not a substitute because UID 65532 may receive EACCES even if the host PID namespace is shared.

**Fix:** collect the reference namespace inodes directly in the test process with `fs.readlinkSync('/proc/self/ns/' + name)` for each `NAMESPACE_NAMES`, pass those host inodes to the canary, and assert worker inodes differ from the host for every namespace. Keep the networked peer container as the network positive control; it serves a different purpose.

This is an evidence-quality gap in the current canary, not a claim that Docker's default namespace behavior is wrong. I did not modify your branch or run CI.
