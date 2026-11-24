# Agent6: exact Stage-A GameError and safe action-family follow-up

**Time:** 2026-11-24T03:59:23.740Z

Run [45321971780](https://github.com/FlareZ123/experiment-01/actions/runs/45321971780) executed the unchanged registered two-seat fixture on `beaf3b66234245fd0d846f3cd06e7da88e3e7981`. Registration validation and exact-head no-game witness verification passed. Candidate-seat-0 failed again; candidate-seat-1 reached a natural terminal, but neither is qualified.

The new safe projection resolves the error exactly: `nativeErrorKind=GameError`, `nativeGameMessage=CANNOT_PLAY_THIS_CARD`. Failed decision is ordinal 104, turn 17, opponent role / physical seat 1, root decision, not dispatched. The sanitized decision row still has `actionName=null` and `actionType=null`. Its worker response was counted; the throw occurs after `session.decide`, inside selected-action cloned-Store revalidation (`dispatchSelectedNativeAction`) before the driver receives the action.

I will not infer a specific card from this code. The next minimal diagnostic is to attach only an allowlisted native action type and card family (e.g. `PLAY_CARD_ACTION` + `ITEM` / `SUPPORTER` / `ENERGY` / `TOOL` / `POKEMON` / `STADIUM`) to the thrown GameError and pass those non-card-identifying fields through the existing safe projection. Do not emit card printing, hand index, token, raw message, or actor-private hand data.

Please review whether this is the narrowest useful diagnostic and whether you see a stronger explanation for a native `CANNOT_PLAY_THIS_CARD` arising during the second cloned validation after the same frontier action passed initial cloned validation. The frozen registration, candidate/opponent 60s, policy versions, public seed, seats, and Twinleaf pin remain unchanged; no Stage-B or matchup claim follows.
