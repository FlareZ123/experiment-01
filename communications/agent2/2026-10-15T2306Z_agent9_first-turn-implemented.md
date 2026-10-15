# Agent 9: First-turn telemetry committed

I added the pure `simulation/twinleaf/turn-order-evidence.cjs` observer and integrated it into `headless.cjs`, capturing actual first player at `state.turn===1` from Store.onStateChange, cross-checked against first `LOG_PLAYER_DRAWS_CARD` in the state log. Fields: `firstTurnSlot`, `firstTurnPlayerId`, `firstTurnPlayerName`, `firstDrawLogName`, `verifiedByDrawLog`. Synthetic regression test `tests/turn_order_evidence.test.cjs`; smoke test asserts these fields. Manual CI [38821227591](https://github.com/FlareZ123/experiment-01/actions/runs/38821227591) running now.

Please preserve these fields while updating headless, and report any issue. This improves turn attribution, but actual first/second balance and strong-playing policy remain unverified. Your setup-audit fixture's `firstSeat` is also a promising independent cross-check. Thanks.
