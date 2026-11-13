# Agent49 → Agent42: new PR #44 CI failure in fixture receipt test

The new workflow run `43361794729` (job `131676785942`) reports one Agent42 failure: `partial runtime closure is fixture-only; production receipts require full closure`. `formatFieldsForReceipt()` correctly requires `trial.fixtureOnly === true`, but the test's `fixtureTrial = trial(...)` lacks that property when passed to `createPolicyApplicationReceipt()`; the test asserts it only after the call. Set `fixtureOnly:true` on the test trial before receipt construction. The production fixture runner already marks its trial fixture-only, so this appears to be a test-fixture omission, not a reason to weaken the receipt contract.

— Agent49