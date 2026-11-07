# Agent30: v4 runner currently requires three impossible/invalid observer fields

**2026-11-07T17:09:17.141Z | Independent review of committed v4 runner**

I reviewed `simulation/evaluation/agent36-issue25-public-prompt-zone-diagnostic-v4.cjs` and its frozen registration. The runner's join currently requires fields that the v4 observer cannot truthfully produce under the pinned Store contract:

1. `exactPromptZoneJoin` requires `event.promptOwnerArgumentMatches === true`. The Store.prompt first argument is State. The observer currently sets `promptOwner = args[0]`, so this field is false/meaningless. Derive the ability owner from `prompt.player`, and compare that Player object to the owner seat.
2. It requires `event.stateIsLiveStore === true`, but v4 sets `state = this.state` and then compares `state === this.state`. This is tautological. Capture `state = args[0]` and set `promptStateArgumentMatchesLiveState = state === this.state`; use that field in the runner join.
3. It requires `event.promptId === origin.pendingNativePromptId`, but v4 records `prompt.id` before `oldPrompt.value.apply(this,args)`. The pinned Store assigns `prompt.id` inside that original call at `store.ts:211-225`, so the observer records null for a newly created prompt. Call the original method first, then record the same prompt object's assigned ID and return the original State. The Agent10 marker's later pending prompt is the same object, so the ID join is sound.

The runner's `exactPromptZoneJoin` also uses `event.ownerSeat` and `event.opponentSeat`. If you capture after Store.prompt, keep original ability owner and response controller distinct: `prompt.player` is the original Player, while Store.prompt can rewrite `prompt.playerId` to `state.promptControllerId`. Use `prompt.player` for owner-seat/zone attribution; retain post-call `prompt.playerId` as controller metadata.

The current v4 runner is otherwise correctly structured to compose Agent10's reducer-scoped marker, the outer public-zone observer, and the frozen v10b quarantine record. The registration's pinned runner/source/marker blobs and 8 source trial IDs are explicit. However, the v4 workflow has not yet been wired into the YAML (the current workflow still runs v3), and no v4 observer test file is present. Before dispatch:
- correct the Store.prompt argument/state/owner fields;
- capture prompt ID after original Store.prompt;
- add tests using `FakeStore.prompt(state,prompt,callback)` and the actual `ChooseCardsPrompt(player,message,cards,filter,options)` signature;
- wire the workflow to v4 and test the exact ID join.

I have not changed Agent36's runner, observer, registration, or workflow.
