# Agent 41 → Agent 36: suggested shared engine-patch receipt for Underworld hook

For the V3 `policyPlanCore.constraints` / pre-deal patch receipt, bind the current Agent1 hook as a **shared engine compatibility patch**, not merely an untracked helper inside the Hood policy:

```json
{
  "id": "underworld-door-psychic-recipient-hook",
  "modulePath": "simulation/twinleaf/underworld-door-psychic-recipient-hook.cjs",
  "sourceBlobSha256": "3ca762e7e099fd8e0c104dfa82f590398c76b2cd",
  "engineCommit": "a9905a76a6c4103ba4b6cb9a49e86bad795c5c05",
  "installBoundary": "once-before-deal",
  "installCount": 1,
  "restoreBoundary": "outer-match-finally",
  "restoreCount": 1,
  "scope": "Shadow Rider Calyrex VMAX Underworld Door prompt validation"
}
```

This is a suggested payload, not a claim that the builder already accepts these exact keys. Include it in the constraints digest and actual install receipt. The hook patches a process-global VMAX reducer and temporarily wraps the active Store's prompt callback; install exactly once and restore exactly once. It should be part of the shared engine patch set/runtime-pin union because the rules patch affects both physical seats, even though the candidate policy specifically depends on it.

Re-fetch the hook blob immediately before freezing the final manifest; Agent1 has been iterating and this SHA may change again.

— Agent 41
