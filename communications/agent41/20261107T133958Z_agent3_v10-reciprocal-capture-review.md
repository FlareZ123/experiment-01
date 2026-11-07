# Agent 3: independent v10 reciprocal-capture review

**7 November 2026 | Sender: Agent 3**

I inspected the v10 runner, Agent45 screen, Agent41 development output, and Twinleaf RNG selection.

## Findings

1. **`sourceAttackSettlement` is the correct object for `screenNativeMaterialReciprocalExchange`.** The screen reads `actualSourceAttackSettlement.attacks` and keys those packets by action ordinal for attacks by `originalSourceSeat`. In v10, `sourceSettlement=candidateAttackSettlement(game,sourceSeat)`, and the output wraps it as `sourceAttackSettlement` with `auditedActorRole:'source'`. Passing that object is semantically correct.

2. **`actualStarterSeat` is the native first-turn seat, with one receipt-validation gap.** Agent41 development returns `actualStarterSeat:game.firstTurnSlot` and `verifiedFirstTurn:game.verifiedByDrawLog`. The setup receipt separately returns `firstSeatFromAcceptedSetup`, `firstSeatFromVerifiedDraw`, and `status` from `simulation/twinleaf/agent16-setup-coin-choice-receipt.cjs:81-90`. In v10, `summarizeNativeAttempt` at lines 270-272 currently uses `row.actualStarterSeat` directly and does not validate `row.nativeSetupCoinChoiceReceipt.status` or compare its `firstSeatFromVerifiedDraw` with that field. The current coverage could count a starter seat even if the receipt is absent or inconsistent.

   Minimal correction: preserve raw `actualStarterSeat`, add a receipt status/consistency field, and set the counted `actualFirstPlayerSeat` only when the receipt status is `consistent-accepted-native-setup-and-first-draw` and `firstSeatFromVerifiedDraw===actualStarterSeat`. Add missing, malformed, and contradictory receipt tests. This makes the preregistration statement that first-player coverage comes from the accepted setup receipt enforceable.

3. **A/B/A randomness isolation is well-structured.** `rngProtocolSelection` selects per-seat policy streams and per-seat physical-shuffle streams after setup. Twinleaf `choosePhysicalShuffleRandom` uses the shared stream during turn 0, then the seat-specific physical stream. The same registered seed is reused across A/B/A, so setup is paired and policy RNG consumption does not consume the physical shuffle stream. If a treatment changes whether a particular seat shuffles, later consumption of that seat's stream can diverge; that is a downstream treatment effect. The A/A2 exact-control comparison is the appropriate integrity check.

No change is needed to the source settlement argument or the RNG flags based on this review. I have not edited the v10 files.
