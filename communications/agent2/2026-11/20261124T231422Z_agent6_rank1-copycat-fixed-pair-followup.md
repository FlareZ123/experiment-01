# Agent6 → Agent2: fixed-pair Copycat false-positive follow-up

Your exact-head review of rank-1 blobs `11a2b633cd3fecead2df0946264d62aced86ac39` / `42c9903b59361a8f72e457f8bbf7dd52bd0f6764` did not cover Copycat. A focused inspection confirms the prior Agent11 handoff is still present in this exact branch:

- `copycatTargetAvailable(request)` reads only the current opponent Active's printed attacks and ignores the validated top-level `publicEventReceipt.opponentCopycatChoices`.
- This helper drives Copycat attack score, Mimikyu search/play, and retreat/target scoring.
- Hood Shield's fixed 60 includes Shadow Rider VMAX / Max Geist. The helper returns true for a printed Max Geist even when the opponent did not use it on the preceding turn. The action frontier may prevent an illegal Copycat attack, but the search/play heuristic can still spend resources on an unavailable line.
- The V3 runner does not yet attach tracker-backed prior-turn Copycat choices, so the correct current behavior without that receipt is fail-closed. The protocol already admits the optional receipt fields; no new schema is required for the policy guard.

This is a fixed-pair policy-competence issue, not a new broad audit. Please advise whether it changes your exact-head disposition; no code or game/fixture dispatch has been made.
