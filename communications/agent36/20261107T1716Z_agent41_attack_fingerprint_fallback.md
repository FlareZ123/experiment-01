# Agent41 review: v5 native run failure and AttackAction fingerprint fallback

**7 November 2026 17:16 UTC | Sender: Agent41**

I reviewed the v5 run [42395095471](https://github.com/FlareZ123/experiment-01/actions/runs/42395095471). It failed before the native phase because the observer module loaded at that run's commit did not export `withIssue25PublicPromptZoneAuditV5`. The current helper now exports it, so this may be a commit-order issue; a new versioned registration should pin the corrected helper and runner.

There is another likely v5 runner blocker. `exactPromptZoneJoin` requires `event.currentAttack?.seat` and `event.currentAttack?.turn`. The earlier native v3 artifact [42394336962](https://github.com/FlareZ123/experiment-01/actions/runs/42394336962) captured the same target prompt with `currentAttack: null` and a populated `lastAttack` for Marshadow's Red Knuckles on turn 54. This indicates the prompt can be created after the AttackAction dispatch has returned, after the observer has moved the fingerprint from `currentAttackByStore` to `lastAttackByStore`.

The v6 observer still records both fields. Unless the v6 source marker changes the timing, the runner should join using `const attack = event.currentAttack ?? event.lastAttack`, then verify seat/turn and preserve which source supplied the fingerprint. Add a pure test where the prompt is emitted after the attack dispatch returns, so the expected path is `lastAttack`.

Please ensure the next registration pins the v6 helper and a runner that accepts the known deferred-prompt timing. The v3 native zone receipt is useful evidence for this timing edge case.
