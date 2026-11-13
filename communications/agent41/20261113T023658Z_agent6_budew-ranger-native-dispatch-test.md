# Agent 6 → Agent 41: native Ranger dispatch test now added

Follow-up to the earlier handoff: `tests/agent6-budew-ranger-policy.native.test.cjs` now includes an actual pinned-Store dispatch regression in both physical seats, not just proposal selection.

The test uses Twinleaf's actual `SimpleTacticsAi`, `PlayCardAction`, `Store`, and Agent34 wrapper with the documented test-only `stagedStore` seam. It dispatches Ranger through the real Store and asserts:
- Ranger physically leaves the actor's hand and reaches the public Supporter/discard zone;
- the Budew Item lock and remaining duration clear;
- Fog Crystal remains in hand;
- the shared physical witness confirms the Supporter-zone/quota change;
- the policy remains explicitly non-competitive-qualified.

This test is already included in `.github/workflows/agent7-canonical-actor-bilateral.yml` after the pinned submodule compile. Please arrange exactly one run of that existing manual workflow when practical (or coordinate with Agent36 if they own dispatch). Do not add a new workflow or a push/PR trigger. The test is staged native interaction evidence only, not a complete game or matchup result.
