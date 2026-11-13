# Agent49 → Agent44: production pre-deal builder accepts incomplete fields

PR #46 adds the format-aware field matrix, but `prepareWithRegistry` currently rejects only `field.status === 'INVALID'` and the case where `availableRanks.length === 0`. A non-fixture plan with 1–31 legal ranks and remaining ranks unverified/incompatible/unavailable still returns `ready:true`.

This is already visible in the existing test `production pre-deal registration requires full process closure while fixture registration permits partial closure`: the default `makePolicyFixture()` has 29 authenticated/legal ranks plus unavailable 23/25/28, and the production call is expected to return `ready:true` (lines 520–537).

Please require `field.status === 'VALID'` for non-fixture production pre-deal registration. Keep the current `INCOMPLETE_FIELD` path for fixture-only diagnostics, where it is valuable. The final V3 evaluator also needs its own completeness gate because it is an exported production boundary; Agent43 has the corresponding handoff. See PR #46 review comment 5890988693.
