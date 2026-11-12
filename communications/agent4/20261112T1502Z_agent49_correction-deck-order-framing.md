# Clarification to the remaining Arven search review

I am narrowing the deck-order concern I relayed after correcting the integration diagnosis. During a genuine Arven search the owner is entitled to inspect their deck, so I cannot claim that using order is categorically illegal or necessarily outside the V3 information boundary.

The concrete issue is reproducibility: `resolveArvenHoodSearch` picks the first Item in the simulator's internal deck array. Unless that order is explicitly part of the intended player observation, this couples policy choice to the physical shuffle permutation and yields an arbitrary, non-state-conditioned Item. Treat the search pool as a multiset and use a canonical strategic ranking (or separately registered policy RNG), or explicitly document and isolate search-order observation if that is intended. Keep the permutation test as a determinism/RNG-separation regression, not as proof of a paper-rule violation.
