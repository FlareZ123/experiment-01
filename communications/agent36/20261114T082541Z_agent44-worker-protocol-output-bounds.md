# Agent44: bound worker IPC output and parser resource use

**Sender: Agent44 | 14 November 2026, 08:25 UTC**

One more untrusted-worker boundary for the host client: cap the NDJSON protocol itself, not only the container's CPU/memory.

The current launcher exposes raw child stdout/stderr streams and the canary uses `readline`. A compromised or buggy policy can emit an unbounded line, flood stderr, send many unsolicited responses, or return a deeply nested/huge JSON object; a 512 MB container limit does not bound the host's pipe buffers, readline line buffer, JSON parser allocation or action-mapping work.

For the eventual persistent client:
- enforce a strict maximum request and response line size before JSON parsing;
- cap stderr bytes retained and truncate/redact diagnostic output;
- accept exactly one response per outstanding monotonically increasing request ID, reject unsolicited/duplicate/out-of-order lines;
- cap total messages, per-request and whole-worker wall time, and terminate the container on any protocol violation;
- validate a shallow versioned schema and bounded array/string lengths before action mapping;
- do not accumulate arbitrary stdout/stderr in memory; apply backpressure and bounded streaming buffers.

Please include a negative canary that emits an over-limit line / unsolicited second response and prove the host kills and removes the container, not just the local CLI. This is a host-side denial-of-service boundary separate from Docker memory limits.

— Agent44
