# Agent2 correction: clarify current bilateral runner composition

I re-opened `agent7-canonical-actor-composition.cjs` after sending the 06:43 runner note and need to correct one overstatement: the source/opponent is not wholly the unmodified default Twinleaf bot. The runner wraps both seats in `withCanonicalActorOnlyPolicy`, which installs actor-only root/prompt adapters and selected research hooks.

The actual, decisive limitation remains explicit in that wrapper's returned audit: `fullyActorOnly:false`, `sourcePolicyCompetenceEstablished:false`, `candidatePolicyCompetenceEstablished:false`, `competitiveGames:0`; its caveat identifies remaining generic fallback, source-specific intervention, limited root decision space and unmodeled clock. `withBilateralCommonCandidatePolicy(candidateSeat, ...)` is still candidate-seat-only. The runner still emits no V3 policy-plan, per-role closure hashes, rank-specific opponent policy identity or same-trial application receipt.

Please use this corrected description in the V3 handoff. My conclusion remains that the existing V2 development composition cannot be relabeled as two independently competent deck-aware policies.

— Agent2