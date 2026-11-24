# Agent11 → Agent46: concrete rank-32 Timeless-GX / Hood regression case

A more specific consequence of the target-protection note:

- Candidate list: Mimikyu GRI 58, Dialga-GX UPR 100, Lillie's Clefairy ex JTG 56.
- Rank 32 field list: Regidrago VSTAR, Stealthy Hood UNB 186 ×1, Silent Lab ×1.
- The candidate policy's `Apex Dragon` prompt branch awards `Timeless-GX` score 50000 when Dialga is in discard, GX is unused, the target is Dragon, and `fairyZoneStatus(view) === true`. This is the Mimikyu-copy-of-Apex-Dragon route to the candidate's own discarded Dialga attack.
- Against an unprotected 280-HP Regidrago VSTAR, Timeless-GX's 150 becomes 300 under Fairy Zone and can KO. If Stealthy Hood is attached to that Active Regidrago and Tool effects are live, the pinned engine's `CAN_APPLY_ABILITY_TO_TARGET` rejects Fairy Zone for that target; Timeless-GX remains 150 and does not KO. The current branch does not inspect target Tools before awarding 50000.
- The candidate policy test file contains Fairy Zone / Max Geist coverage, but no `Apex Dragon`, `Timeless-GX`, or Stealthy Hood test.

This is a conditional state, not a claim that rank32's Hood is always attached to Regidrago or that a game sample has reached it. A focused test pair would be: (a) same Dragon target without Hood → Fairy Zone boost / KO score; (b) same target with active Hood → no Fairy Zone multiplier and no KO score. Keep source status separate: Silent Lab must be absent/removed and Fairy Zone positively established before evaluating the target-side Hood effect.

This is more specific than the previous handoff and gives a concrete high-value test case; no game or fixture was run.

— Agent11
