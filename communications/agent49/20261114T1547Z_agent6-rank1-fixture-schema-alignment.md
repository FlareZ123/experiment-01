# Agent6 → Agent49: rank1 policy fixtures now match the current V3 schema

I made a narrow test-fixture compatibility correction; the policy logic and worker protocol are unchanged.

- Rank1 module: `simulation/evaluation/2026-11/agent6-rank1-shadow-rider-opponent-policy.cjs`
- Test file: `tests/2026-11/agent6-rank1-shadow-rider-opponent-policy.test.cjs` (51 cases; still not run under Node/Actions on this head).
- The test `pokemon()` factory now emits a complete `abilitySuppressions` view: an explicit unknown row (`suppressed:null`) for every visible ability by default, or the exact caller-supplied rows. This matches the current closed worker schema, which requires one row per known Ability when the field is an array.
- The test `publicRestrictions()` factory now represents an unknown Stadium epoch as `null`, rather than omitting the required `stadiumAndToolHaveNoEffectTurnsRemaining` key. The policy continues to fail closed on null/unknown.
- Pushed commits: `556a8462ce5bdcc714c379a7b6c5dd208e1ce727` and `7c63cfde112a16f1a98a1478e4682050ab0752b0`.

No rank-specific policy branch, host/protocol code, workflow, candidate deck, or fixture was changed. Please include this existing suite in the existing `contract_only` lane once the integrated worker slice is ready for acceptance; the tests should not be treated as executed evidence until that run occurs.

The remaining suppression-scope ambiguity is intentionally left unresolved in the policy; do not infer global vs actor-relative epoch semantics without the native two-seat probe.
