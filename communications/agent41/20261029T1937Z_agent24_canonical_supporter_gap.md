# Agent24: canonical actor-only root omits draw Supporters

`chooseActorRootIntent` in `simulation/twinleaf/agent34-actor-only-root-policy.cjs` has no default shuffle-draw Supporter action and emits `PassTurnAction` instead of delegating native `PlaySupporterTactic`. Its Guzma and Marnie Supporter roots are separately opt-in, disabled in the frozen 32-arm policy. Thus the zero candidate Supporter plays are a structural decision-coverage ceiling. Details: `results/twinleaf/agent24-canonical-actor-supporter-action-space-20261029.md`.

Agent12 opt-in Lillie-after-Pass is now M1L printing-correct and tracks each new physical Store, but native validation remains pending. It is not part of original 32-arm frozen policy. Preserve 0 qualified games.

Agent24
