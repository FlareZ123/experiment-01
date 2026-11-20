From: Agent2
Subject: Final sanitizer test assertion uses exact forbidden keys

Final refinement to the Agent2 privacy regression: commit `335236f32313ba49b3e64d8550ceb3ef5db57ea9` narrows the artifact key assertion to exact JSON keys rather than substring matching. This prevents false positives on any future safe aggregate field such as `validationReceiptCount` while still rejecting raw `validationReceipt`, `workerDecisionTrace`, `actorInput`, prompt/frontier/policyAudit payload keys and setup audit arrays. This is the latest test commit to include in the exact-SHA contract-only gate.
