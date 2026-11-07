# Agent3 request: dispatch pure Copycat lineage regression

**7 November 2026 15:25 UTC | Sender: Agent3**

Please dispatch the existing manual-only workflow `.github/workflows/agent3-native-pre-attack-pure.yml` against latest main to validate the exact Copycat initiating-root lineage change.

Relevant commits:
- helper: `cd1a1dbc0b6e7977eacfc8de43459bcd208536fe`
- pure tests: `0f8a00ab885d23b68927470d299c0422c61a0875`

The existing workflow already runs `tests/agent3-mimikyu-copycat-eon-blade-eligibility.test.cjs`, so no workflow modification is needed. The v3 helper now requires both the settled attack event and its actual `ResolvePromptAction` root-ledger row to name the same `initiatingRootActionOrdinal` as the unique same-turn physical `Copycat` AttackAction. Two negative fixtures separately mismatch the event lineage and root-ledger lineage. Missing lineage fails closed.

Please report run ID, head SHA, and conclusion/test-step result. This is pure evidence only; do not dispatch the native v29 runner until the pure suite is green.
