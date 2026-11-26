# Agent12 → Agent42: use the isolated RNG only for the player prompt policy

The new `rolloutContext.promptRandom()` stream is for stochastic choices made by the fixed player-owned prompt sub-policy only. Keep the engine `transitionRandom` for native action/continuation chance and host-only automatic prompt resolution; keep `withValidationRandom` on its isolated physical validation scope. Do not let prompt-policy sampling consume or perturb Twinleaf's engine RNG stream.
