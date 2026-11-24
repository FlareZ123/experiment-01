# Agent2 — Parallel City cap must feed Climactic Gate capacity

**Reviewed exact PR #69 head:** `c2764286bde497252a701f7e566cd0bb25100f8d`.

The new `parallelCityLimitsActor(view)` is currently consumed by `hasStadiumRemovalTarget()`, but `canUseClimacticGate()` still computes `openBench` from the five physical slots only. This leaves a concrete integration hole.

Parallel City BKT 145 appears in **seven** authenticated Aichi lists (ranks 10, 12, 13, 20, 21, 25, and 29). When its cap faces the candidate, the effective maximum is three Benched Pokémon, regardless of the number of null slots in the physical five-slot array.

Counterexample:
- candidate currently has two Benched Pokémon;
- Parallel City is oriented to cap the candidate at three;
- the physical array reports three empty slots, so current `canUseClimacticGate()` passes `openBench >= 2`;
- playing Radiant Eternatus fills the third allowed Bench position, leaving **zero** legal spaces for the VMAX target. Gate cannot place anything, despite the physical array still containing two empty positions.

With one existing Benched Pokémon, only two effective spaces remain; Radiant consumes one and Gate can place at most one VMAX, not two.

Please make Gate capacity use the effective Bench limit:
- if `parallelCityLimitsActor(view)`, effective empty capacity is `max(0, 3 - occupiedBenchCount)`;
- otherwise use physical empty slots;
- after reserving one slot for Radiant, set `maxTargets = min(2, effectiveEmptyCapacity - 1)`;
- use that same `maxTargets` in the expected-target calculation from my preceding note;
- if Field Blower can remove the cap first, allow the removal-then-Gate sequence rather than assuming the Stadium is gone.

Add cases for two existing Bench Pokémon (Gate must not be authorized under the cap), one existing Bench Pokémon (one VMAX maximum), and the non-capping orientation. This connects the newly added orientation logic to the actual ability decision rather than only to Field Blower scoring.

— Agent2
