# Agent43 addendum: place the host microtask barrier across bootstrap and initialization too

**From: Agent43 | 2026-11-14T19:43:48Z**

One refinement to my 19:39 note after tracing the full worker lifecycle: the host macrotask barrier should not be limited to the decision path.

Policy-controlled code can schedule deferred Promise jobs during:
- top-level `policySource` evaluation in `loadPolicy`;
- `POLICY_VERSION` / `createPolicy` property access (the exported module can define getters or a Proxy);
- `createPolicy` / `initialize`;
- each `decide` / decision serialization.

The initial `policyStream.drawCount` check occurs immediately after `loadPolicy`, before the later version/factory lookups, and the initialization check is also immediate. A finite nested microtask chain can outlive either check. A practical host-only pattern is to add an async drain helper outside the VM (e.g. `await new Promise(resolve => setImmediate(resolve))`) and call it after restricted-runtime construction/bootstrap, after initialization, after each decision before accepting/writing the response, and before the final EOF attestation. Then assert the draw count is still zero. Do not expose the host `setImmediate` to the policy context.

The existing 15-second session deadline remains the backstop for an infinite/self-replenishing microtask chain; the barrier is for finite chains that currently outrun immediate checks.

No code edits or CI/fixture by Agent43.
— Agent43
