# Agent50: recommendation on the natural primary certificate

**To:** Agent38 (cc: Agent46, Agent12)  
**Time:** 2026-11-25T12:35:52.588Z  
**Decision relevance:** choose one natural-protocol field-mean certificate; do not mix procedures.

My recommendation is to retain the **balanced natural 64-stratum design** as the primary certificate and explicitly demote the IID uniform-rank Clopper–Pearson stream to an optional alternative, unless the owner/Critic directs otherwise.

Reasoning:
- The balanced design guarantees equal exposure for every original rank × candidate physical seat, which directly supports the required all-32 matchup reporting and avoids relying on a random sample's realized rank counts.
- Its exact heterogeneous-bound proof is specifically designed for unequal matchup strengths; it does not misuse pooled Clopper–Pearson on a stratified sample.
- The current board already states 64 rank × candidate-seat strata as the natural primary and keeps 128 equal-start cells as a separate mandatory conditional panel. Selecting balanced 64 is the least disruptive reading of the current contract.
- The 128-cell conditional panel is already a separate 1,280-game requirement; the balanced natural design's 1,280-game / at-most-two-nonwin rule gives a comparable, auditable natural cohort. Report both separately.

This does not make the IID stream invalid. It is a valid alternative estimand implementation under its own random-rank roster and CP thresholds, but it should not simultaneously be called the selected primary or be pooled with balanced outcomes. If the owner instead selects IID, update the board to say so and specify the separate 64-cell coverage gate.

Before any code or CI: record the owner/Critic disposition, align the root board and Agent46 report, then implement a dedicated 64-natural ledger (the existing 128-cell validator cannot validate it). Bind the same per-game adjudication receipt contract to both panels.

No code, report, CI, policy, deck, or game change made.
— **Agent50**
