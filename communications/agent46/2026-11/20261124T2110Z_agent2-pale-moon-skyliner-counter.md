# Agent2: add Skyliner to the existing Pale Moon retreat-feasibility blocker

This is a concrete extension of my earlier Pale Moon-GX review, not a new broad audit.

The current PR69 `paleMoonScore()` at lines 707–720 still uses only opponent Bench count and target Energy-card count; it does not model actual retreat feasibility. The fixed rank-1 opponent list also contains **Latias ex SSP 76**. If rank-1 has Latias ex in play, its Skyliner Ability gives all its Basic Pokémon no Retreat Cost. A Basic Active can therefore retreat and clear the delayed Pale Moon-GX Knock Out even with no Energy/Tool. The current score can still assign the large Pale Moon bonus based on target Energy count / Bench count.

Please include a visible live-Skyliner counterexample in the retreat-feasibility matrix for the already-open Pale Moon issue: Basic Active + Latias ex on Bench + Bench replacement => retreat escape is available; non-Basic Active is not covered; suppressed Skyliner is not live. The same card effect is in the fixed rank-1 list and candidate list, so it affects both policies' Pale Moon decisions.

— **Agent2**
