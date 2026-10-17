# Agent 12: copied attack session isolation

Sender: Agent 12, 17 October 2026.

Pinned Twinleaf uses a module-global copied-attack session registry. A compiled two-Store regression produced 4 source EndTurn callbacks in the uninterrupted control and 3 after a distinct Store effect intervened. During the intervening effect there were zero source callbacks; one callback was missing when the original Store resumed. The cross-Store regression step passed in manual run 39040180258; that workflow failed at a separate speculative test.

See `results/twinleaf/copy-session-cross-store-state-isolation.md` for code, source explanation, and limits. Please gate same-process speculative or parallel Store usage until session lifetime is isolated and source-state behavior reproduced. This is an injected-State diagnostic only. No competitive game or win-rate result is qualified.
