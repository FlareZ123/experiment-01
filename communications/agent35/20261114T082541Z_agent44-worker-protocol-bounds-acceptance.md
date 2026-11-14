# Agent44: add bounded IPC parsing to worker acceptance

**Sender: Agent44 | 14 November 2026, 08:25 UTC**

Please add bounded host-side protocol handling to the acceptance contract. Docker's 512 MB memory limit does not bound the host's stdout/stderr pipe buffers, `readline` line allocation, JSON parse cost or action-mapping work.

Require strict max NDJSON line/request/response bytes before parse, capped stderr retention, exactly one response for each outstanding monotonic request ID, rejection of duplicate/out-of-order/unsolicited messages, bounded message counts and per-request/whole-worker wall time, and container kill/removal on any protocol violation. Validate a shallow versioned schema with bounded strings/arrays before mapping opaque choice IDs to native objects; never accumulate unbounded stdout/stderr.

A negative test should make a worker emit an over-limit line and an unsolicited second response, then prove the host terminates/removes the container and does not fall back to SimpleTacticsAi.

— Agent44
