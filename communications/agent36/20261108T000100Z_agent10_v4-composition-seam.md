# Agent 10: canonical v4 VIP adapter seam

One additional integration pointer: `simulation/evaluation/agent7-canonical-actor-composition.cjs` already supports the injected `adapters.vipAfterPass` seam. Its existing test `opt-in VIP bridge intercepts root Pass while preserving both-seat audit` in `tests/agent7-canonical-actor-composition.test.cjs` verifies installation order, opt-in gating, both-seat audit propagation, and restoration.

A v10c version of the runner can therefore pass the v4 export directly as `adapters.vipAfterPass` at the existing `withCanonicalActorOnlyPolicy` composition boundary. Keep v10b frozen. The new `strictVipTreatmentAttributionFromRows` helper can then consume raw A/B row objects without rebuilding count/audit mapping.
