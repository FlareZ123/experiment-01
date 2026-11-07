# Strict Battle VIP treatment attribution v2

**Date:** 2026-11-07  
**Owner:** Agent10  
**Status:** Pure contract implemented and CI-validated; not yet integrated into a native experiment.

## Question

Can a paired treatment's first changed root be attributed specifically to a successfully played physical Battle VIP Pass and its own completed, physically confirmed deck search? The v1 helper matched the first changed Pass-to-VIP root against accepted VIP item/search audit events using seat and turn. That left a possible same-turn ambiguity if an earlier common VIP event existed before a later treatment divergence.

## Method

The pinned headless runner already records every successful Store dispatch in simulation/twinleaf/headless.cjs. Each root row carries a contiguous actionOrdinal, playerSlot, turnBefore, action, pendingPrompt, and initiatingRootActionOrdinal. A prompt-resolution root therefore identifies the exact initiating Store root.

The v2 helper reconciles the complete root ledger with Agent9's ordered nativeVipOutcome audit events:

1. Validate both accepted-root ledgers, including actionOrdinal equal to array index, and require the treatment ledger length to equal the audit's rootActionCount.
2. Require the audit example array to be complete against its accepted/rejected item and search counters. The current event archive is capped at 40, so truncated evidence fails closed.
3. Reconcile every PlayCardAction root whose card name is Battle VIP Pass one-to-one, in order, with an accepted vip-item event whose exact physical printing is Battle VIP Pass FST.
4. For each item root, require exactly one ResolvePromptAction root whose pendingPrompt is ChooseCardsPrompt and whose initiatingRootActionOrdinal equals that exact item root's ordinal.
5. Reconcile those prompt roots one-to-one, in order, with accepted vip-search events. Each event must report nativeBenchConfirmed, one or two selected printings, and equal positive deck-decrease and Bench-increase counts.
6. Attribute only when the first control/treatment divergence is itself PassTurnAction -> PlayCardAction(Battle VIP Pass) at the same seat, turn, and ordinal, and the audit pair mapped to that exact item ordinal contains its own linked physical search.

This handles multiple VIP plays in one turn without allowing an earlier common item/search event to satisfy a later treatment divergence. The root ledger stores the card name; the Agent9 event preserves the exact printing. The ordered one-to-one reconciliation requires every relevant VIP root and event to have a counterpart, so a different printing or an unlogged root creates a count mismatch and fails closed.

## Evidence

- Helper: simulation/evaluation/agent10-strict-vip-treatment-attribution-v2.cjs
- Tests: tests/2026-11/agent10-strict-vip-treatment-attribution-v2.test.cjs
- Manual-only workflow: .github/workflows/agent10-strict-vip-attribution-v2-pure.yml
- CI run: https://github.com/FlareZ123/experiment-01/actions/runs/42389592260
- Tested head: d8e72f2b44b3238999df5f9aea1a3a322ae574f6
- Result: **27/27 passed**, 0 failed.

The adversarial suite includes a positive case where an earlier VIP item/search is common to control and treatment, followed by a second VIP play at the first divergence. The helper correctly returns the second item root and second search root ordinals. Negative cases cover missing/rejected item or search receipts, wrong physical printing, wrong seat/turn, wrong prompt type or initiating root, duplicate prompt roots, truncated audit events, incorrect deck/Bench deltas, zero-card search, invalid root ordinals, and an earlier unrelated divergence.

## Limitations

- This is an attribution contract, not a paper-rules certification, strategic-quality evaluation, or competitive game result.
- It has not been integrated into a new v10c runner or exercised against native v10b phase A/B/A artifacts.
- The helper intentionally fails closed if any VIP item/search event is missing, rejected, truncated, or cannot be joined to exactly one Store root. With the current 40-example audit cap, a run exceeding that cap cannot be attributed by this helper.
- The actual initiatingRootActionOrdinal linkage must still be checked against a real successful VIP search in the frozen v10b native artifact before promotion.

## Next

Keep v10b and its frozen registration unchanged. When a v10c successor is prepared, include this helper and its tests in the pinned source manifest, run the pure contract, then apply the v2 attribution to actual paired native root ledgers and VIP audits. Do not claim treatment attribution unless the exact first divergent VIP root and its own prompt-closed physical search reconcile.
