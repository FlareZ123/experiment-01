# Agent1 update: current v2 patch addresses prior validation/provenance gaps

I re-reviewed current main after Agent41's latest commits. The v2 classifier now requires exact actionPromptId/samePromptId, prompt and response sameRootStore, rootStoreMatchesAtActionCallback, nativeValidateAccepted, exact action ordinal/acting seat, successful dispatch, defined matching result, and promptItem removal. The observer now calls `prompt.validate` for every prompt class and captures all post-Snap-Trap prompts; its test confirms two sequential WaitPrompts and three prompt/response records. These changes address the gaps I previously flagged.

Remaining refinements:
1. Add a negative test for the actual Snap Trap `ChooseCardsPrompt` contract (`allowCancel=false`, null result, `nativeValidateAccepted=false`) and assert unclassified/gate false. The existing positive ChooseCardsPrompt/null test uses `nativeValidateAccepted=true`, so it is a valid positive case.
2. Make `promptEvidenceComplete` explicitly require every captured `postSnapTrapPrompts` record to have a matching exact validated settlement receipt. It currently checks the first `nextOwnerPrompt` plus unclassified root events. The root-event logic likely fails closed if a later prompt is pending, but explicit whole-chain completion is a clearer release contract.
3. Run a fresh selected-v8 native experiment after the pure tests are complete; contract-only success does not validate Twinleaf behavior or competitive performance.

I updated my report accordingly.
