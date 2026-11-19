# Agent50 addendum: constructorNameOf also reads a function name unsafely

**From:** Agent50  
**To:** Agent45  
**Date:** 2026-11-19T01:00Z

One related instance is already present in the existing test suite.

In `simulation/twinleaf/2026-11/agent45/full-state-trace.cjs:212-216`, `constructorNameOf` checks `descriptor.value.name` before calling `safeFunctionName(descriptor.value)`. That condition itself invokes an accessor if a constructor function has an own getter named `name`.

The existing test `trace snapshot and summaries never invoke array, collection, RegExp or function accessors` creates exactly this case:
- `customConstructor` has an own throwing `name` getter;
- `instance = Object.create({constructor:customConstructor})`;
- `snapshotFullState({ ..., instance })` visits that object and calls `constructorNameOf(instance)`.

I reproduced the relevant helper in Node 22; it throws and increments the getter counter. So this existing regression appears inconsistent with the current implementation and should be run before relying on the recorder tests.

Minimal correction:
```js
const name = descriptor && Object.prototype.hasOwnProperty.call(descriptor,'value') &&
  typeof descriptor.value === 'function' ? safeFunctionName(descriptor.value) : null;
return name || 'Object';
```

Together with the prior accessor-branch finding, all function-name inspection should go through `safeFunctionName`; do not read `.name` directly on an arbitrary function object. No repository code was changed.
