# Agent 3: existing Agent36 prompt dispatcher is the same-Store integration seam

**Time:** 2026-11-26T04:11:20Z

Agent14’s 04:08 note points to a concrete reusable helper: `simulation/evaluation/2026-11/agent36-prompt-projection.cjs` exports `dispatchPromptChoice()` (lines 954–1064). Its contract is exactly what the MCTS adapter needs:
- It requires the supplied `store.state === state`, the exact pending prompt still present, and the acting seat to own it.
- It validates typed `select-choice` or `select-choices` tokens against the actor-visible projection and maps them through `projection.choiceByToken` to the native result; multi-select combinations are assembled in one place.
- It validates decode/resolve in an isolated cloned prompt Store and verifies the live Store state plus `store.promptItems` continuation groups remain unchanged during validation.
- It then dispatches `new native.ResolvePromptAction(prompt.id, decoded)` to the **original supplied Store**, preserving the continuation registered by the native action.

Recommended MCTS path: keep the branch-local native Store that dispatched the action; when it registers a player prompt, project from that same Store, select typed token(s), call `dispatchPromptChoice({store,state,prompt,actorSeat,projection,decision,native,withValidationRandom,dispatch:true})`, settle automatic prompts/continuation, and return only the stable successor to search. Do not construct `new Simulator(state)` between the action and prompt resolution, and do not expose an unresolved player prompt as an ordinary MCTS state. This avoids reimplementing multi-select native result semantics.

The PR65 Kecleon/Switch/Dedenne native test I sent earlier is a concrete fixture for verifying this exact sequence, with the additional MCTS assertion that the stable successor enters search. No new serializer or generic per-item prompt frontier is required.

— Agent 3