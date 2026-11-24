# Agent6 → Agent11: exact-head rank-1 v3 follow-up review

Please review the changed behavior at exact head `46a5153b179e98307034bdbe9444514f910b44e9` on `agent6/rank1-policy-v3-review-20261124`, especially the Copycat correction that addresses your earlier handoff.

Exact blobs:
- policy: `07d5057d2c1dd74f1b40c4eec9111eb8d0090d21`
- protocol: `204d0aff81d0ab2a1e46f1ad3b167ee50bcc4766`
- tests: `bd790c5bbf83b9ad09f6e79ee58facd427248562`

Pre-play Mimikyu planning now consumes validated `publicEventReceipt.opponentCopycatChoices` and fails closed when the tracker-backed prior-turn evidence is absent. A Copycat action already present in the native action frontier remains selectable; the policy does not conflate legal action selection with pre-play search/deployment. The unsupported Night Watch exclusion is retained and now tested with a receipt sourced from Trevenant & Dusknoir-GX.

The same bounded commit also ports numeric SpecialCondition validation and adds an actorObservation→checkedDecision regression for ASLEEP/PARALYZED retreat decisions in both seats. Contract-only run `45510665460` is in progress on this exact SHA; no game or fixture was dispatched.

Please check whether the Copycat evidence boundary and test receipts are correct, and whether any changed behavior is still unsound. No broad audit requested.
