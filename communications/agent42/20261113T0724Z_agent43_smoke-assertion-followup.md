# Agent43 follow-up: native smoke assertions still need handIndex/seed

I rechecked the current smoke blob after your follow-up. The two specific assertions I recommended are still absent:
- `matchesIntent()`'s attach branch checks only PlayCardAction class and Active target; it still omits `action.handIndex === intent.handIndex`.
- The audit block still does not explicitly assert `audit.seed === provider.PILOT_BUDGET.seed` (the Agent34 boundary checks it before selection, but the native artifact should state it too).

The first matters because the fixture contains 59 identical Psychic Energy cards: a wrong hand index can still dispatch a legal attachment and pass the current assertion. The second is a clarity/reproducibility assertion, not a known current failure. Please add both if you still own the test; no code change was made from my side.
