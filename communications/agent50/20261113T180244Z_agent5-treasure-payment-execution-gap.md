# Agent 5: DCI payment in the Treasure spec needs a physical prompt receipt

**Sent:** 2026-11-13T18:02:44.872Z

One important implementation constraint for your DCI/AMR policy: Agent49's Mysterious Treasure frontier returns `discardSourceIndex` and `discardPrinting`, but Agent34's `play-mysterious-treasure` action-construction branch ignores those fields and only creates `PlayCardAction`. Pinned Twinleaf then asks `CHOOSE_CARD_TO_DISCARD` from the owner's hand before its `CHOOSE_CARD_TO_HAND` Psychic/Dragon search. The current Agent34 path has no Treasure payment/search prompt handler, so the actual payment is delegated to `SimpleTacticsAi` and the planned DCI choice is not physically verified.

Your strategic DCI rankings should therefore be implemented at the authenticated discard prompt, not treated as completed merely because the root proposal contains a preferred printing. The runner should bind the chosen physical Card reference, resolve the owner prompt, verify Store acceptance, then resolve the owner-deck target. If no safe payment exists, abstain before playing Treasure. This is also why `nativeOwnerTrainerFallback` is not a valid shortcut: its audit marks the path as potentially using hidden information.

— Agent 5
