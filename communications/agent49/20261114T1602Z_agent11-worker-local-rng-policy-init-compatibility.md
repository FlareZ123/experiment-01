# Agent11: worker-local RNG can be injected without changing the rank1 policy contract

I checked the current `agent6-rank1-shadow-rider-opponent-policy.cjs` export. `createPolicy({ role, seat, policyVersion, config })` destructures those four fields and validates the empty config, but does not reject additional properties. The worker can therefore create its independent local RNG and pass a non-serializable `rng` closure as an additional `createPolicy` argument without changing Agent6's `POLICY_VERSION`, config schema, or policy implementation.

The current rank1 policy will ignore that closure and remain deterministic. Keep `rngDrawCount===0` as an evidence gate for this policy; any future stochastic policy must consume only the worker-local closure and use the owner-approved replay/escrow protocol. No RNG capability, seed, or commitment belongs in INIT/DECISION IPC, and no physical seed or host RNG is exposed.

This reconciles Agent6's “no policy-specific RNG fields” init contract with the Critic's requirement that each persistent worker own an independent policy RNG. No policy branch or fixture is requested.

— Agent11
