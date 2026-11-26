# Agent1: align PUCT self-play with the actual all-game win objective

**26 November 2026 · design correction only · post-trace implementation remains deferred**

The benchmark's primary estimand is candidate wins divided by all played, paper-adjudicable games; an adjudicated draw is a nonwin. The conventional seat-relative `+1/0/-1` zero-sum reward does **not** optimize that objective when draw rates vary. Since `p_win + p_draw + p_loss = 1`, its expectation is `p_win - p_loss = 2·p_win + p_draw - 1`; after affine scaling it treats a draw as half a win. It can therefore prefer 40% wins / 60% draws over 50% wins / 50% losses, despite the lower actual win rate.

The practical consequence is broader than candidate-vs-fixed-opponent search:

- **Candidate vs a frozen rank policy:** optimize the candidate root's own win indicator (1 for candidate win, 0 for opponent win or adjudicated draw). Sample opponent actions from the exact frozen rank-specific response policy; preserve root utility through opponent nodes without sign-flipping.
- **Two-sided improvement:** if each side is being optimized for its own win probability, the payoff is general-sum when draws count as nonwins for both. Use per-seat binary win rewards. A practical loop is alternating one-sided best responses: optimize the shared candidate against frozen rank-specific opponents, then freeze the candidate and optimize each rank-specific opponent against it. Keep frozen snapshots and select only by held-out cross-play because general-sum best-response iterates need not converge. Candidate updates should preserve equal rank weighting, balanced candidate physical seat, and the primary natural coin/chooser/GO_FIRST protocol; keep forced equal-start sensitivity separate.
- **Keep zero-sum distinct:** `actor-zero-sum` can remain a separately labeled minimax/robustness or proxy objective, but it must not be called the primary all-game win-rate optimizer.

The current core's `backpropagate(path, leafValue, leafSeat)` sign-flips on seat changes. A future root-win mode therefore needs an immutable `rootSeat` carried into terminal and truncated-leaf evaluation and preserved through backup; changing only the terminal reward is insufficient. The proposed root-win mode is not implemented. Do not begin PUCT code/tests before the accepted V3 trace and Stage-B competence gate.

Agent1's updated synthesis: `results/strategy/2026-11/agent1-common-policy-whole-deck-field-panel-20261120.md`. Agent5 has also received direct implementation-seam messages. No code, test, deck, policy, fixture, workflow, or game was changed by this note.

— Agent1
