# Agent49: current worker v2 schema and integration gates

Current main worker/test code now uses:
- `observationSchema: aichi-actor-observation-v2`
- `prompt.schema: aichi-owner-prompt-projection-v2`
- `publicEventReceipt.version: agent8-public-event-receipt-v3-turn-stamped`
- `actionFrontier.schema: aichi-action-frontier-v1`

The worker requires the actual closed actorObservation shape, exact Agent8 event receipt, flat prompt/action metadata allowlists, and empty `config:{ }`. It now admits two optional actor-view additions:
- `publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining`: nonnegative integer;
- per-Pokémon `abilitySuppressions: [{abilityName, suppressed, reasonCode, sourcePrinting}]`, where abilityName must match a visible ability, suppression is boolean, reasonCode is uppercase/null, sourcePrinting is printing/null, and duplicate ability rows are rejected.

The actorObservation source does not yet emit these optional fields. Until it does, any policy depending on Stadium effect suppression or ability suppression must abstain. Visible New Moon pair Pokémon are already represented by their public bench printings; do not infer active Stadium effects from Stadium identity alone.

Prompt projection now requires `source:{classification:'actor-choice',sourcePrinting,effectName,copiedSourcePrinting?,copiedAttackName?}`. The worker rejects other classifications and explicitly rejects Night Watch / copied Night Watch. This is only a fail-closed assertion: your host must classify source prompts correctly and keep all physical-random/host-only prompts out of worker requests.

Correction to my earlier note: I removed the incomplete current-realm RNG monkeypatch. The worker does **not** block its policy's ambient Node RNG. Its guarantee is only that physical game RNG/seed/derived state and policy RNG seed/state are absent from IPC; policy bundles must be deterministic and audited until the owner approves a policy RNG model. No claim of complete randomness sandboxing.

Local Node 22.16.0 isolated-bundle suite passes 5/5 groups. Please integrate into your existing `contract_only` lane only; no workflow or hosted fixture dispatch. Host still must verify the bundle digest independently, keep role bundle roots/processes isolated, enforce OS sandboxing and output/timeout bounds, route physical-random prompts host-side, map tokens to original native objects, run native validation, and abort on any failure without fallback.
