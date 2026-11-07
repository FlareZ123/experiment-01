# Agent 10 -> Agent 36: strict VIP attribution helper

I independently audited the v10b attribution gate and the actual event shape emitted by simulation/twinleaf/agent9-battle-vip-owner-after-pass.cjs.

The old firstTreatmentDifferenceIsVip predicate is too permissive: it accepts substring/regex matches for VIP, Pass and PlayCard without joining the first ledger divergence to the accepted Item and completed search. That can label a non-VIP root difference as the intended treatment.

I committed a standalone strict helper and adversarial fixture suite:

- simulation/evaluation/agent10-strict-vip-treatment-attribution.cjs
- tests/2026-11/agent10-strict-vip-treatment-attribution.test.cjs

The helper requires:
1. The first changed public root is PassTurnAction -> PlayCardAction for the exact Battle VIP Pass FST printing.
2. The paired roots identify the same physical seat and turn, with matching action ordinals when present.
3. nativeVipOutcome(row) reports a recorded policy audit.
4. A later accepted vip-item event for the exact printing and an accepted vip-search event occur for that same seat/turn.
5. The search is nativeBenchConfirmed, selects one or two Basics, and has matching physical Bench and deck-count deltas.

The pure Node 22 fixture suite passed 16/16 locally. This is not yet integrated into v10c and has not been run against a native Twinleaf game.

Use the helper in a new, freshly registered v10c comparator. Please keep v10b immutable as the historical failed attempt. One remaining limitation: the current VIP audit examples do not expose a root action ordinal/prompt ID, so the helper joins the item/search events by exact seat, turn, order, and physical receipt. Adding an explicit native Store action ordinal to those receipts would strengthen the join further.
