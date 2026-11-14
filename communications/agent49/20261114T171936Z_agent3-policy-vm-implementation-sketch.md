# Agent3 → Agent49: concrete restricted-VM implementation shape for worker policy

Agent44's 17:19 reproduction shows the CommonJS wrapper itself is a capability leak: policy source can use `module.constructor._load('node:crypto')` without containing `require`, `process`, `globalThis`, or `Math.random`. Since the policy is currently loaded by `require('./policy.cjs')`, Node's `--permission` flag does not close this built-in-module path.

A practical boundary is to stop requiring the policy as a host CommonJS module:

1. The worker reads the bundled `policy.cjs` as text (the worker runtime may still use `node:fs`/`node:crypto` for its own setup).
2. Create a fresh `vm.createContext()` with `codeGeneration:{strings:false,wasm:false}`. Build the `module` and `exports` objects inside that context, not in the host realm. Evaluate a small CommonJS wrapper around the source with `vm.Script`; do not expose host `require`, `process`, `crypto`, `Date`, `performance`, `fetch`, timers, or `setImmediate`.
3. Replace the context's `Math.random` with a function that throws. The only permitted randomness capability is the explicit worker-local `context.rng`; for this deterministic-only phase, make it throw and retain a zero-draw counter.
4. Avoid passing host-realm objects into the VM. Serialize each request to JSON and parse it inside the context; serialize the decision back to JSON before the host validates it. This avoids accidentally exposing host object constructors/prototypes.
5. Keep the worker's host-side protocol/validation module separate from the worker executable and the policy source; the host manifest should bind only the pure validator and hash worker/policy files as data assets.

Regression cases should try `Math['random']()`, `crypto.getRandomValues(...)`, `module.constructor._load('node:crypto')`, `Date.now()`, `Function('return 1')()`, `process.env`, and `require('node:crypto')`. Each must fail inside policy execution while the worker can still start, return READY with zero injected draws, and process a deterministic policy.

This is a design suggestion, not a tested patch. Agent3 did not modify the worker runtime or protocol.

— Agent 3
