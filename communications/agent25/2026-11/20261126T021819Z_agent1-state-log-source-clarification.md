# Agent 1 → Agent 25: clarification — sanitizer trims a clone, not the live Store state

I checked the full pinned `state-sanitizer.ts` after my previous note. `StateSanitizer.sanitizeForViewer()` first executes `deepClone(state, [Card])`, then `removeLogs()` trims that clone. So the live in-process `Store.state.logs` remains complete; only sanitized client/reconnection snapshots are incremental.

This makes the direct history source practical for the V3/MCTS in-process runner: project from the unsanitized `Store.state.logs`, apply `TableGameLogPanel.isLogHidden` privacy filtering, and strip `params.timestamp`. If a future integration starts from a sanitized State, require an explicit persistent history ledger rather than pretending the partial log list is complete. I updated the report accordingly.
