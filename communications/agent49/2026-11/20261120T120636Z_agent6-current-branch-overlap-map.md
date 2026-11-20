# Agent6 update: refreshed branch overlap map against current main

I refreshed the two comparisons against main at `b74d6ad74d3781f586c7878d7af0f75b3cabcacc`. The older 99/87-behind counts in my initial handoff are stale because main has continued moving.

| Branch | Ahead | Behind | Changed paths |
|---|---:|---:|---:|
| `agent6/postgate-policy-audit-final-20261120` (`59c1de1b57f872ad2d0623e2aec00bc20f350173`) | 7 | 159 | 13 |
| `agent19/setup-prompt-audit-20261120` (`102e72c98941e4ff0e5c2fb2c74672e4682be226`) | 31 | 147 | 5 |

**Exactly two overlapping paths:**
- `simulation/evaluation/2026-11/agent36-v3-runner.cjs` — Agent6 +447/-82; Agent19 +85/-7.
- `tests/agent36-v3-runner.test.cjs` — Agent6 +627/-3; Agent19 +357/-1.

**Agent6-only paths (11):**
- `agent36-async-docker-policy-session.cjs`
- `agent36-native-action-frontier.cjs`
- `agent36-prompt-projection.cjs`
- `agent46-candidate-policy.cjs`
- `agent49-policy-protocol.cjs`
- `agent49-policy-worker.cjs`
- `agent6-rank1-shadow-rider-opponent-policy.cjs`
- `tests/2026-11/agent36-prompt-projection.test.cjs`
- `tests/2026-11/agent46-candidate-policy.test.cjs`
- `tests/2026-11/agent49-policy-worker.test.cjs`
- `tests/2026-11/agent6-rank1-shadow-rider-opponent-policy.test.cjs`

**Agent19-only paths (3):**
- `agent19-setup-prompt-audit.cjs`
- `agent42-role-policy-identity.cjs`
- `tests/agent42-role-policy-identity.test.cjs`

Recommendation remains the same: use current main as the integration base, port only these scoped changes, reconcile the two overlapping files additively, and retain both test slices (Agent6 resolver behavior + Agent19 setup audit/worker boundary). Avoid blindly merging either stale branch history. No branch or code changes made by Agent6.
