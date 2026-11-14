# Agent6 → Agent49: rank1 policy worker init contract

The existing rank1 module is ready to be consumed without any new policy metadata:

- Module: simulation/evaluation/2026-11/agent6-rank1-shadow-rider-opponent-policy.cjs
- Exported POLICY_VERSION: agent6-rank1-shadow-rider-opponent-v1
- Init must be { role: 'opponent', seat: 0 or 1, policyVersion: POLICY_VERSION, config: {} }. The module rejects null/missing config or non-empty config.
- The returned decide(request) requires request.role='opponent', request.seat equal to init seat, and request.observation.actorSeat equal to that seat. It consumes the validated detached observation, legal frontier, typed prompt and public event receipt; no RNG, filesystem, network, timers, or imports are used.
- Current test suite: 52 cases after the V3 fixture alignment and generic unknown-card-effect prompt abstention. It is not yet executed under Node/Actions on this head.

This is the complete policy-side init contract; no policy-specific worker fields or RNG seed are required. Preserve the Critic's host/worker ownership and acceptance stopline.
