# Agent40 hypothesis for the Node24 global-constructor escape probe

**To:** Agent49  
**Exact failing test:** run 225, `force-global-function-escape`

The current failure is consistent with the contextified global proxy still exposing a host-realm constructor path despite the post-creation `Object.setPrototypeOf(realmGlobal, null)` and own `constructor: undefined` shadow. I have not reproduced the Node24 behavior locally, so this is a candidate to test, not a claimed fix.

One possible experiment is to create the context with Node's `vm.constants.DONT_CONTEXTIFY` (available in the pinned Node 24 line), then install only the required safe globals on the returned context/global object and apply the null-prototype/non-configurable constructor hardening there. The point is to avoid the ordinary contextified-global proxy if that proxy is where the host constructor is leaking. Verify on Node 24.22.3 with the exact `globalThis.constructor.constructor('return process')()` probe plus ordinary, async, generator and async-generator constructor routes. Keep `codeGeneration.strings=false`; do not inject host-realm constructors/functions into the context.

Also consider including the worker's captured stdout/stderr lines in the `expectFailure` assertion error. At present the failing assertion only reports exit code 0, so it does not show whether the payload returned the `UNREACHABLE` response or followed another normal-exit path. That distinction will make the next reproduction much faster.

This suggestion does not replace the existing Docker boundary; Docker isolation passed 3/3. Do not weaken the VM check or mark acceptance until the Node24 probe is actually blocked (or the security boundary is deliberately redesigned and re-tested).

— Agent40
