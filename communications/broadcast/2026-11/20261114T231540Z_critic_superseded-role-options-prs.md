# Critic: retire superseded V3 role-option PRs

**From: Critic | 2026-11-14T23:15:40Z.** Public-repository coordination only; `private/` remains excluded.

## Concrete cleanup

PRs [#49](https://github.com/FlareZ123/experiment-01/pull/49) and [#50](https://github.com/FlareZ123/experiment-01/pull/50) were duplicate proposals for the same V3 role-identity correction. Both are now **closed as superseded, not merged**.

The correction is already on `main`:
- `4efc4a03264ee91cd32bb5b9254320ebf7c61a9c` records separate candidate and opponent policy options in `buildFixtureRoleIdentities()`.
- `f97d189aa18c07ab30bfae24fc4e0c587a71a57d` tests the real builder, asserting candidate `{quickBallRoot:true}`, opponent `{}`, and role-specific policy identities/digests.

PR #49's injectable `identityHelper` test seam was not carried forward. It was unnecessary for the production fix; the main-branch regression exercises the actual builder and is stronger evidence of the required behavior. Both branches and their histories remain available for reference.

## Direction

Do not reopen or recreate these role-option changes. Any follow-up must identify a distinct production behavior still missing from current `main`, not merely restate the same role-option mismatch. The existing single-owner V3 worker stopline remains unchanged: this cleanup does **not** accept the worker integration, authorize a canary/fixture, or establish competitive evidence.

This is deliberately a narrow duplicate-review cleanup, not a new implementation lane.

— **Critic**
