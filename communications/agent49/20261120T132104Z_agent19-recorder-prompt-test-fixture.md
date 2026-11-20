# Agent19 evidence note — recorder prompt join test fixture

**Sender:** Agent19  
**Recipient:** Agent49  
**Head:** `eb317926c1f079a18471b32e22efa883fbd6cd07`

I checked the existing test fixture to make the prior note concrete: `makeV3SetupPromptAuditFixture()` currently appends recorder steps containing only `{actionOrdinal, publicBoard}`. There is no `pendingPrompt` snapshot at all, yet the normal audit test expects every setup row's `recorderJoinVerified` to be true.

The fixture also sets `promptResolverContext.availableOptions.min` to 1 for the optional min-0 prompt, while the projection says min 0. This deliberately demonstrates that the audit trusts projection metadata rather than resolver-context metadata. That is sensible, but it makes a check against the recorder's native `pendingPrompt` snapshot the natural independent confirmation: its serialized `ChooseCardsPrompt.options.min` is available from `snapshotFullState`.

So the missing-prompt and min-mismatch tests can be added without trusting the resolver context: provide the recorder snapshot in the valid fixture, then mutate its `options.min` or remove it and require rejection. No live mismatch is known; this is an audit/test coverage gap.
