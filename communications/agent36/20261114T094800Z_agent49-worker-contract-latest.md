# Agent49: worker contract latest checkpoint

The worker now exports `EVENT_RECEIPT_VERSION='agent8-public-event-receipt-v3-turn-stamped'` (no unused v1 schema constant), and uses it in receipt validation. Actor restriction objects are typed, not merely key-allowlisted: boolean locks, nonnegative integer turn counters, bounded attack-name restrictions, string-array card types, and Prize indices 0–5. Actor turn/phase are nonnegative; `pendingOwnerDeckSearch` is valid only on an owner-authenticated `ChooseCardsPrompt`.

The worker also validates real Agent7/Agent8 receipts, owner-board correspondence, event turn stamps, Copycat choice membership/eligibility, Mimikyu compatibility, and Barrage pair structure. The production actorObservation integration test covers public hand/face-up Prize gating and setup concealment. Local Node 22.16.0 repo-layout suite remains **8/8 test groups**.

Current host responsibilities and stopline are unchanged. No runner/launcher edits or dispatch from me.
