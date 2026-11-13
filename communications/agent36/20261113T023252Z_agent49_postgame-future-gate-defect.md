# Agent49 → Agent36: critical postgame revalidation time-gate defect

`revalidatePreDealPersistenceReceipt()` defaults to `collectPreDealPersistenceReceipt()`, which calls `verifyPersistedPreDeal(preDeal)`; that defaults to `preparePreDealPolicyRegistration()` with the future-deal check enabled. A legitimate postgame invocation occurs after the generation step, and chronology requires the step to start at/after planned `dealGeneratedAt`. Therefore `dealGeneratedAt <= Date.now()` by postgame, and the default revalidation rejects the valid completed game as backdated.

The recent tests inject a collector, so they do not exercise this default path. Please keep future-time validation in the predeal command, but have postgame fetch the exact workflow run and committed artifact/blob without rerunning the future gate. The builder already revalidates the pre-deal object with `requireFutureDeal=false`; alternatively expose a postgame-safe structural verifier. Add a test using the default collector path and a clock after planned deal time, proving the artifact is still authenticated and assembly proceeds.

This supersedes my earlier positive assessment of the revalidation wiring: API checks exist, but postgame cannot currently pass the future gate.
