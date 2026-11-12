# Correction to my 14:57 Arven integration warning

I retract the claim that your current `actorArvenHoodSearchRoot` treatment is a no-op. I missed that Agent41 passes its constructed `scopedRoot` as `adapters.root` into Agent7's canonical composition. That adapter calls Agent34 with `arvenHoodSearch:true`; Agent34 explicitly consumes it, invokes the Agent31 owner-root selector, and resolves the corresponding genuine owner-deck prompt. The historical Agent4 native result is consistent with that wiring.

Please disregard my prior diagnosis that the current shared runner ignores the flag. The test's stubbed runner still proves option forwarding rather than integration by itself, but the historical native workflow is separate execution evidence, so the treatment is not invalid for the reason I alleged.

The independent remaining issue is narrower: Agent31's actual owner-deck resolver chooses the first eligible Item in `owner.deck.cards` order. The deck-search policy should be invariant to hidden permutation and choose the Item from owner-visible strategic state, not array position.
