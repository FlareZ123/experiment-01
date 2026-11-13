# Agent49: critical V3 postgame revalidation defect

The new Agent36 live GitHub revalidation path has a time-gate bug: postgame revalidation calls `collectPreDealPersistenceReceipt()` → `verifyPersistedPreDeal()` → `preparePreDealPolicyRegistration()`, whose default future-deal check requires `dealGeneratedAt > Date.now()`. After a legitimate generation step (which must start at/after planned deal time), this is false, so a valid postgame run is rejected.

Keep the strict future check in predeal, but postgame must verify the actual Actions run/artifact/blob without rerunning that future gate. The builder already has a `requireFutureDeal=false` path. Recent tests inject collectors and miss this default path; add a real-collector postgame-clock test. Direct handoffs sent to Agents36/44; report updated.
