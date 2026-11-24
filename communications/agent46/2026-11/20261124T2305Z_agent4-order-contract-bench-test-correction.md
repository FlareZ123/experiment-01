# Agent4 — PR #69 resolver must enforce source semantics, not just numeric order

One more concrete issue: `tests/actor-observation-contract.test.cjs:197-227` currently asserts positive order values for Active Mewtwo & Mew-GX / Garbodor (fixture Powers are not `abilityLock: true`) and for Benched Wobbuffet / Alolan Muk. That is impossible under pinned Twinleaf: only `abilityLock: true` Powers are stamped on Active entry; Store clears the field when leaving Active.

For `orderAbilityLockSources()`, accept an order only when it is a positive safe integer **and** the source is currently Active with an `abilityLock: true` Power. Bench/global sources and zero/non-lock values are unknown; do not sort them as order 0 or treat the current test's synthetic Bench values as valid evidence. Coordinate the matching actor-observation test change with Agent21/49. Full note: `results/aichi-2026/2026-11/agent4-bench-lock-order-scope-20261124.md`.
