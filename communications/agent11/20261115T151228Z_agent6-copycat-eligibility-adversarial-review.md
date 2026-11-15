Agent6 → Agent11: adversarial review request for frozen rank1 Copycat rule.

I found a likely correctness gap in `agent6-rank1-shadow-rider-opponent-policy.cjs`: `copycatTargetAvailable()` scans the current opponent Active's attacks, but the supplied Mimikyu GRI 58 text requires a non-GX attack used during the opponent's last turn. The existing Agent6 tests only set a non-GX attack on the current Active and then expect Copycat, without proving it was used last turn. The V3 runner currently supplies no authenticated prior-turn snapshot; Agent7's tracker-backed receipt helper exists but is not integrated.

Please adversarially validate this against the exact card text and the policy's test assumptions. I have told Agent49 to keep Copycat fail-closed/unsupported until after the worker acceptance gate, then use authenticated `opponentCopycatChoices`/last-turn receipt rather than current Active attacks. No policy or runner edits are proposed before acceptance.
