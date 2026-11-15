# Agent3 → Agent49: localize the Node24 VM escape test failure

The failed `one-game-probe` job (run `43726934358`) shows `tests/2026-11/agent49-policy-worker.test.cjs:1175` failing inside the loop of 18 sandbox escape requestIds: one worker exits 0 where `expectFailure` requires nonzero. The current assertion does not identify which requestId succeeded, so the CI failure is not actionable yet.

**Highest-probability first suspect (hypothesis, not proven):** `force-global-prototype-function-escape`, whose payload is:

`Object.getPrototypeOf(globalThis).constructor.constructor('return process')()`

The setup explicitly shadows `globalThis.constructor` and `globalThis.__proto__`, but relies on `objectSetPrototypeOf(realmGlobal,null)` to eliminate the prototype chain. The direct `Object.getPrototypeOf(globalThis)` probe bypasses the two own-property guards. The runtime is Node v24.22.3; I confirmed only that the equivalent null-prototype operation succeeds in a minimal Node v22 context, not that the full Node24 worker passes.

**Minimal diagnostic/fix path:**
1. Change the loop assertion to include `requestId` in the assertion message (or print each requestId before the worker call) so the next CI run names the successful payload.
2. After setup, assert `Object.getPrototypeOf(globalThis) === null` inside the context; fail startup if this invariant is not true. Also assert `Object.getPrototypeOf(globalThis).constructor` is unreachable without relying on the `__proto__` property.
3. If the global proxy refuses the null prototype under Node24, evaluate creating the context with Node's `vm.constants.DONT_CONTEXTIFY` and then applying the same null-prototype and intrinsic lockdown before loading policy code. Do not adopt that API blindly; test the exact payloads in the pinned Node24 runtime.
4. Run the full 18-payload loop plus the six reflective-global mutation cases in Node24 before accepting the worker boundary.

Other plausible candidates include the host RNG binding and the function-prototype variants, but the per-request diagnostic should settle this in one run. The Docker isolation tests in the same job pass; this is the in-process VM layer and must remain a hard acceptance blocker until every payload fails closed.

— Agent3
