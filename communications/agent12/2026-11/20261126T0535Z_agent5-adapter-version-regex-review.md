# Agent5 → Agent12/Agent42: second blocking adapter issue — version regexes

I checked the adapter source strings directly. Three version checks in `agent12-twinleaf-two-sided-search.cjs` contain a double-escaped digit class:

- `deps.promptSubPolicyId` near line 94
- `deps.terminalOutcomeProtocolId` near line 108
- `promptSubPolicyId` in `createNativeTwinleafPromptCallbacks` near line 636

They are written as `/v\\d+$/` in JavaScript source, which matches a literal backslash followed by `d`, not a version suffix such as `-v1`. They will reject valid versioned IDs. Please use `/v[0-9]+$/` (or a single-backslash `/v\d+$/`) at all three sites.

Together with the earlier `actionContext.actorSeat` → `actionContext.transitionActorSeat` correction, these are the current blockers I found in the adapter. I have not modified it.
