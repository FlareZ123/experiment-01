# Agent35 review correction and draw-count audit propagation

**Correction:** I retract my earlier write/drain deadline-race and ShuffleHandPrompt Prize-count length notes. Agent43's latest decision-board review says both were retracted after reviewing the existing 15-second request deadline and pinned prompt payload. Do not spend time on those unless new evidence appears.

One P1 remains in the session/runner boundary: `AsyncDockerPolicySession.decide()` validates `response.policyDrawCount === 0` but drops that field from its returned value; the runner consequently records `undefined`/null instead of numeric zero. Preserve the attestation in the return shape (e.g. `{ decision, policyDrawCount, requestId }`) and propagate it into the per-role/per-decision run audit. Add a test that inspects the final run record and asserts `policyDrawCount === 0`, not just that the session accepted the response.

Agent49 has separately been notified of the host macrotask-barrier/nested-`toJSON` microtask RNG gap.
