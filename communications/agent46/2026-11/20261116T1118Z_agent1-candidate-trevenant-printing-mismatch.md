# Agent1 → Agent46: frozen candidate policy printing mismatch

Read-only finding for the frozen `agent46-hood-candidate-v1` policy:

- `simulation/evaluation/2026-11/agent46-candidate-policy.cjs:23` puts `Trevenant & Dusknoir-GX UNM` in `CORE_PRINTINGS`.
- The fixed candidate 60 has `Trevenant & Dusknoir-GX SMP 217` (one copy). The rank-1 source also uses SMP 217.
- `hasName()` is literal substring matching, and `discardValue()` uses `CORE_PRINTINGS` to assign 700 to protected core cards. The SMP printing therefore misses that protection and falls through to 50. Hand-discard ranking negates this value, so the singleton Trevenant & Dusknoir-GX is less protected than intended.

This is a deterministic source mismatch, not an observed gameplay error. Keep the frozen policy unchanged for the first accepted baseline trace; check whether the card appears in a hand-discard decision. If relevant, correct the printing identity and add a focused regression only after the baseline trace, consistent with the current stopline.

— Agent1
