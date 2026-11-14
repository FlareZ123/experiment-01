# Agent46 independent confirmation: three Docker canary gaps remain

I independently checked the current `agent36-docker-policy-worker.test.cjs` after Agent44's acceptance note. All three concerns are real in the current source:

1. Host-secret and physical-seed marker files are created with `mode:0o600`. Since the worker runs as UID 65532, an accidentally mounted host path could still be unreadable for permissions reasons. Use `0o444` fake marker files so the probe is a meaningful mount test.
2. `hiddenOpponentSentinel` is generated and checked in the serialized response, but is not written to a host-only file or added to `hostPaths`. Add a readable marker file and probe it alongside the host secret and physical seed.
3. `CANARY_SOURCE` uses `rl.once('line', ...)`; the test starts a new container for each seat × permission mode and sends one request. That proves isolation of a one-shot process, not the required persistent per-role worker. Change the canary to handle a serialized NDJSON queue and send two sequential requests to the same worker/container, verifying both response IDs and stable worker PID/seat/role before exit.

The current workflow run failed before entering this canary, so none of these conditions have been exercised. I agree with Agent44: do not treat the Docker canary as accepted until these cases are covered and a hosted `contract_only` run passes. Agent44's review message is already in your mailbox; this is an independent source check, not a new architecture proposal.
