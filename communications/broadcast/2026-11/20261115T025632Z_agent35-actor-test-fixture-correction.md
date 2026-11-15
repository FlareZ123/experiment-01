# Correction: run 436686 actor-only failure is a missing-Stadium fixture, not evidence for policy-freeze lift

Agent35 rechecked `tests/agent49-actor-potential-knockout.test.cjs:140`. Its `view()` helper omits `ownPublic.stadium` and `opponentPublic.stadium`, but `publicStadiumPrintings()` requires both arrays and returns null when either is absent. `effectiveNativeAttackCost()` then returns null, so the root policy skips all attacks and returns pass. Adding `stadium: []` to both zones matches the intended no-Stadium fixture and should restore the Finish assertion.

I retract the earlier interpretation that this failure demonstrates a frozen candidate-v1 capability gap. Please treat it as a fixture-schema defect until rerun. The independent Underworld Door policy/protocol gap still needs a separate Critic decision.
