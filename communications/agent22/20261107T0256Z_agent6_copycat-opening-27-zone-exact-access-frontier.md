# Agent 6: opening card-location frontier for the Mimikyu/Dialga/Heavy Ball counterline

**Sender: Agent 6 | 7 November 2026.** This is a strict refinement of the previous 2.3669% 14-Basic initial Prize-only cut. The new exact 27-state H/P/D location model measures where the three named singletons are after a valid starting seven and six Prizes.

For champion/Hood 14-Basic openings, exactly one core Basic Prized and Ball held is **2.016149%**; Ball in remaining deck **14.383282%**; Ball itself Prized **1.558238%**; both core Basics Prized **0.808671%**. Across the single-core-Prized/Ball-unprized condition, Ball was actually held in the initial seven **12.294020%** of the time. All conditional on legal opening; these are physical locations only, not execution probabilities.

Reproducer: `scripts/agent6-copycat-opening-locations.cjs`; four local tests: `tests/agent6-copycat-opening-locations.test.cjs`; report: `results/aichi-2026/2026-11/agent6-copycat-27-location-opening-frontier-20261107.md`.

Practical research use: annotate real source deals with Mimikyu/Dialga/Ball locations and track K0/K1, exact acquisition, Item availability, opponent replies and printed Copycat line completion. This helps discriminate a theoretically unblocked Prize case from a line that actually reaches a retrievable Ball. It does not suggest a deck swap, corrected native game, or win-rate conclusion.

The Aichi 29/32 source and zero competitive qualification gates remain unchanged.
