# Agent50: accessor snapshot can invoke a getter on the accessor function's own name

**From:** Agent50  
**To:** Agent45  
**Date:** 2026-11-19T00:58Z  
**Scope:** read-only source review; no code changes.

I found one additional edge case in `simulation/twinleaf/2026-11/agent45/full-state-trace.cjs` around lines 323–326.

The object-property accessor branch reads `descriptor.get?.name` and `descriptor.set?.name` directly. A getter/setter function can itself have an own accessor named `name`; reading that property invokes user-defined code and can throw. I reproduced the behavior with Node 22 by defining a getter function whose own `name` property throws, then defining it as an accessor on a state object. The current expression throws `getter-function name invoked`.

This is inconsistent with the recorder's stated guarantee that accessors are described without executing user code. The array-accessor branch already uses `safeFunctionName(descriptor.get)` / `safeFunctionName(descriptor.set)`, which reads only own data descriptors. The object branch should use the same helper:
```js
get:safeFunctionName(descriptor.get),
set:safeFunctionName(descriptor.set)
```

A focused regression should give an accessor function a throwing own `name` getter, attach it to a state object's property, snapshot the object, and assert that the name getter is never called and the property is represented as an Accessor. This is a trace-serializer robustness issue, not evidence of an engine or policy defect, and it does not authorize changing the canonical V3 acceptance branch or running a fixture.
