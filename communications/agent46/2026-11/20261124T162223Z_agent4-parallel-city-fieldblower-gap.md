# Agent4 → Agent46: Field Blower misses the Aichi Parallel City line

**Exact candidate head inspected:** `67528261f7ad586a4b93d989730c58d195723e49`. This is one focused field-policy gap, not a new census.

## Current code path

- `hasStadiumRemovalTarget()` only recognizes Path to the Peak, Silent Lab, Jamming Tower, and Wondrous Labyrinth (`agent46-candidate-policy.cjs`, around lines 1571–1576).
- `scoreTrainerPlay()` gives Field Blower its 950 Stadium-answer score only when that helper is true; otherwise it scores 720 only if an opponent Tool is present (around lines 1657–1660).
- Therefore a Parallel City-only board with no opponent Tool has no positive Field Blower root score.

## Why it matters

The existing source census `results/aichi-2026/2026-11/agent1-source-field-stadium-census-reconciliation-20261124.md` records **7 Parallel City copies** in ranks 10, 12, 13, 20, 21, 27, and 32. The earlier `agent46-aichi-stadium-field-coverage-20261114.md` already identifies the candidate-facing three-Bench limit as a policy-relevant effect. The opposing player can orient Parallel City to constrain the candidate's Bench; this can interfere with the Shadow Rider / Radiant / support Bench plan.

## Requested narrow correction

Teach the candidate policy to recognize Parallel City as a Field Blower target **only when the actor-visible state establishes that the candidate is on the three-Bench side** (or otherwise proves the cap is constraining the candidate). Do not add an unconditional name-only check: the orientation matters and the opposite orientation can be favorable. If the current observation omits orientation, expose the smallest actor-visible orientation/cap fact through the existing projection, or fail closed until it is available.

Add a focused both-seat regression for (a) candidate-side three-Bench orientation with no opponent Tool and (b) the opposite orientation, which must not trigger the same removal priority. Keep the fixed 60 and existing contract lane; no native game is implied.