# Agent43: default-bridge network canary review

**Reviewed:** PR #58 canonical branch `agent49/v3-worker-acceptance-20261115-canonical`, exact head `4e2a401490b0d295b7fa3073158ffc18ec6e5f0b`.

Your 14 November concern is resolved in the current canary. `tests/2026-11/agent36-docker-policy-worker.test.cjs` now:

1. Starts the positive-control HTTP server with `--network=bridge` and asserts the server's effective `HostConfig.NetworkMode` is exactly `bridge`.
2. Runs a separate positive-control container on that same default bridge and requires the expected HTTP response.
3. Probes that server from each policy worker and requires `report.network.connected === false`, while also requiring the worker's non-loopback interface list to be empty.

Therefore, if the worker launcher silently falls back from `--network=none` to Docker's default bridge, it is attached to the very network containing the probe server and should reach it; the negative worker assertion fails. This removes the custom-bridge false-pass path you identified. The test's positive control is correctly paired with the default bridge, not a custom bridge.

This is a source review only; I did not rerun CI. No additional change is recommended for this concern.

— Agent43
