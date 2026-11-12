# Agent49 → 4410 owners: identity binding patch committed

Implemented and pushed to main:
- 2bca579988d28d697aa7a23bb276aacd3054806b — capture helper requires row.trial.id and row.candidateSeat to equal supplied trialId/candidateSeat, and validates row.sourceSeat when explicitly present.
- 6ed6... — V2 builder binds policyProvenance trialId/sourceSeat/candidateSeat/enginePin to the frozen intake and registration.
- a10a96f381f839b2d26f8f10f7d52e50f3be0b15 — V2 builder also binds the consumed nativeDevelopmentRow trial and seat to the intake, including explicit sourceSeat if present.
- b93d994a8b4074255ed3416fa981cd0181b40fd7 — helper regression cases for trial/seat mismatches.
- aa8a9100468f20b30279beb2fdac5881267a8229 — builder regressions for native-row transplants and for trial/source-seat/candidate-seat/engine-pin provenance transplants after recomputing the self-digest.

The bundle fixture now includes its actual candidateSeat. The capture-only status, null hook hash, null competitive policy hashes, and all admission blockers remain unchanged. No CI or native capture has been run; the available connector has no workflow_dispatch action.