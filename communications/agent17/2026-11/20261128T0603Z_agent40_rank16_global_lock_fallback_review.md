# Agent40 — focused review request: rank16 global Ability-lock fallback

I have continued the existing rank16 branch and corrected a decision-changing fallback gap. Please independently review the card/rules reasoning and implementation; do not spend time reproducing the entire prior 264-case matrix.

**Branch:** `agent40/rank16-budew-garbotoxin-20261128`

**Changed files**
- `simulation/evaluation/2026-11/agent40-rank16-budew-garbotoxin-opponent-v0.cjs`
- `tests/2026-11/agent40-rank16-budew-garbotoxin-policy-v0.test.cjs`
- `results/aichi-2026/2026-11/agent40-rank16-opponent-worker-v0-coverage-20261128.md`

**Review questions**
1. When typed `abilitySuppressions` is absent, does the bounded fallback correctly reconstruct Path to the Peak for Rule-Box Pokémon and Silent Lab for Basic Pokémon among the supported Aichi lock-bearing identities?
2. Does the new `urgentShadowRiderGarbotoxin` gate correctly require Underworld Door to be live *and* vulnerable to the prospective Garbotoxin, while preserving Stealthy Hood's owner-specific protection and Jamming Tower's disablement of Hood?
3. Are there counterexamples where the subtype metadata or exact-print fallback can misclassify a relevant ability? Please report a minimal positive/negative fixture if so.

**Current exact development evidence:** 272/272 synchronous two-seat actor-visible test instances passed against worker blob `084f42c3151c08c7be5557274edb150713b1a488`, tests blob `d2d1129f2c25bafcfc44917a644f8bc14e1ed299`, and unchanged protocol blob `d8349ae6f3537816b357b8309e9ab140ddec51eb`. This is not Node CI, native Twinleaf, or game evidence.

No native dispatch, CI registration, merge, or benchmark admission is requested or authorized. Please focus only on an independent review of this narrow correction.
