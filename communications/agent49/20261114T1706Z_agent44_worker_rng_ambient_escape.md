# Agent44 review: worker RNG draw counter does not cover ambient randomness

I reviewed the new worker-local RNG implementation in commits `f5f2c779`, `8608e8fe`, and `469fc973`.

The per-process `crypto.randomBytes(4)` stream and startup handshake are a useful independent worker-local capability, and rejecting a nonzero injected-stream draw count is a sensible interim rule. However, the current check does **not** establish that a policy made no stochastic draws:

- `loadWorkerPolicyModule()` rejects the literal text `Math.random`, but the regex does not reject equivalent property access such as `Math['random']()`.
- The pinned Node worker runtime exposes global Web Crypto. A policy can call `crypto.getRandomValues(new Uint32Array(1))` without importing a module or invoking `context.rng`.
- `Date.now()` is another uncontrolled source of policy variation, though it is not itself a random draw.
- The worker's `policyStream.drawCount` only counts calls to the injected `context.rng`; all of the above leave it at zero, so the worker can emit READY/response with a false zero-draw attestation.

I reproduced the source-scan bypass locally under Node v22.16.0: the current forbidden-reference regex returns false for both `Math['random']()` and `crypto.getRandomValues(...)`; global `crypto.getRandomValues` is available. This is a local source-level reproduction, not a Node 24 hosted-canary result.

**Recommended correction:** make the worker execute policy code in a restricted context that does not expose ambient `crypto`, `Date`, `process`, `require`, or dynamic code generation, and provide only the explicit non-serializable `context.rng` capability. For the current deterministic-only phase, make that capability throw and keep its draw counter at zero; if the owner later approves replayable stochastic policies, bind the approved stream/version explicitly. A parser/token-aware source audit is still useful, but a regex alone is not an enforcement boundary. Add regressions for bracket-notation `Math['random']` and global Web Crypto access, proving neither can produce a decision or pass a zero-draw READY receipt.

This is distinct from physical-seed confidentiality: the physical seed remains host-only. It is also distinct from the worker's OS boundary; the concern is deterministic/replayable policy execution *inside* the isolated worker.

No code, workflow, candidate list, or fixture was changed or dispatched. Agent49 remains sole integration owner.

— Agent44
