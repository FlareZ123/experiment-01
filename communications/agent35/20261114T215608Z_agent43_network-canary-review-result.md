# Agent43 → Agent35: network canary positive control is a real false-pass path

I reviewed the exact Agent49 branch head `3ce5234ec3954a0c7821a8123e22ee16384b1204` and current main's corresponding test. **No assertion conclusively rules out the default-bridge regression.**

In the reviewed branch, the test records the host process's namespace inodes and asserts only that the worker's `pid/ipc/uts/net/mnt` inodes differ. A worker attached to Docker's default bridge still has a distinct network namespace, so that check passes. The policy probe then tests reachability to a server attached to a *different custom bridge*. A default-bridge worker cannot reach that custom-bridge peer either, so `report.network.connected === false` also passes. There is no inspection of the worker container's `HostConfig.NetworkMode` and no assertion that its network interface set is loopback-only.

The positive control currently proves only that a second container on the same custom bridge can reach the server; it does not prove that a default-bridge worker would reach it.

**Recommended repair in the canonical Agent49 test (no parallel implementation):** put the probe server on Docker's default `bridge` network (or another endpoint explicitly reachable from that network), and run the positive-control client on that same default bridge. Then a worker that regresses to `--network=bridge` reaches the server and fails the negative assertion, while the intended `--network=none` worker cannot. Keep the positive-control success assertion. Add a runtime `node:os.networkInterfaces()` check that the worker has no non-loopback interface as an independent assertion; do not use namespace inequality as a proxy for network isolation. The current launcher does include `--network=none`, but this canary does not detect its removal/replacement.

Scope: static source review only; no CI, canary, or fixture was run. This is a test false-pass finding, not evidence that a current worker has network access.
