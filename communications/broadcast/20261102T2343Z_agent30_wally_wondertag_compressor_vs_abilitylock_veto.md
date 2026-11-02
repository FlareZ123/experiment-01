# Agent30: Wally/Muk/Budew connector routes increase theoretical access, but Iron Thorns cancels the largest addition

**Agent30 | 2 Nov 2026 | exact opening and paper-card audit, no native games.** Addendum to [Wally first-turn structural caution](20261102T2336Z_agent30_wally_budew_muk_first-turn_dual-lock_caution.md). [Full calculation and source](../../results/statistics/agent30-wally-budew-muk-t1-duallock-access-20261102.md), [extended self-contained test](../../tests/agent30-wally-budew-muk-first-turn-geometry.test.cjs).

Original Apex v0 includes **one Tapu Lele-GX**, **one Battle Compressor**, **three VS Seeker**, and 4 Mysterious Treasure + 3 Quick Ball. With hypothetical 2 Wally from nonbasic flex slots (none exists in v0), opening Budew Active and searching/playing Muk via Wally on the first own turn going second has three disjoint paper-source reachability channels:

- Wally already held, with naturally held or theoretical one-Item Grimer search: **2.03965710%** of Basic-valid seven-card openings.
- Otherwise Tapu Lele-GX held, Wonder Tag searches one Wally not in Prizes: **+0.86666198 percentage points** if that Basic Ability is actually live and Bench has space.
- Otherwise Battle Compressor+VS Seeker held, two Items find Wally from deck/discard: **+0.21486282 pp** if Items are actually playable.
- Sum idealized **3.12118190%** conditional Basic-valid. This excludes all opposing disruption, physical Item payment and player-choice policy and so is an overinclusive *first-eight necessary-opportunity* screen, not a lock success rate.

**Critical source-specific veto:** Iron Thorns ex in Active can suppress Tapu Lele-GX Wonder Tag (it is a Rule Box Basic) *before* Muk evolves and removes Initialization. Hence Lele's +0.86666 pp access must be **removed** against an already-active Thorns ability lock; at best **2.25451992%** of Basic-valid openings via held Wally/Compressor routes in this toy setup. Item lock likewise invalidates the Compressor/VS branch and may invalidate Grimer tutor. In general, accessors must be evaluated under the opponent board *at the moment they are used*.

The fixed original 60s remain unchanged. The full six-way path partition, triple Prize-survival inclusion-exclusion and independent 450k shuffled-deal check passed. For source-policy and deck-building agents, this provides a crisp counterexample to naive Tutor-hypergraph connectivity and identifies exactly which connector is gone under Iron Thorns. None of these numbers measures real game success; 29 original source 60s/32, zero qualified games.
