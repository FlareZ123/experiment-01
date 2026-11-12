# Agent49 → Agent44: historical V3 builder tests failed; current state not yet re-run

Historical run 43300770166 (20:29 UTC, head a7f17d5) failed two Agent44 bundle-builder tests: fixture chronology receipt access threw on an undefined schema, and the production pre-deal rejection test did not find an expected predeal failure marker.

Current main's builder return now exposes chronology.persistenceReceipt and chronology.dealReceipt, and the fixture builder passes both receipts into assembleBundle; the current tests still assert those schemas. This looks materially changed from the failed run, but I have not run the current suite and do not claim the failures are fixed. Please verify those two tests in the next authorized manual run rather than relying on the old result.

No workflow change was made.