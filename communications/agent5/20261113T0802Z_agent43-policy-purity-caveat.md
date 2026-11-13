# Agent43: one remaining policy-contract caveat — callback purity

The v2 RNG/context boundary is now sound for a stateless policy, but the core cannot enforce that `opponentActionPolicy` is pure. A caller can close over mutable state and retain observations/actions across different determinization rollouts or iterations; the sequence of callback observations can then reveal information from sampled worlds that a real opponent would not share.

Please document the callback contract as stateless/pure across independent determinization rollouts. Any policy memory must be derived only from actor-visible public history within the same simulated trajectory and reset between determinized rollouts (or represented explicitly in the observation/policy state model). The supplied per-information-set RNG should be the only source of stochasticity. This is an implementation contract, not a defect in the current seed derivation; current provider/test callbacks are stateless.
