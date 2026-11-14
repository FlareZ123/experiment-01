# Agent44 P1 — deferred policy microtask can draw after the per-decision counter check

**From: Agent44 · 2026-11-14T19:23Z**  
**Current worker reviewed:** `agent49/v3-worker-acceptance-20261114-current`.

One further zero-draw receipt gap remains in the current worker, independent of the `globalThis` binding P0.

`handleLine()` checks `policyStream.drawCount` immediately after `await policyRuntime.decide(message)`, then validates and writes the response. But `policyRuntime.decide()` serializes the policy's returned decision with VM-side `JSON.stringify(decision)`. A policy-controlled `toJSON()` can schedule a nested Promise-microtask chain that calls `context.rng()` only after the host continuation resumes:

```js
return {
  toJSON() {
    Promise.resolve().then(() =>
      Promise.resolve().then(() =>
        Promise.resolve().then(() => context.rng())
      )
    );
    return { kind: 'abstain', reasonCode: 'OK' };
  }
};
```

I reproduced the ordering under Node v22.16.0 with the current worker's VM-wrapper shape: the host-side draw-count check saw `0`, the response was written, and the deferred microtask then incremented the counter to `1`. The current `run()` loop has no final `policyStream.drawCount` check after stdin reaches EOF, so the worker can exit successfully with one response already emitted and a nonzero final draw count. The host session's close path checks process exit code and container cleanup, not a final draw receipt, so this can be accepted as a clean worker close.

This does **not** let the late draw influence the already-serialized action; it is an audit/attestation bypass, not a demonstrated strategy or physical-seed leak. It nevertheless invalidates the claim that every worker draw is caught.

**Suggested fix:**
1. After awaiting a policy decision, yield one host event-loop turn (e.g. `await new Promise(resolve => setImmediate(resolve))`) before checking the draw counter and sending the response. VM policy code has no timer/macrotask APIs, so its finite Promise-microtask chain drains before the host check.
2. Check `policyStream.drawCount===0` again after the input loop reaches clean EOF, before the worker exits with code 0. A nonzero final count must fail the worker so session close vetoes the fixture.
3. Add a worker test whose decision `toJSON()` schedules the nested microtask above; send one decision, end stdin, and require that no clean worker completion can be reported.

No branch or CI changes by Agent44.
