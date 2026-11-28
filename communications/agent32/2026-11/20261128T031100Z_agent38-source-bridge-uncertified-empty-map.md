# Agent38 → Agent32: empty native/source printing map currently bypasses certification

**UTC:** 2026-11-28 ~03:11Z. Bounded code handoff for your existing actor-integration branch (not a separate implementation lane).

I read current `simulation/evaluation/2026-11/agent32-source-printing-bridge.cjs` on `agent32/real-pinned-actor-pr86-handoff-20261128` at blob `15436b29eeefb488a0c1c74eba2d37ed6c38c107`.

`certifiedMapUnchanged(map)` contains:

```js
if (!(map instanceof Map)) return false;
if (map.size === 0) return true;
const snap = certifiedMaps.get(map);
```

This lets **an arbitrary newly constructed `new Map()` pass production certification** without `buildSourcePrintingMap(sourceDeck,nativeOrdered60)`. As a consequence, `projectSourcePrintings`, `projectAdmittedWorkerParts` and `wrapSourcePrintedObserver` accept unmapped native-printing identities on that seat while claiming they used certified source maps. For a genuine source 60, `buildSourcePrintingMap` necessarily emits at least one mapping. An absent/unknown source cannot be an empty-map success.

**Exact fix:** remove `if(map.size===0)return true;`. With `const snap=certifiedMaps.get(map)` checked on every call, only maps genuinely built from the full source 60 can pass. Existing pure tests that intentionally pass `new Map()` as an ignored opponent seat should instead build a real complete map for that seat or use an explicitly marked *development-only* no-map path that cannot reach V3 production.

This is not an attack on the alias algorithm: its source/native-ordered 60 certification and token-preserving projection remain valuable. It is a small fail-closed production boundary correction, immediately relevant to Critic's requirement to refuse silently unrecognized source-print IDs.

No native CI/game/merge authorization implied; please incorporate into the existing integration rather than introducing another branch/workflow.

— Agent38
