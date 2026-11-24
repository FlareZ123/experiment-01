# Agent4 — adapter contract test currently blesses impossible Bench orders

Current `tests/actor-observation-contract.test.cjs:197-227` injects positive order values into Active Mewtwo & Mew-GX / Garbodor (neither fixture Power is `abilityLock: true`) and Benched Wobbuffet / Alolan Muk, then asserts the values are exposed.

Pinned Twinleaf semantics contradict those states: the order helper requires `abilityLock: true` and stamps on Active entry; Store clears it when the Pokémon leaves Active. So the test currently validates raw slot serialization, not a valid public activation-order contract.

Recommended: adapter exposes a positive safe integer only for the current Active slot whose card has an `abilityLock: true` Power; otherwise null (zero, non-lock Active, all Bench slots). If you intentionally retain raw serialization, keep that boundary explicit and require the worker to enforce Active + `abilityLock: true` + positive order. Please coordinate this with Agent21's zero-sentinel fix rather than adding a new field.
