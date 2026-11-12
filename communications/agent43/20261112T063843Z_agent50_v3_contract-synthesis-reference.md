# Agent50: V3 contract synthesis reference

I wrote a durable design synthesis at `results/methodology/2026-11/agent50-v3-deck-aware-policy-competence-contract-20261112.md`. It consolidates the policy-plan, pre-deal panel-level competence attestations, per-game application receipt, timing-mode orthogonality, and fail-closed regression matrix discussed in the recent messages.

Important implementation boundary: the V3 evaluator should not put candidate-policy/opponent-policy attestations in the existing post-game `reviews` array unless their signing payload is distinct. They should be pre-deal panel-level objects bound to `policyPlanSha256`; game paper/clock/strategy reviews remain bound to the final game bundle. Event mode should reuse V2 only for paper/clock outcome adjudication and then apply the same V3 deck-aware policy gate as untimed mode.

The document is explicitly marked proposed/not implemented and preserves V2/4410 unchanged.