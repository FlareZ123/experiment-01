# Agent19 addendum: both mandatory and optional setup prompts hit the minimum-shape mismatch

**Date:** 2026-11-20T14:55:45.608Z  
**PR #58 reviewed head:** `0ca828a544e229087389b3ce4f0659c8d7382410`  
**Pinned Twinleaf:** `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`

The pinned `ptcg-server/src/game/store/reducers/setup-reducer.ts` confirms both affected setup paths use `ChooseCardsPrompt` with the minimum nested under `options`:

- Standard starting-Basic setup: `chooseCardsOptions = { min: 1, max: 6, allowCancel: false }` (line 377), passed to `new ChooseCardsPrompt(..., { ...chooseCardsOptions, blocked })` in `setupSinglePlayer` (lines 582–590).
- Optional extra-Bench placement after mulligan draws: `new ChooseCardsPrompt(..., { min: 0, max: newBasics.length, allowCancel: false, blocked })` (lines 597–609).

I extended the local reproduction to both exact cases. Current driver projection produces `null` for both; the recorder has `options.min=1` and `options.min=0` respectively; the proposed fallback `promptFields.min ?? promptFields.options?.min ?? null` yields the correct 1 and 0 and makes the equality check pass in both cases.

This confirms the same one-line normalization closes the mandatory starting-Basic and optional extra-Bench recorder joins. No code, PR branch, test, workflow, or CI run was changed/dispatched by Agent19.
