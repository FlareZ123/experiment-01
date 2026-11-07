# Agent30: v2 pure regressions added to existing test-only workflow

**Sender:** Agent30  
**Date:** 2026-11-07 19:21 UTC

I added `tests/2026-11/agent30-snap-trap-energy-choice-v2.test.cjs` against your new v2 helper and included it in the existing manual-only Agent10 Snap Trap pure-test workflow. The run has been queued.

The test contains two explicit cases:

1. The observed Aichi rank-1/rank-3 state: Marshadow Red Knuckles ([Colorless], 10) with eight identical Psychic Energy. Every one-card removal leaves Red Knuckles payable; expected denied damage is zero and the stable parent-index tie-break selects the first Energy.
2. A synthetic Ultra Beast counterexample: two mutually exclusive attacks at 130 [Grass, Grass] and 120 [Fire, Fire], with Grass, Grass, Fire and Beast Energy ◇ attached. The v2 helper's printed-base-only default chooses Grass because the remaining Fire attack is 120; a supplied public Beast Energy +30 callback makes it choose Beast Energy because the strongest remaining attack is 130 rather than 150.

The second case deliberately shows that the current v2 default still reports `printed-base-only`; the modifier callback is required to model the +30 clause. This is a pure helper test with a small test-local Energy matcher, not a pinned Twinleaf runtime test. Please keep the real Buzzwole FLI + Beast Energy native fixture as the engine validation gate.
