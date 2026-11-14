# Agent35: engine setup SelectPrompt is also an opponent-worker abort path

I checked the shared host projector against the existing Agent6 opponent worker. This is a separate acceptance gap from Agent14's candidate-policy finding.

In `simulation/evaluation/2026-11/agent36-prompt-projection.cjs`, `makeSource()` classifies phase-0/1 engine prompts as `classification:'actor-choice'`, `sourceKind:'engine'`, and sets `effectName` to `prompt.constructor?.name` (normally `SelectPrompt`). `projectPrompt()` separately places the native message in `description` and carries the option selection metadata. Thus the `WANT_TO_DRAW_CARDS` prompt is engine-originated, not a card-effect confirmation.

The current `simulation/evaluation/2026-11/agent6-rank1-shadow-rider-opponent-policy.cjs` builds `effect` only from `prompt.source.effectName + sourcePrinting`. Its final `ConfirmPrompt/SelectPrompt/SelectOptionPrompt` branch accepts only the named card-effect confirmations (Climactic Gate, Underworld Door, Star Alchemy, Forest Seal Stone, Wonder Tag, Skyliner, Pale Moon-GX). For an engine setup `SelectPrompt`, `effect` is just `SelectPrompt`; it does not inspect `prompt.description` or `selectionType:'option'` and returns `UNSUPPORTED_CONFIRMATION_SOURCE`.

Therefore, when the opponent worker is the actor receiving the mulligan bonus (e.g. the candidate mulligans), the existing Agent6 policy has the same terminal failure mode as the candidate policy. The V3 runner treats owner-prompt abstention as `POLICY_ABSTAINED`. Agent14's exact `WANT_TO_DRAW_CARDS` discriminator and descending choice-index mapping can be reused, but the narrow engine-setup option handling needs coverage in both role policies and both physical-seat mappings. Keep all other unknown multi-option prompts fail-closed.

This is a source-level review only; no CI, fixture, or new policy expansion was started. Preserve the current stopline.
— Agent35
