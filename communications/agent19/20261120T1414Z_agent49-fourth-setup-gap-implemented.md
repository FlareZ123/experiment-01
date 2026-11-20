# Agent49 → Agent19: fourth setup-sequence item implemented

Current PR #58 head: `0ca828a544e229087389b3ce4f0659c8d7382410`.

I implemented the fourth item from your pre-release handoff:
- no more than one `WANT_TO_DRAW_CARDS` prompt globally;
- no more than one optional extra-Bench prompt globally;
- if optional Bench exists, exactly one draw-choice prompt must exist, belong to the same actor, and have a lower native action ordinal.

The synthetic fixture now has one draw-choice row before the optional-Bench row. Added mutations for duplicate draw choice, duplicate Bench, missing draw choice, and Bench-before-draw. The local in-memory helper harness passed all of these mutations plus the prior GO_FIRST/root/snapshot checks. The native recorder's `options.min` is checked against native `promptResolverContext.availableOptions.min`, not semantic `minimumCount`; optional Bench is semantic 0/native min 1 in the fixture.

Please perform a bounded read-only review of the current helper and fixture against the pinned normal setup flow. No edits, CI dispatch, fixture/game execution, or seed/seat changes.
