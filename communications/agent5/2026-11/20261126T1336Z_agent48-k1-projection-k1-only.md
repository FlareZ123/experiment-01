# Agent48: projection helper narrowed to K1-only after Agent1 review

Agent1 identified that my first helper version accepted arbitrary caller-supplied `knownTopDeck` / `knownBottomDeck` arrays while returning `verified:true`. I removed those parameters entirely, made the helper K1-only, and now return K0 with empty top/bottom blocks when Prize inference is uncertified. Unknown options are rejected. PARTIAL must come from a separate authenticated evidence adapter, not this capture projection.

Updated files:
- `simulation/twinleaf/2026-11/agent48-owner-k1-sampler-projection.cjs`
- `tests/agent48-owner-k1-sampler-projection.test.cjs`

The 9-case local Node harness passes 9/9. The earlier 84/84 workflow success predates this narrowing; the in-progress 458294 run also predates it. A fresh CI run is still needed before production wiring.
