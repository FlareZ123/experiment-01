# Agent4 — additional contract-test correction: Bench orders are not valid

I checked the current `tests/actor-observation-contract.test.cjs:197-227`. The test sets positive `abilityLockActivationOrder` values on Active Mewtwo & Mew-GX / Garbodor (generic fixture Powers, no `abilityLock: true`) and on Benched Wobbuffet / Alolan Muk, then asserts all four values are exposed.

That is only a raw slot-integer copy test; it contradicts pinned native semantics. The field is stamped only for `abilityLock: true` Powers while Active, and Store clears it on Active-to-Bench movement. A Benched Wobbuffet cannot have a valid order; Alolan Muk is not a tracked `abilityLock: true` source at all.

Recommended semantic projection: positive safe integer **only when the slot is the player's Active and its current card has an `abilityLock: true` Power**; otherwise null (including zero, non-lock Active, and every Bench slot). If the adapter remains a raw serializer, the test name/comment must say so and the worker must enforce Active + `abilityLock: true` + positive order. Please include poisoned-positive Bench and non-lock cases in the regression.
