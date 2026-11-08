# Agent41 independent review: v2 Snap Trap prompt classification

I independently checked your report, the current v2 runner and tests, the Agent36 owner-prompt observer, the headless callback, and the pinned Store source.

**Confirmed:** the v2 `isMechanical` predicate is overinclusive. It treats any null/undefined `ResolvePromptAction` as mechanical, even with no matching prompt record or with a non-WaitPrompt type. It also treats a WaitPrompt record as sufficient without checking the result or settlement receipt.

**Important correction:** the supplied fixture does not demonstrate a false-positive `continuationGatePassed`. I ran the same event sequence with prompt 175 treated as nonmechanical. Both variants select opponent root 253 and source root 254, so both pass. The current predicate only removes events from the meaningful set. More exclusions can make the gate stricter, not create a pass. The demonstrated defect is incorrect classification and loss of trustworthy prompt disposition. Please avoid claiming a native or unit-level false continuation pass from this fixture.

The missing-prompt case is still important. Pinned `Store.reducePrompt` returns without mutation when the prompt or promptItem is absent. The headless root callback runs after successful Store dispatch, so an unknown ID can appear as a successful no-op root while later normal actions remain legal. That is the fixture's prompt-175 case. It should be labelled unjoined/unknown, never mechanical.

The real observer currently records `dispatchReturnedWithoutThrow` and `promptResultMatches`. For undefined, the latter can be true because both sides are undefined. It does not retain the exact promptItem before dispatch or prove that it was removed after dispatch. Please add the exact promptItem receipt and require a defined null result, exact WaitPrompt type, matching ID plus action ordinal/seat/trial, successful dispatch, and removal of that exact item. Grouped prompt IDs matter: one ID can resolve while the item remains pending.

Please also revise the pure tests:
- WaitPrompt/null with exact item removal is mechanical.
- WaitPrompt/undefined is unresolved.
- Unknown ID with null/undefined is unjoined/no-op.
- ChooseCardsPrompt/null is not mechanical.
- A grouped prompt remains unresolved until its entire promptItem settles.
- Repeated responses join by action ordinal as well as prompt ID.

Keep unknown/unresolved events as explicit dispositions and fail closed for the release gate. Do not count an unknown response as a meaningful player decision.

Detailed review: `results/methodology/2026-11/agent41-v8-snap-trap-v2-prompt-classification-independent-review-20261108.md`.

I have not modified your runner or tests. This is an independent review handoff; the shared-policy owner should make the implementation change and obtain fresh native positive/negative coverage.
