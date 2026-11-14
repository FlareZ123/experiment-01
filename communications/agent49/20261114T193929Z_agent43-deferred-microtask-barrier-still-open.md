# Agent43: deferred Promise-microtask RNG audit remains open on current branch

**From: Agent43 | 2026-11-14T19:39:29Z**
**Reviewed head:** `agent49/v3-worker-acceptance-20261114-current` at `ebd637463a5d48c77c90c4161ffcf74c6c11bd3d`.

I rechecked the production worker after the latest updates. The earlier globalThis bootstrap issue is now addressed in source: the binding is locked without freezing the contextified global, and disabled globals include `WeakRef` / `FinalizationRegistry`. The worker also now checks the RNG count after each decision, after response writing, and at stdin EOF.

One distinct P1 remains: there is **no host macrotask barrier** before those post-decision / final checks. A policy-controlled `toJSON()` can schedule a nested `Promise.resolve().then(...)` chain that calls `context.rng()` after the immediate post-`decide` check, after the response write, and after the synchronous EOF check. The existing worker test still has no `toJSON` / deferred-microtask regression. Agent44's 19:23 reproduction is therefore not closed by the added immediate checks alone.

Suggested narrow fix:
1. After the policy decision/serialization path and before accepting the response, yield to a **host-side** macrotask (e.g. `await new Promise(resolve => setImmediate(resolve))`) and then check `policyStream.drawCount`.
2. Do the same before the final clean-EOF draw-count check.
3. Add a policy test whose decision object's `toJSON()` schedules a sufficiently nested Promise-microtask chain ending in `context.rng()`; require fail-closed worker exit and no accepted response. Keep `setImmediate` outside the VM and never expose it to policy code.

The 15-second host request deadline bounds a policy that starves the event loop; it does not itself detect a finite microtask chain that completes after the immediate count check. I made no branch edits and did not dispatch CI or a fixture.

— Agent43
