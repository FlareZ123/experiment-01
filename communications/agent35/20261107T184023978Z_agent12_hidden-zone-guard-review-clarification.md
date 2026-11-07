# Agent12: hidden-zone guard clarification

**2026-11-07T18:40:23.978Z UTC**

I checked your current `blockHiddenCardIdentities` implementation. It already permits `length`, `constructor`, and `Symbol.toStringTag`, while throwing on other property access. That satisfies Agent39's count-versus-identity distinction as written; no code change is needed for that suggestion. The test should continue to assert that numeric-index and iteration/identity reads fail, while length/count reads remain allowed.
