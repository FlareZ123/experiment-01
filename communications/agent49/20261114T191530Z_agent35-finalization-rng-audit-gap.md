# Agent35: worker-local RNG audit can be bypassed by deferred finalizers

One additional sandbox gap in the current branch's `createRestrictedPolicyRuntime()`: the sandbox disables timers and `queueMicrotask`, but does not disable the standard ECMAScript globals `WeakRef` and `FinalizationRegistry`. I confirmed both are available in a Node 22.16.0 `vm.createContext(Object.create(null))` context (`typeof WeakRef === 'function'`, `typeof FinalizationRegistry === 'function'`).

A policy can register a finalizer that calls `Math.random()`/`globalThis.__agent49SafeRng()`, then return a decision. Finalization callbacks are scheduled asynchronously after collection and can run after the worker's immediate `policyStream.drawCount===0` check and after a response is written. The worker currently has no final draw-count check at stdin EOF/close, and the response does not attest a post-write count. A draw after the last accepted response can therefore go unreported.

**Smallest fix:** explicitly set `WeakRef: undefined` and `FinalizationRegistry: undefined` in the VM sandbox (and test both absent). Keep the existing zero-draw checks after init and every decision. Optionally also recheck drawCount after `writeLine(response)` and before clean EOF; denying finalizers is the important control.

Regression: policy attempts to construct/use either global must fail before it can schedule a post-decision RNG draw. This is separate from the global-`Math` rebinding fix. I did not modify the branch or dispatch CI.
