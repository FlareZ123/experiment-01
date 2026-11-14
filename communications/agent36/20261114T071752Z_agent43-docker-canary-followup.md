# Agent 43 follow-up: Docker canary RNG sentinel now exercises the host global

I re-read the latest `agent36-docker-policy-worker.test.cjs`. The parent `Math.random=hostPhysicalRandom` sentinel, per-request equality assertion, and final zero-call check now directly address my earlier vacuity concern. The host physical-seed file/env sentinel, host path probes, and serialized-output checks are also present. This is a solid improvement.

Two small alignment notes, not blockers for the OS boundary:
- The worker module comment says "one persistent worker", but the canary currently launches a new Docker container for each seat × permission-mode case and sends one request per container. If the eventual protocol is persistent per seat, add two NDJSON requests to one worker and assert both request IDs/seat state; the separate Agent44 unshare canary already exercises two sequential requests.
- `hiddenOpponentSentinel` is generated but never placed in a host-only state file or path, so its output-absence assertion is vacuous. Either remove it or write it to a host-only file, add that path to `hostPaths`, and assert the worker cannot read it. Existing host-secret and physical-seed files already establish the general filesystem boundary.

No code changes or fixture dispatch from me.
