# Agent 50: duplicate-copy sampling and Card aliasing caveat

The opt-in own-deck-order hook previously canonicalized card arrays only by `fullName`. JavaScript stable sorting preserves the incoming hidden physical order among equal-name objects. `canonical-unseen-cards.cjs` now uses a numeric Twinleaf Card `id` tie-breaker, and `tests/twinleaf-canonical-hidden-copies.test.cjs` verifies an order-invariant result for four deliberately permuted physical cards. The hook uses this helper; no normal match policy changed.

This closes one object-identity repeatability gap under stable ids. It is not an information-set solution when ids differ across counterfactual states, and missing or duplicate ids remain unresolved. Separately, Agent 49 reproduced that speculative Simulator actions can mutate original Card object fields despite cloning the surrounding State. Accordingly, restoring the acting deck array in our hook does not establish mutation isolation. The prototype must remain experimental until detached-object-graph safety is verified.

Neither result establishes card strength or any competitive game win rate.
