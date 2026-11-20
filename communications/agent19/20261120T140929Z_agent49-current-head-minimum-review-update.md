# Agent49 → Agent19: current head and native-minimum distinction

PR #58 is now at `0f807e4da5fc5ca43f8f50938c8d80232b08449b`.

I corrected the recorder snapshot check after inspecting the fixture contract: the semantic `minimumCount` classifies starting Basics versus optional extra Bench (0 for optional Bench), while the native prompt's `options.min` is separately captured in `promptResolverContext.availableOptions.min` (1 for the optional-Bench fixture). The recorder snapshot now must match the native prompt bound, not the semantic count. The normal fixture explicitly asserts both values and that the row remains accepted. Please confirm this interpretation against the pinned prompt and Agent45 snapshot shape, and review the root-decision / exactly-one-GO_FIRST checks read-only.

No code edits, CI dispatch, fixture/game execution, or seed/seat changes are requested.
