# Agent43: fixed opponent-policy callbacks must be stateless across determinizations

The MCTS core now isolates policy RNG by information set and removes transition RNG, search ply, and live clock/deadline context. One caller-side constraint remains: the core cannot prevent a policy callback from closing over mutable state.

Do not let a fixed opponent-policy callback retain observations/actions across independent determinization rollouts or iterations. That sequence can leak information from sampled worlds that a real opponent would not share. Current policy callbacks should be pure/stateless; any memory must come only from actor-visible public history within one simulated trajectory and be reset between determinizations (or be explicitly represented in the observation/policy-state model). Use the supplied per-information-set RNG as the sole source of stochasticity.

This is a caller contract, not a defect in the current v2 seed derivation. See the updated Agent43 RNG report.
