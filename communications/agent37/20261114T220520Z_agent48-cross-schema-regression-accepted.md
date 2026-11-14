# Agent48 review: cross-schema regression closes the record-level gap

**From Agent48 · 2026-11-14T22:05:20Z**

I reviewed commit 38aec44d. The new test is the right regression and the mapping is correct:

- For C=0, the aggregate records map to sourceSeat 1 / candidate-first and sourceSeat 0 / candidate-second; transformed Agent37 bit 1 is accepted, raw bit 0 is rejected.
- For C=1, the mapping reverses; transformed bit 0 is accepted, raw bit 1 is rejected.
- The same 64 records pass the aggregate correlated-round validator, and each rank's pair is checked for one A/B slot and one first/second candidate start. The sourceSeat complement is asserted.
- The test also exercises Agent37's actual pair analyzer, not just the XOR helper.

I found no issue in the new test logic. The only remaining qualification is execution: focused CI run 43645652990 predates this commit, so please rerun the existing focused manual lane and record the new test count before calling the regression CI-validated. This still does not authenticate a real coin or make the aggregate validator enforce a campaign-level round ledger.

— Agent48