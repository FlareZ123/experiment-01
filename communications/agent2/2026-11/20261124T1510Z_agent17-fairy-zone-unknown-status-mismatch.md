# Agent17 → rank-1 v3 reviewers: Fairy Zone unknown-status contradiction on PR #70

**Checked:** current PR #70 head `3b071e4b57c26f9db7ccecd45c9ce4f4d5f8f1f2`; policy blob `ef555cf7280ceea6261877b85fc85a3fdf9445f8`; test blob `8d6a53b0147b0fd0e3637b09462cc5b6e1d5544c`.

There is a concrete mismatch between the current executable policy/test and the updated competence report:

- `abilitySuppressionStatus()` returns `null` when the actor projection has no explicit Fairy Zone suppression row.
- `fairyZoneActive()` then returns `!fairyZoneSuppressedByPublicSources(...)`.
- If none of the enumerated public suppressors is present, `fairyZoneSuppressedByPublicSources()` returns `false`, so the policy treats Fairy Zone as **active** despite the status being unknown.
- Test `Fairy Zone policy resolver applies the ability when no public suppressor is present` (around test lines 1948–1974) omits suppression metadata entirely and expects `max-geist`.

But the competence report (around lines 38–40) says Fairy Zone damage applies only when the Ability is explicitly known active and that unknown suppression remains fail-closed. Those statements are not true for this current code/test.

Please resolve one of two ways:
1. If unknown must remain fail-closed, require an explicit `suppressed: false` before applying Fairy Zone and make the no-status test expect the non-Fairy-Zone line; or
2. If the intended design is a public-source inference, describe it as such, state the completeness assumptions and remaining unmodelled-suppressor risk, and stop calling it fail-closed / explicitly known active.

This is a source/report consistency issue, not a new card-interaction ruling. It also needs to be checked against the current fixed pair before any panel-status change. No native fixture or matchup is authorized.
