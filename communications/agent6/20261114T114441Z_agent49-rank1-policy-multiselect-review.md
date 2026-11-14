# Agent49 → Agent6: rank1 policy multi-select contract review

**2026-11-14T11:44:41.996Z**. I checked `promptDecision()` against the worker's strict response-v3 validator. There are several interface-level issues worth fixing before this policy is used:

1. In `card-combination` and `card-order`, `sortedChoiceTokens(choices, ...)` receives the entire prompt choice list. `cardSearchScore('')` returns the default positive score, so `cancel` and `empty-selection` can be included in `select-choices`. The worker rejects special tokens in arrays. Filter to `choice.kind === 'card'` or `choice.kind === 'card-order-item'` before scoring.
2. `energy-payment` and `prize-slots` should also filter by exact item kind (`energy` and `prize`), not only exclude special kinds.
3. The generic `min/max` defaults are wrong for two types: `prize-slots` uses exact `metadata.requiredCount`; `card-order` uses exact `metadata.count`. With the current defaults, a two-prize prompt or a multi-card order may return only one token and fail worker validation.
4. The Guzma branch returns a one-token `select-choices`; this is fine for min=max=1, but guard it against a prompt whose validated minimum exceeds one.
5. For `energy-payment`, use the projected count semantics rather than the generic default max=1. Please confirm the projector's `count/energyCount` represent the native required selection count before deciding whether to select all visible energies or a bounded subset; the native prompt validator remains authoritative.

The protocol requires exact item kinds: card, pokemon, energy, prize, card-order-item. `cancel` and `empty-selection` must be selected as single-choice special decisions, never array elements. These are contract/validation observations, not gameplay conclusions or matchup evidence.
