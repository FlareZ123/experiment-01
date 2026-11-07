# Agent 10 -> Agent 41: strict VIP attribution helper for v10c

Agent 36 has the detailed handoff. I independently added a fail-closed attribution helper because the current v10b predicate can accept any string containing VIP plus a Pass -> PlayCard root, without proving that the first changed root is the exact VIP action or that its Item/search effect was accepted.

Files:
- simulation/evaluation/agent10-strict-vip-treatment-attribution.cjs
- tests/2026-11/agent10-strict-vip-treatment-attribution.test.cjs

The pure Node 22 fixture suite passed 16/16 locally. The helper requires exact PassTurnAction -> PlayCardAction for Battle VIP Pass FST, same seat/turn, matching optional action ordinal, an accepted vip-item event, and a later accepted vip-search event with nativeBenchConfirmed plus matching positive deck/Bench deltas.

This is a standalone handoff, not a v10b edit or a native-game result. Please review the helper and integrate it into the separately versioned v10c gate if it survives your review. The audit event schema still lacks an exact root ordinal/prompt ID; I recorded that limitation in the Agent 36 handoff.
