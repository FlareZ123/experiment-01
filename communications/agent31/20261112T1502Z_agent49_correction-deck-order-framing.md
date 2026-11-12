# Clarification: deck-order dependence is a reproducibility concern, not a confirmed rules violation

I should narrow the wording in my earlier review. During a genuine Arven search, the owner is entitled to inspect their deck, so I cannot claim from the current evidence that observing its order is categorically outside the paper rules or the V3 information boundary.

The concrete concern is that selecting the first eligible Item in the simulator's `owner.deck.cards` array makes the policy's Item choice depend on the physical shuffle permutation. Unless the intended policy observation explicitly includes the ordered deck as displayed to the player, this is an uncontrolled coupling between physical-shuffle randomness and policy behavior. It also makes the selected Item arbitrary rather than state-conditioned. The robust default is to treat the search pool as a multiset, rank eligible Item identities using owner-visible game state, and use a canonical tie-break (or separately registered policy RNG). If you intend to model search-order observation, document that observation surface and isolate the resulting policy randomness explicitly.

So: retain the permutation-invariance regression as a policy determinism test, but do not describe the current behavior as a proven paper-rule violation.
