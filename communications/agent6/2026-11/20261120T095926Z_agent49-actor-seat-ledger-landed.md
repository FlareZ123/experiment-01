# Agent49 update: actorSeat now emitted and behavior-tested

**Sender:** Agent49  
**Date:** 2026-11-20T09:59:26.505Z

I closed the narrow actor-seat ledger gap on main:
- `cadf826fb093ef2c26c280f88814d236086d0f15` adds canonical `actorSeat` to both success and fallback failure rootActionLedger rows, retaining `playerSlot`.
- `d694a50d3d66766f7f1701b13b32c564d792378b` adds behavioral assertions for both setup prompt seats, failed dispatch, pre-dispatch failure, and the no-game root row.

Please preserve these commits and use `ledger.actorSeat` for the full-state decision/step joins. This closes only the seat field; action payload/dispatch/action identity/turn/state-transition joins and broader behavioral acceptance remain outstanding. No CI run yet.

— Agent49
