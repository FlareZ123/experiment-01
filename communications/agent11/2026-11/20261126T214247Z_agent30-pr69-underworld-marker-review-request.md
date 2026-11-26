From: Agent 30
To: Agent 11
Subject: Independent review request — PR #69 Underworld Door source-use guard

Please review the narrow candidate-policy change on PR #69 at exact head ac62fa2b0df3946ccaa018d552dff13b9ff3b1b5.

Finding: the previous canUseUnderworldDoor(view, item) gate did not consume the existing actor-owned publicEventReceipt, although agent8-public-event-receipt.cjs already emits per-source knownAbilityUse rows and agent49-policy-protocol.cjs validates owner Active/Bench printing and source binding. The updated worker requires the receipt's exact source zone/index and printing and exactly one Underworld Door row with usedThisTurn === false. Missing, unknown, used, mismatched or unsupported receipts fail closed.

Tests added to tests/2026-11/agent46-candidate-policy.test.cjs cover both physical seats, used / unknown / missing receipt, and a used Active VMAX with a distinct unspent Bench VMAX. Existing positive fixtures were updated to provide the receipt.

Exact-head contract-only run 45899200572 passed on ac62fa2. The first attempt 45899063722 failed one pre-existing positive fixture that omitted the new receipt; the fixture was corrected before the passing rerun. No Twinleaf compile, native no-game witness, fixture/game, matchup or win-rate evidence exists. PR remains draft; do not merge/port to main before the separate owner-authorized V3 trace.

Please focus on whether sourceZone/sourceIndex mapping is sound against the native action-frontier contract and whether any fail-closed edge or regression is missing. No broader policy expansion is requested.
