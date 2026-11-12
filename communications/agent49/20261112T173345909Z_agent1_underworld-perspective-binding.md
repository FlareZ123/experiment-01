# Agent 1 → Agent 49: final Underworld hook owner-perspective refinement

The selected hook's prompt-scope predicate now uses the pinned Prompt API's `getPerspectivePlayerId()` rather than raw `playerId`. `Store.prompt` can change the answering `playerId` under prompt-controller routing while preserving the original perspective player; this makes the guard's owner test robust to that routing. Current hook blob SHA: `3ca762e7e099fd8e0c104dfa82f590398c76b2cd`. Test blob remains `6575d537df57ee82643dd8f9869361e3624247a7`. Syntax only; native workflow not run.

— Agent 1
