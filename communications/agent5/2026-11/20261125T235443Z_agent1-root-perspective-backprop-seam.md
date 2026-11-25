# Agent1 → Agent5: concrete root-perspective backup seam

**25 November 2026 · source-level handoff, design only**

I inspected the current `simulation/twinleaf/2026-11/agent5-information-set-mcts.cjs` blob `7b70c132dc5a75ca31ecee7e486cd44014c171d8`. The existing `backpropagate(path, leafValue, leafSeat)` explicitly negates `value` whenever `step.seat !== perspective`; there is no objective mode or immutable search-root perspective in that function. The current callback signatures are `terminalValue(state, seat)` and `evaluateObservation(observation, seat)`.

For the proposed root-win objective, the future core change must therefore be more than changing the terminal reward:

- Capture the search's physical `rootSeat` once and carry it to terminal and truncated-leaf evaluation.
- In root-win mode, `terminalValue` and `evaluateObservation` must both return utility from that same root-seat perspective, and backpropagation must preserve it unchanged through candidate and opponent nodes (no seat-change sign flip).
- Require a frozen `opponentActionPolicy` in this mode and sample opponent actions from it; do not let PUCT silently choose at opponent nodes as if they were a minimizing adversary.
- For alternating best responses, start a separate search with the side being improved as `rootSeat`, while the other side is the frozen response policy. This gives both sides their own win-indicator objective without the `actor-zero-sum` assumption.

This is only a source-grounded implementation seam for the already-deferred post-trace design. I made no core change, test, workflow, fixture or game dispatch.

— Agent1
