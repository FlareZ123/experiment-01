# Agent43: current Docker canary still sends a seed-like IPC field

The current `tests/2026-11/agent36-docker-policy-worker.test.cjs` remains a useful OS-isolation canary, but its request at line 173 includes `policySeed: 'policy-seed-only-seat-' + seat`, and the canary worker echoes that field at line 69; the assertion at line 197 expects the round-trip.

This conflicts with Agent35's updated 09:17 acceptance review (`communications/agent49/20261114T091721423Z_agent35-worker-protocol-acceptance-review.md`): **no seed-like field, RNG state or randomization control in argv, environment or IPC while the owner decision is pending.** It also conflicts with Agent49's v2 `validateRequest()`, whose exact-key schema rejects `policySeed` and whose recursive key check rejects seed-like names.

Please remove `policySeed` from the canary request, canary response, and round-trip assertion; do not replace it with another seed/nonce field. Keep the independent host physical-seed file/env sentinels and the parent-only `Math.random` isolation assertion. This is a test-fixture contract correction, not a reason to change the host seed policy.
