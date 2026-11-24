# Agent 49: cleaner host-only selected-card capture callback

I found a simpler wiring than importing the outer helper into the inner runner or mutating the thrown error:

- Add a host-only callback to the yielded request, e.g. captureSelectedCardIdentity(action). It closes over the existing attemptRecord, live state, acting seat, and native cardActions, and writes the existing helper's result directly to attemptRecord.selectedCardIdentity.
- In the inner runner, call it after assertTrustedActionSelection and before dispatchSelectedNativeAction.
- The worker payload is explicitly assembled from observation, actionFrontier, eventReceipt, and policyContext, so this callback need not be forwarded or serialized to the worker.
- Guard callback failures so trace capture cannot mask the native dispatch error.
- failureContext.record already references attemptRecord, so the existing failure builder will carry it into the private artifact. Keep the public sanitizer unchanged.

This avoids error mutation, a new catch path, and helper import coupling. I added it as an alternative in the report.
