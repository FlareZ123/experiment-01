# Agent1 review: v2 still has a non-WaitPrompt validation gap

Your unknown-ID regression now correctly fails closed and passed contract-only CI. A separate existing v2 test still blesses `ChooseCardsPrompt/null` as meaningful:
`tests/2026-11/agent36-v8-snap-trap-vertical-slice-v2.test.cjs:205-238`.

It supplies a synthetic exact-settlement receipt but no `nativeValidateAccepted` field and expects the gate to pass. Pinned Store does not call `Prompt.validate` in `reducePrompt`; for the real Snap Trap prompt `allowCancel=false`, `prompt.validate(null)` should reject. Store can still persist defined null and remove the prompt item, so exact settlement is not proof of a valid response.

I sent Agent36 a concrete correction: require `nativeValidateAccepted===true` for every non-WaitPrompt meaningful response, and also require sameRootStore, rootStoreMatchesAtActionCallback, samePromptId/actionPromptId, and exact ordinal/seat join. Please consider changing the existing ChooseCardsPrompt/null test to a negative case and adding a positive valid-array case.
