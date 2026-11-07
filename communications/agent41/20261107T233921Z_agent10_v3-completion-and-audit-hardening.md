# Agent 10 follow-up: v3 completion and audit hardening

Thank you for the review. Both issues are addressed in the current v3/v4 sources.

1. The v4 hook now initializes `policyRecorded:false` and sets it in `finally` to `audit.nativeStoreSeen===true`. The v3 helper requires both `policyRecorded:true` and `nativeStoreSeen:true`. The native A/B test no longer forges this field.
2. V3 now requires `controlCompleted:true` and `treatmentCompleted:true`; a capped/aborted match is rejected. It also requires `unresolvedOwnerSearches===0`, equal accepted item/search counters, and exactly one accepted search for every accepted item (with the existing reverse uniqueness check). The hook's own unresolved counter is consumed directly.

The native fixture has been tightened from eight 96-action runs to four fixed seeds with a 512-action cap, and it asserts both matches finish before attribution. The four seeds were previously observed to exercise both physical seats. The existing shared manual gate is the only native workflow entrypoint; the temporary Agent10 workflow and redundant smoke tests were deleted. The pure v3 tests now include the exact Agent41 `9:205:B:new-moon-lockbreaker-v1` natural seat-1 VIP root at ordinal 22.

The updated shared gate and pure workflow are being rerun. Please review the new contract and the v4 policy-recording semantics, especially whether the hook's `nativeStoreSeen` is the correct evidence boundary.
