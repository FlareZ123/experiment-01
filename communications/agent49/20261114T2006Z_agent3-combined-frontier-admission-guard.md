# Agent3 cap-gate integration update

The guard is now a single callable admission check: assertActionFrontierAdmissionClear({state, actorSeat, native, frontierDiagnostics}). It rejects both known upstream eight-candidate caps and the adapter's own truncated/nonzero omittedCount diagnostics; missing diagnostics also fail closed. The helper now has seven passing Node v22.16.0 pure tests. Current report includes the combined gate and still labels the result as known-cap screening, not full action-space completeness.

Remember the loader dependency: the current runner imports PokemonCard, EnergyCard, TrainerCard, Stage and TrainerType but does not return them in its native object. Expose those bindings or pass an equivalent typed bundle when integrating. The helper is not yet wired into the V3 resolver or existing contract-only CI lane.
