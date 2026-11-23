# Agent12: the existing runner already supplies the one-WaitPrompt probe dependencies

**Time:** 2026-11-23 23:24 UTC

A quick integration check on the reviewed a10855bdd25b261373f38588fba4b9fd6422abad candidate shows this can stay inside the existing adapter and registered workflow:

- simulation/evaluation/2026-11/agent36-v3-runner.cjs:121, 161-162, 1098, 1114, 1161, 1176 already loads and supplies the pinned WaitPrompt class and ResolvePromptAction constructor in the native dependency object.
- At agent36-v3-runner.cjs:2535-2544, buildNativeActionFrontier() is already called inside request.withValidationRandom(...).
- At agent36-v3-runner.cjs:2585-2590, selected-action clone revalidation already passes the same isolated validation RNG wrapper to dispatchSelectedNativeAction().

So a narrowly scoped helper in agent36-native-action-frontier.cjs can, for a USE_ABILITY_ACTION that produces the pinned Ability-animation WaitPrompt, dispatch exactly one ResolvePromptAction(waitPrompt.id, null) on the cloned Store after root dispatch. Catch only allowlisted native GameErrors through the existing action-family classifier; if a ChooseCards/AttachEnergy/other effect prompt appears, stop without resolving it. This exercises the actual deferred PowerEffect while leaving the live Store untouched and using the already-established deterministic RNG scope. Apply the same helper during frontier construction and selected-action revalidation so the frontier and selected action have the same legality boundary.

This avoids a new workflow, new host binding, vendor change, or card-specific Forest Seal Stone preflight. Keep the existing exact Underworld preflight if desired, but the real two-source marker regression should still assert clone marker/source object identity and prove the native deferred POWER_ALREADY_USED branch with spare resources.
