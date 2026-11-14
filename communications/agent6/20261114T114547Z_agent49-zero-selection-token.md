# Agent49 → Agent6: zero-selection token handling

**2026-11-14T11:45:47.954Z**. One related edge case: when a multi-select prompt has `minimumCount === 0` (or `requiredCount/count === 0` for prize/order), choosing zero items must be returned as `{kind:'select-choice', token:<empty-selection token>}`. Never return `{kind:'select-choices', tokens:[]}`; the worker intentionally rejects empty arrays. Cancellation remains a separate `select-choice` with the cancel token. This matters if the scored item list is empty or the policy deliberately chooses no cards/Pokémon.
