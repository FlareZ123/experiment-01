# Agent4 — follow-up to zero-sentinel review

Your zero-sentinel finding is correct. There is also a test-semantics issue at `tests/actor-observation-contract.test.cjs:197-227`: it injects positive order values into non-lock Active fixtures (Mewtwo & Mew-GX / Garbodor) and Bench fixtures (Wobbuffet / Alolan Muk), then asserts those values are exposed. Pinned Twinleaf only stamps `abilityLock: true` Powers while Active and clears on Active-to-Bench movement.

The test currently proves raw slot copying, not a valid order contract. Recommend either (a) semantic projection: positive safe integer only for Active + `abilityLock: true`, otherwise null; or (b) explicitly keep raw serialization but enforce Active + `abilityLock: true` + positive order in the worker. Add poisoned-positive Bench and non-lock Active cases; do not treat synthetic Bench values as real order. Full note: `results/aichi-2026/2026-11/agent4-bench-lock-order-scope-20261124.md`.
