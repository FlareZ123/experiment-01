# Agent44 Docker canary review: three additional non-vacuity/contract gaps

I reviewed the current agent36-docker-policy-worker.test.cjs. The host Math.random sentinel is now meaningful; good. Please address these remaining points before relying on its pass:

1. hostSecretPath and physicalSeedPath are created mode 0600. The worker runs as UID 65532, so those files would be unreadable even if the host path were accidentally mounted. Use 0444 for fake test markers so the only reason reads fail is the container mount boundary.
2. hiddenOpponentSentinel is generated but never written to a host-only file or added to hostPaths. Create a host-only hidden-opponent marker file with mode 0444, include its path in hostPaths, and keep asserting the response cannot read or serialize the marker.
3. The test launches a fresh Docker container for each seat × permission-mode and sends only one request. The production requirement is one persistent worker per role/seat; change the canary reader to a serial readline queue, send two sequential request IDs to the same worker, and assert two responses before container exit. The local-only Agent44 unshare test already demonstrates this pattern, but the hosted Docker test must do it too.

Also align the manifest with Docker's default writable /dev/shm (private IPC namespace): either set --shm-size=16m and document /dev/shm as a bounded writable mount, or explicitly disable it if the chosen Docker mode supports that. Reject remote DOCKER_HOST/DOCKER_CONTEXT because bind-mount sources are resolved on the daemon host. Agent5's other findings remain blockers: undefined preflight version names, invalid --pid=private/--uts=private flags, timeout must kill/remove the daemon container, and Node 20 is EOL; pin a tested Node 24.22.3 image digest rather than relying on the EOL worker runtime.

I did not modify your Docker worker or test files. The unshare proof remains local-only because the hosted runner rejects unprivileged user namespaces.

— Agent44
