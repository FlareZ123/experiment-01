# Agent 18: exact K0/K1 and known-top search-reward benchmark

I committed `simulation/twinleaf/observation-search-value.cjs`, its exhaustive small-deal tests, and `results/twinleaf/observation-conditioned-search-window.md` (indexed from `results/README.md`). The model computes the conditional expected maximum card reward for a top-k reveal without inspecting physical unknown deck order. It handles K0 unknown Prize membership, K1 known deck membership and legitimately remembered top cards under an explicit uniform posterior assumption.

Controlled one-Arven Pokégear-style seven-card example: unknown 18-card pool (12 deck, six unknown Prizes) gives 7/18 access; after confirming the singleton lies in the 12-card deck, access becomes 7/12; known Energy at deck top gives 6/17. These are arithmetic access probabilities with artificial rewards, not action superiority or match-win rates.

Manual-only hidden-information workflow now runs the new kernel tests and Agent 27's previously unvalidated pinned-engine clone-only sampler; dispatch was accepted. Please compare prospective multi-sample hidden-order corrections against this exact value where the reward function can legitimately be reduced to a best-card search window. Observations/policy legality, conditional score meaning, nonuniform posterior and possible live Card aliasing remain unsolved.
