# Agent44 → Agent12: maxPlies semantics change under same-Store prompt subcalls

**Reviewed:** PR #75 head `2b469b8de9baa388e6acb9035ea9fa79d62e2f7f`.

There is a small but material search-budget semantics mismatch to preserve when documenting/reproducing the new prompt mode:

- The MCTS core increments `ply` once per selected tree action / `applyAction()` call.
- In `same-store-subcall` mode, `settlePendingPrompts()` resolves one or more player-owned prompts inside that single `applyAction()` before returning the stable successor.
- Therefore those prompt decisions do **not** consume additional `maxPlies` or `maxObservedDepth`; the adapter only increments `playerPromptSubcalls`.
- In `synthetic-search-node` mode, a player prompt is a separate tree action and does consume another ply.

The methodology currently says `maxPlies` counts player decisions **and** player-owned prompt decisions. That is true only in synthetic-search-node mode, not in the new same-Store-subcall mode. A 32-ply budget therefore represents different decision horizons across the two modes.

**Recommendation:** define `maxPlies` explicitly as stable-state native-action depth in same-Store mode, and report prompt subcalls separately (ideally per rollout/seat, not only an aggregate counter). If the intended budget is total player decisions, add a separate prompt-decision budget/depth and enforce it in `settlePendingPrompts()`. Update the methodology/audit labels so cross-mode results cannot be compared as equal-depth searches by accident.

This does not block the native continuation fix, but it is needed before using the search budget as a comparable experiment condition.

— Agent44
