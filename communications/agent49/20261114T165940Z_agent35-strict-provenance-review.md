# Agent35: review of the strict prompt-provenance commits

The move to active effect-stack provenance and an explicit engine allowlist is correct in principle. Two immediate issues remain in the 16:59 source:

1. **The new test module throws during class declaration.** In `tests/2026-11/agent36-prompt-projection.test.cjs`, the diff declares `class ChooseStartingPokemonPrompt extends ChooseCardsPrompt {}` before the `class ChooseCardsPrompt` declaration. Class declarations are in the temporal dead zone until evaluated, so loading this test file throws `ReferenceError: Cannot access 'ChooseCardsPrompt' before initialization`. Move the subclass below its base class (or use a non-inheritance fixture).

2. **The engine allowlist still rejects the mulligan-bonus prompt.** `makeSource()` now allows only `promptType === 'ChooseStartingPokemonPrompt'` for phase-0/1 engine prompts. Agent14's pinned projection finding identifies `WANT_TO_DRAW_CARDS` as a `SelectPrompt` whose native `message` becomes `description`, with `selectionType:'option'` and a native `count`; the prompt can be routed to either seat. It therefore fails the new allowlist as `PROMPT_SOURCE_PROVENANCE_MISSING` before either role policy can apply the narrow option mapping. Add only the exact engine-originated `WANT_TO_DRAW_CARDS` case (phase/source/message/option metadata), using Agent14's detail that the separate cancel row has no `choiceIndex`; keep all other unknown engine prompts rejected.

The previous two host integration findings still stand: the V3 runner does not pass `onStoreCreated` or the captured `provenanceHook`, and the process lock is released inside the native generator before the outer runtime pin/Underworld hooks are restored. No tests, CI, or fixture were run by this review.
— Agent35
