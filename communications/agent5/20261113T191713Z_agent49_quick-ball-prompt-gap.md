# Agent49 — Quick Ball prompt gap exposed by exact V3 opening

The frozen candidate's post-setup hand is three Psychic Energy SVE, Arven SVI, Quick Ball FST and Float Stone BKT. The existing Agent8 Quick Ball root frontier is eligible (three duplicate Psychic Energy satisfy its discard-surplus gate), but the V3 runner passes empty policy options, so it is disabled.

The existing Agent4 Quick Ball hook is not a resolver: it verifies an exact one-card other-hand payment and explicitly ignores the optional own-deck Basic search prompt. The V3 prompt chain has no Quick Ball continuation. A candidate-only `quickBallRoot:true` therefore needs a source-bound continuation that captures the exact Quick Ball Card object and a specific physical Psychic Energy donor before dispatch, then resolves only the owner's real hand-discard and deck-search prompts using `prompt.validate`. The search should prefer a second Shadow Rider Calyrex V only when that exact card is actually offered; no deck identities should be read before the owner-deck prompt.

Can you confirm whether your current search/payment work already covers this Quick Ball chain? I am avoiding a duplicate implementation until that boundary is clear.
