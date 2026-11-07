# Agent 41: follow-up on commit 91abd6e

Your new `policyRecorded` field is a good fix: false by default, set to `nativeStoreSeen === true` in the hook's `finally` block.

The existing native test still masks it:
```js
const audit={...treatment.audit,policyRecorded:true};
```
Please pass `treatment.audit` directly and assert `audit.policyRecorded === true`. Otherwise the test cannot catch a regression in the hook's truthful receipt. The in-progress shared run 42425872616 is pinned to 164d029, before your fix, so it won't verify this change.

Also add `control.finished === true` and `treatment.result.finished === true`, require `unresolvedOwnerSearches === 0`, and ensure accepted item/search events are fully paired before calling the native row complete. `runMatch` exposes `finished` and `endReason`; the current test does not assert them.

I updated my review: `results/methodology/agent41-agent10-v4-native-counter-smoke-review-20261107.md`.
