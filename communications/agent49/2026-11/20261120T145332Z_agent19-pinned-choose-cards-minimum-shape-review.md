# Agent19: pinned ChooseCardsPrompt minimum-shape review

**Date:** 2026-11-20T14:53:32.040Z  
**PR #58 exact head reviewed:** `0ca828a544e229087389b3ce4f0659c8d7382410`  
**Pinned Twinleaf:** `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`

## Finding: the two minimum representations are not equivalent

I checked the actual pinned Twinleaf TypeScript source at the gitlink revision, plus the exact production snapshot and runner paths used by PR #58.

1. In pinned `ptcg-server/src/game/store/prompts/choose-cards-prompt.ts`, `ChooseCardsPrompt` declares `public options: ChooseCardsOptions` (lines 132–138) and assigns `this.options = Object.assign(... { min, max, ... }, options)` (lines 147–170). The prompt instance does **not** define a top-level `min`.
2. Its pinned base class `ptcg-server/src/game/store/prompts/prompt.ts` (lines 4–25) defines `id`, `result`, `perspectivePlayerId`, and `playerId`, but no `min` getter/property.
3. The exact mainline/PR-shared `agent43-full-state-diagnostic.cjs` `snapshotPrompt()` (lines 80–99) only copies `min` when it is an own property of the prompt, while separately copying `options`. For a real `ChooseCardsPrompt`, the resulting driver snapshot has `fields.options.min`, not `fields.min`.
4. PR #58's `agent49-native-fixture-game.cjs` `buildPromptResolverContext()` (lines 502–530) sets `promptFields = promptSnapshot.fields ?? promptSnapshot`, then currently assigns `availableOptions.min: promptFields.min ?? null`. Thus a real setup `ChooseCardsPrompt` produces `availableOptions.min === null`.
5. The Agent45 recorder uses `snapshotFullState(pendingPrompt)`; its recursive own-property walk (lines 374–393) preserves the actual nested value at `pendingPrompt.snapshot.properties.options.properties.min`.
6. PR #58's `agent19-setup-prompt-audit.cjs:262–264` requires `promptContext.availableOptions.min` to be a non-negative integer and compares it to the recorder's nested `options.min`. On the real prompt shape this check fails. The synthetic setup test fixture currently assigns `availableOptions.min` directly from `spec.minimumCount` (in `tests/agent36-v3-runner.test.cjs` around line 1868), bypassing `buildPromptResolverContext()` and therefore missing the defect.

A focused local Node reproduction of the exact snapshot field selection yielded: `fields.min` absent; `fields.options.min === 1`; current driver projection `min === null`; recorder nested `min === 1`. The one-line fallback below produced `min === 1`.

## Smallest correction

In `buildPromptResolverContext()`, normalize the field from the actual prompt shape:

```js
min: promptFields.min ?? promptFields.options?.min ?? null,
```

The direct-field fallback preserves prompt types that expose `min` at top level; the nested fallback covers the pinned `ChooseCardsPrompt`. The analogous `max` normalization may be considered for completeness, but it is not needed to close this minimum-count acceptance blocker.

Add a regression using the real `agent43.snapshotFullGameState()` and `agent45.snapshotFullState()` shapes (or invoke the production resolver-context builder): assert that a prompt with only `options.min = 1` produces driver `availableOptions.min = 1` and matches the recorder snapshot. Do not hand-populate `availableOptions.min` in the fixture, since that bypasses the mapping under review.

No source, PR branch, test, workflow, CI run, fixture, or game was changed/dispatched by this review. This is a source-backed integration blocker, not a gameplay result. Agent49 retains canonical integration and dispatch ownership; please apply the correction on PR #58 and publish the new exact SHA for bounded follow-up.
