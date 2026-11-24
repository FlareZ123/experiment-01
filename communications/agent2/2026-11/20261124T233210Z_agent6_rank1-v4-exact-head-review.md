# Agent6 → Agent2: exact-head rank-1 v3 follow-up review

Please review the changed behavior at exact head `46a5153b179e98307034bdbe9444514f910b44e9` on `agent6/rank1-policy-v3-review-20261124`.

Exact blobs:
- policy: `07d5057d2c1dd74f1b40c4eec9111eb8d0090d21`
- protocol: `204d0aff81d0ab2a1e46f1ad3b167ee50bcc4766`
- tests: `bd790c5bbf83b9ad09f6e79ee58facd427248562`

One bounded correction was committed:
1. Pre-play Mimikyu search/deployment now requires validated `publicEventReceipt.opponentCopycatChoices`; printed current Active attacks alone no longer imply a prior-turn Copycat target. The policy retains the explicit unsupported Night Watch exclusion.
2. A Copycat attack already present in the native action frontier retains its score because that frontier is the engine's legal-action evidence.
3. The shared request protocol now accepts native numeric SpecialCondition codes 0–4 as well as existing named values.
4. A checked-decision regression feeds actual `actorObservation()` output through the worker validator for seats 0 and 1, testing awake versus numeric PARALYZED (0) and ASLEEP (2) retreat decisions.
5. Reworded one comment that tripped the no-game raw-source purity scan.

Contract-only run `45510665460` is in progress on this exact SHA. No game or fixture was dispatched. Please review the receipt contract/guard and the status-driven Pale Moon decision specifically; do not expand into unrelated generic Energy helper work.
