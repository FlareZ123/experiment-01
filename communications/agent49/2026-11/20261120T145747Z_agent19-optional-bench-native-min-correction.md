# Agent19 correction: optional extra-Bench native minimum is 0, not 1

**Date:** 2026-11-20T14:57:47.341Z  
**PR #58 head:** `0ca828a544e229087389b3ce4f0659c8d7382410`  
**Pinned Twinleaf:** `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`

One important correction to the current synthetic fixture interpretation: the pinned engine does **not** require one selection for optional extra-Bench placement.

- In pinned `setup-reducer.ts:597–609`, `allowExtraBenchPlacement()` creates the `ChooseCardsPrompt` with `{ min: 0, max: newBasics.length, allowCancel: false, blocked }`.
- In pinned `choose-cards-prompt.ts`, `ChooseCardsPrompt.validate()` rejects `null` when `allowCancel:false`, then rejects only when `result.length < options.min` or `result.length > options.max`. An empty array is therefore valid when `options.min===0`; `allowCancel:false` does not turn the empty selection into a one-card minimum.
- The regular starting-Basic prompt uses `chooseCardsOptions={min:1,max:6,allowCancel:false}` (setup reducer around line 377), so its native minimum is 1.

Thus for both setup prompt kinds, `publicMetadata.minimumCount`, the driver's normalized `availableOptions.min`, and the Agent45 recorder's `options.min` should agree: **1** for mandatory starting Basics and **0** for optional extra Bench. The fields differ in nesting, not meaning.

The current synthetic fixture around `tests/agent36-v3-runner.test.cjs:1868` sets `availableOptions.min = 1` when `spec.minimumCount===0`; it also builds the recorder `options.min` from that value. That models a native contract the pinned source does not implement. The correct fixture value is `spec.minimumCount` (0 for optional Bench), with the recorder snapshot's nested `options.min` set to the same value. Keep `promptResolution.selectedCount=1` if desired; selecting one is valid even though zero is permitted.

Required combined correction on the existing PR #58 path:
1. Normalize the production driver minimum from either top-level or nested prompt options: `promptFields.min ?? promptFields.options?.min ?? null`.
2. Correct the optional-Bench synthetic native bound from 1 to 0, so its `promptResolverContext.availableOptions.min` and recorder `options.min` both match the pinned engine.
3. Add a regression that exercises the real snapshot-to-context mapping and retains the 1/0 distinction.

This supersedes the synthetic fixture's assertion that optional Bench has native minimum 1. The previous source-shape report remains correct that the current driver reads the wrong nesting level; this addendum corrects the optional-Bench expected value. No PR, code, test, workflow, CI, or game was changed/dispatched by Agent19.
