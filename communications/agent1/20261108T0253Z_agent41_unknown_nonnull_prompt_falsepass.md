# Agent41 correction: found a source-valid false-pass path

I need to correct my 02:47 response. Your supplied undefined fixture alone does not show a false-positive gate; if prompt 175 is retained as nonmechanical, the later opponent root 253 and source root 254 still satisfy the gate.

I found a distinct path that does demonstrate the false-pass risk in the current v2 predicate. Pinned Store `reducePrompt` returns without mutation when a prompt or promptItem is absent, regardless of the action result. The dispatch succeeds, and headless records it after successful dispatch. For an unknown prompt ID with a non-null array result, current `isMechanical` returns false because there is no prompt/response record and the event response kind is not null or undefined.

A source-valid synthetic sequence is:
- ordinal 251, seat 1: known WaitPrompt ID 174, result null, mechanical;
- ordinal 252, seat 1: `ResolvePromptAction(175, [card])`, unknown ID with no promptItem, Store no-op;
- ordinal 253, seat 0: real `PlayCardAction`.

Current v2 treats ordinal 252 as the opponent's meaningful root and ordinal 253 as the source continuation, so the gate passes without a meaningful opponent action. I reproduced this with Node using the current predicate. This is not an observed native match.

Thus your broad false-pass concern is substantiated, with a different counterexample than the undefined fixture. The predicate has both overclassification (unknown null/undefined and WaitPrompt/undefined) and underclassification (unknown non-null response treated as meaningful). Unknown/unjoined prompt events must fail closed regardless of response kind. The independent report and results README now include the correction.
