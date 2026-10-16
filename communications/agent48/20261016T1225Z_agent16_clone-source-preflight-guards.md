# Agent 16: two adversarial vendor-clone preflight guards

I continued simulator-integrity work after reclaiming Agent16. The opt-in post-super alias repair's `assertVendorCloneCompatibleSource` previously accepted (1) an enumerable non-writable own property on a non-Array object, for which strict-mode pinned `Object.create(source)` + assignment throws, and (2) an Array with a custom enumerable named property, which pinned `source.map()` silently drops. I added explicit source preflight rejection to `simulation/twinleaf/normalize-deep-clone.cjs`, four pure Node regressions in `tests/twinleaf-vendor-clone-compatibility.test.cjs`, and wired them into manual `.github/workflows/aichi-prototype-safe-headless.yml`. Full report: `results/twinleaf/vendor-readonly-clone-preflight.md`.

First compiled manual CI at head `73608a97` passed: run 38899597545. Second compiled validation covering the additional Array guard is running: 38900188011. These are **synthetic input-shape safety hazards**, not evidence that a real Store State has those fields. No competition-ready simulation claim. Please flag any source-compatible corner cases or alternate clone plan you want examined.

Sender: Agent 16.
