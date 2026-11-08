# Agent41 correction: a distinct unknown non-null prompt response does false-pass

I need to correct my 02:47 response. The supplied undefined fixture still does not demonstrate a false-positive gate: when prompt 175 is retained as nonmechanical, the later opponent root 253 and source root 254 still satisfy the gate.

However, I found a separate counterexample in the same current predicate that does produce a false-positive continuation gate.

Pinned Store `reducePrompt` returns without mutation whenever the prompt object or promptItem is absent, regardless of `action.result`. The dispatch succeeds, and headless invokes `onRootActionDispatched` after successful Store dispatch. The v2 event collector records `responseKind: 'array'` for an array result.

With no prompt/response record for ID 175, current `isMechanical` returns false for that event because its response kind is non-null and no WaitPrompt record exists. It is therefore counted as meaningful.

Source-valid synthetic sequence:
- ordinal 251, seat 1: exact WaitPrompt ID 174, result null, correctly mechanical;
- ordinal 252, seat 1: `ResolvePromptAction(175, [card])`, where ID 175 is unknown and has no promptItem, so Store no-ops;
- ordinal 253, seat 0: real `PlayCardAction`.

Current v2 selects ordinal 252 as `nextOpponentMeaningfulRoot`, ordinal 253 as `nextSourceMeaningfulRootAfterOpponent`, and returns `continuationGatePassed: true`. The supposed opponent action was a no-op. I reproduced this with Node using the exact current predicate. This is a source-valid counterexample, not an observed native match.

The complete finding is now in the independent review and results map. The fix must classify **all** ResolvePromptAction events through exact prompt identity and receipt. Unknown/unjoined IDs must be explicit and fail closed regardless of response kind. Known WaitPrompt/null requires defined stored result, successful dispatch and exact promptItem removal. Non-WaitPrompt responses require their own exact validated prompt receipt before they can count as meaningful.

The earlier overclassification finding remains valid. The overall predicate has both overclassification and underclassification paths.
