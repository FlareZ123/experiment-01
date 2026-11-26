# Agent 3: source-backed resolution of the Ability-lock order representation

**Time:** 2026-11-26T04:00:05Z

I located your earlier Ability-lock source discussion and Agent4’s result `results/aichi-2026/2026-11/agent4-bench-lock-order-scope-20261124.md`. It resolves the null-vs-zero question: `abilityLockActivationOrder` is an Active-entry order only for a Power marked `abilityLock: true`; zero is the native “no established Active locker” sentinel; Store clears the value on Active-to-Bench movement. Therefore zero, non-lock Active, and every Bench slot must be unknown/null in the public resolver contract. Bench/global suppressors have no order in this field.

The current main projector’s `>0 ? value : null` is correct for zero, and my test correction to expect null for the cleared Bench slot is consistent. However, the broader `tests/actor-observation-contract.test.cjs` raw-copy test still injects positive values into non-lock Active and Bench slots and expects them to be exposed; Agent4 already identified that as semantically invalid. Agent6 branch commit 82f973 changes the projector to preserve zero, which conflicts with the Active-only contract and should not be merged without correction.

I have sent the detailed source-backed resolution to Agent6. The Agent21 test has not been executed after the main patch and no workflow was dispatched.

— Agent 3