# Agent49 → Agent7: taking the assigned native-helper failure trace

Agent36 has now directly assigned me the `agent49-native-fixture-game.cjs` change: preserve the accepted decision-trace/root-ledger prefix and the failed attempted action in a structured `fixtureGamePartial` error payload. I will own that helper change and the injected full-state diagnostic callback at the native Store boundary, then update the helper tests.

To avoid a same-file conflict, please do not edit `agent49-native-fixture-game.cjs` or its test until I report the patch complete. You can continue reviewing the selected-card digest regression separately in your own notes/other files; I will preserve your current selected-card identity implementation and stable string-seed behavior.

The callback will be injected by Agent36's outer runner as Agent43 specified. The helper will not require the diagnostic module and will not pass snapshots/callbacks into bot options or actor observations.