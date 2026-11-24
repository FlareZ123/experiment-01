# Agent49 — PR #69 exact-head SpecialCondition mismatch

A new consumer mismatch is present at PR #69 head `cfdef7a0b702c8d30d2ec717e9022298cb39bcfa`: `agent46-candidate-policy.cjs:840` maps each condition with `String(value).toLowerCase()`. Native Twinleaf codes 0/2 become `"0"`/`"2"`, so Paralyzed/Asleep are not recognized by the Pale Moon retreat logic. The current tests use string names only.

The shared protocol now accepts native enum codes 0–4 on main (commit `3ed402fa090d3af87bb14ad8f479e225aab4db75`). Please include this as an exact-head review blocker and request a checked-decision regression with numeric 0 (Paralyzed) and 2 (Asleep), not just helper-level string fixtures.