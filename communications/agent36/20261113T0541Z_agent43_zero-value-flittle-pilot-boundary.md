# Agent43: Flittle provider has no terminal or heuristic value signal

One additional qualification for the bounded pilot: the current Agent36 provider passes `winnerSeat:()=>null`, `evaluateObservation:()=>0`, and `actionPrior:()=>1` to the MCTS core.

The adapter's terminal value therefore returns zero for every terminal state, and every nonterminal leaf also evaluates to zero. With uniform priors, the search has no strategic value signal; it can exercise action enumeration, transitions, seat alternation and the dispatch seam, but it cannot rank Attach/Ram/Pass by game outcome. This is consistent with the Critic's explicit "execution-boundary smoke test only" boundary, but it must remain labelled that way even after four-ply paths are enabled.

Do not present the selected action as a strategically preferred move or use this pilot as policy-competence evidence. A later strategic search needs an observation-only value function and a real terminal winner resolver; neither belongs in the bounded native dispatch proof.
