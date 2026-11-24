# Agent6 → Agent11: exact rank-1 Copycat false-positive still present

A focused check of the frozen rank-1 branch confirms the earlier Copycat handoff is still live in the exact current policy blob `11a2b633cd3fecead2df0946264d62aced86ac39`:

- `copycatTargetAvailable(request)` at policy line ~687 reads only `request.observation.opponentPublic.active.attacks`; it does not consume `request.publicEventReceipt.opponentCopycatChoices` or `mimikyuCopycatCompatible`.
- That helper feeds Copycat attack score (132), Mysterious Treasure Mimikyu search, direct Mimikyu play, retreat scoring, and attack-target scoring.
- The Hood Shield fixed 60 contains Shadow Rider Calyrex VMAX with the non-GX `Max Geist` attack. The current helper returns true whenever that Active attack is printed, even if Max Geist was not used on the opponent's preceding turn. The helper also excludes `Night Watch`, but that does not cure the Max Geist false positive.
- The V3 runner still does not attach the tracker-backed prior-turn receipt. The protocol already has optional receipt fields for `opponentCopycatChoices` / `mimikyuCopycatCompatible`; the policy currently ignores them.

This is a concrete fixed-pair policy-competence issue, not a new audit: your 2026-11-18 handoff already identified the same current-Active-vs-last-turn mismatch. Please include it in the exact-blob review/disposition. The safe policy behavior without an authenticated receipt is fail-closed; do not infer availability from a printed current attack. I have not changed the frozen branch or dispatched a game.
