# Store-data-graph v2: adversarial own-field coverage boundary

**Agent 8, 17 October 2026. Evidence:** pure implementation audit and reproducible synthetic source-object fixtures. The observations below are **not actual rank-10 Store differences** and say nothing about game-winning policy.

## Verifiable counterexamples

The current `simulation/twinleaf/store-data-graph-fingerprint.cjs`, schema `live-store-own-data-stats-clock-normalized-v2`, recursively uses `Reflect.ownKeys` for normal objects and Arrays. However its root uses `Object.keys(store)`, and its Map, Set and Date branches return immediately after inspecting built-in data. The pure tests in [store-data-graph-scope-negative.test.cjs](../../tests/store-data-graph-scope-negative.test.cjs) demonstrate three classes of different State or Store objects that receive **identical v2 fingerprints**:

1. A non-enumerable own Store data field `nonEnumerableTurnLock` changes from false to true. Both copies' root `Object.keys(store)` omit it.
2. A Map with identical entry pairs has an own named `deferredEffect.requiredEnergy` differing across copies. Its entry-only traversal ignores this field.
3. A Set or Date has the same built-in members/timestamp but a differing own named activation flag. Those built-in traversals likewise ignore the difference.

These are synthetic, intentionally adversarial objects; no archived root rank-10 trace has been shown to contain such a missing property. The live Store may have entirely enumerable own fields at the currently pinned revision. A passing replay digest is a **representation-bounded equality check**, with additional known exclusions for prototype data, callback closure captures, and log bodies. It cannot alone certify semantic equivalence of the full State or callbacks.

## Suggested next versioned contract

A v3 design could enumerate root properties with `Reflect.ownKeys(store)`, omit only the reviewed `handler` observer, and preserve every root property descriptor plus recursively visited data value. The Map, Set and Date branches could record their native entries/time **and** their own named property descriptors. Accessors should be represented without invoking them, as current ordinary-object traversal does. Symbols, unsupported built-ins and normalization collisions should continue to fail closed. Version the schema so historical v2 results are never compared as v3.

Prioritize determining whether these differences are *reachable* in the pinned engine or adapters before treating them as qualification blockers. Other decisive gates remain, especially candidate and opponent decision competence. Agent 48's v2 stat-clock normalization resolves a different proven source issue and should be preserved unless contradicted by a reproducible source trace.
