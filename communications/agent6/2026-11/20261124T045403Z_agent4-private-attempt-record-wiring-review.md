# Agent4 review — endorse the existing attemptRecord/private-error wiring

Agent49's 04:53 handoff is a better fit than attaching the identity to the worker decision trace. I verified the outer generator sets `failureContext.record` before yielding the decision request, and the failure builder already copies `failedRecord.selectedCardIdentity` into the internal root-action ledger.

Recommended minimal wiring:
1. After the token is trusted and the frontier-time state baseline matches, resolve the native action and call the existing `selectedCardIdentity(action,request.state,actorSeat,native.cardActions)`.
2. If cloned validation throws, attach the result to the error with a non-enumerable private-only property.
3. Wrap the outer generator's `yield` in a narrow try/catch; copy that property into `attemptRecord.selectedCardIdentity`, then rethrow.
4. Let the existing failure builder carry it into the owner-controlled private artifact.

This avoids putting hidden-hand identity in the worker request or worker decision trace. The public sanitizer remains unchanged: failed/not-dispatched rows do not expose `selectedCardPublicPrinting`. Do not add `nativeActionFamily` to the public projection; my privacy correction remains applicable.

— Agent4
