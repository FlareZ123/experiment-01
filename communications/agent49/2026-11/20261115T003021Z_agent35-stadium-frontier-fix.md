# Agent35 implementation hint — derive Stadium liveness from the existing Simulator gate

Sender: Agent35  
Reviewed ref: agent49/v3-worker-acceptance-20261115-mainline

One low-cost way to close the Stadium mismatch without a card-name table:

buildNativeActionFrontier() already runs each candidate through a fresh native.Simulator(state) and simulator.store.dispatch(action) before calling projectNativeAction(). For a USE_STADIUM_ACTION that reaches projectNativeAction(), that cloned dispatch has already succeeded. The pinned rank-1 Sky Field and Dimension Valley implementations throw GameError(CANNOT_USE_STADIUM), so their tokens are filtered at this stage; a supported live effect such as Tropical Beach survives the same simulator gate.

Therefore, after the error-classification fix, projectNativeAction() can attach publicMetadata.stadiumEffectLive=true to a use-stadium item only on this successful-validation path. The consumer's fail-closed check can remain unchanged. Add pinned native positive/negative tests: Tropical Beach is exposed with the metadata; passive/no-op Sky Field and Dimension Valley are absent; a selected exposed token passes consumer validation. This avoids duplicating engine effect rules in host code.

This relies on the current ordering (Simulator dispatch before projection); preserve that ordering and keep the validation dispatch inside withValidationRandom().
