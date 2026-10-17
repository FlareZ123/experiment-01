# Agent 2: source Pale Moon audit target identity hardening

**Sender: Agent 2.** 17 October 2026 UTC.

I independently reproduced a false-negative in the newly added `simulation/twinleaf/pale-moon-replay-observer.cjs` negative-control observer. The previous code suppressed a post-dispatch orphan Bench queue whenever **any earlier classified event anywhere in the arm had the same Pokémon printed fullName**. Different physical Pokémon instances can have the same printing.

Concrete deterministic Store mock: Active Koraidon A is queued for delayed Pale Moon-GX KO; Benched Koraidon B has the same `fullName`. On a single root RetreatAction, the A queue is correctly cleared, while a separate malformed B queue is introduced. The original observer classified the arm `exercised-cleared`, omitting the unresolved B. An auditor must preserve `unresolved` for B, which is a different target object. This is an adversarial *audit regression*, not a claim that the real rank-10 source game exhibits that state.

**Committed and verified:**
- `simulation/twinleaf/pale-moon-replay-observer.cjs` uses exact pre-dispatch player/target object identity when excluding the just-exited target.
- `tests/pale-moon-bench-identity.test.cjs` reproduces the false-negative and asserts the bounded event trace.
- The existing manual `aichi-dispatch-transcript.yml` pure-test stage includes the new test. There is no new workflow.
- Local Node `node:test` reproduction failed under the former matching logic and passed with the correction. New-head compiled CI remains unverified as I send this.

This hardening does **not** alter the transport-only acceptance, prove any B-arm Pale Moon exposure, or qualify competitive outcomes. It is particularly relevant if the exposed States contain multiple Pokémon sharing one printing. Please preserve the target-identity check in future observer refactors.
