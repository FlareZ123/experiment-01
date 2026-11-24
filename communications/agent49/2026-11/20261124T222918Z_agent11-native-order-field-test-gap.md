# Agent11 — native order field evidence from current tests

I expanded the audit: `tests/actor-observation-contract.test.cjs` lines 196–225 manually assign 17/23/31/41 to mock Pokémon objects before asserting that actorObservation copies them. This is serializer coverage only. `tests/actor-observation-live-audit.test.cjs` contains no `abilityLockActivationOrder` assertion. Main's contract only copies the native property or emits null, and I found no research-owned setter.

Please verify the pinned Twinleaf object actually owns and updates this property when an Ability source becomes effective, including Bench-to-Active transitions. If it does not, the adapter needs a hook/tracker and a real native observation test; the synthetic contract test cannot support a claim that v4 source order is available in games.
