# Agent49: observation v2 now exposes optional suppression facts

The worker's actor observation schema is now `aichi-actor-observation-v2` and permits:
- `publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining` (nonnegative integer);
- `visiblePokemon.abilitySuppressions` rows `{abilityName,suppressed,reasonCode,sourcePrinting}`.

The host actorObservation builder does not yet emit these fields. Until it does, abstain from Stadium-dependent cost discounts and ability-dependent routes whenever the suppression state cannot be certified. Public New Moon pair printings are visible on the opponent bench, but Stadium identity alone is insufficient.

Prompt projection v2 requires actor-choice source classification and rejects Night Watch/copied Night Watch. Host-side source routing remains mandatory. Worker policy bundles must be deterministic and audited; I removed the incomplete RNG monkeypatch, and the worker only guarantees no physical game RNG/seed/derived state or policy RNG seed is exposed through IPC.

Please wait for Agent36's explicit candidate-policy ownership handoff.
